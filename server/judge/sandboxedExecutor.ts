// Sandboxed C++ executor for MVP / shared previews.
//
// Runs untrusted code under bubblewrap (bwrap) + prlimit:
//   - bwrap: new mount/PID/IPC/UTS namespaces, --unshare-net (no network),
//     /etc not bound (so /etc/passwd, /etc/shadow, etc. aren't visible),
//     tmpfs for /tmp, only the compiled artifact bind-mounted at /sandbox/sol.
//   - prlimit: address-space (memory) and CPU-time hard limits.
//
// Not a substitute for a real production judge (e.g., Docker/Firecracker with
// seccomp filters + cgroup memory.high), but adequate to safely host a public
// preview where untrusted code is executed.
//
// SECURITY NOTE: Requires bubblewrap to be installed on the host
// (`apt-get install bubblewrap`). The Vercel/serverless deployment path cannot
// run this executor — only persistent VMs with `bwrap` available can.

import { spawn } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';
import type { CompileResult, JudgeExecutor, RunInput, RunResult } from './types';

const COMPILER = process.env.JUDGE_CPP_COMPILER || 'g++';
const BWRAP = process.env.JUDGE_BWRAP_BIN || 'bwrap';
const PRLIMIT = process.env.JUDGE_PRLIMIT_BIN || 'prlimit';

async function runProcess(
  cmd: string,
  args: string[],
  opts: { cwd?: string; stdin?: string; timeoutMs?: number; outputLimitBytes?: number; env?: NodeJS.ProcessEnv } = {}
): Promise<{ code: number | null; signal: NodeJS.Signals | null; stdout: string; stderr: string; timedOut: boolean; outputExceeded: boolean; elapsedMs: number }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const child = spawn(cmd, args, { cwd: opts.cwd, env: opts.env ?? process.env });
    let stdout = '';
    let stderr = '';
    let outputExceeded = false;
    let timedOut = false;
    const limit = opts.outputLimitBytes ?? 10 * 1024 * 1024;
    child.stdout.on('data', (chunk: Buffer) => {
      if (stdout.length > limit) {
        outputExceeded = true;
        child.kill('SIGKILL');
        return;
      }
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk: Buffer) => {
      if (stderr.length < limit) stderr += chunk.toString();
    });
    let timer: NodeJS.Timeout | undefined;
    if (opts.timeoutMs) {
      timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, opts.timeoutMs);
    }
    child.stdin.on('error', () => {});
    if (opts.stdin != null) {
      child.stdin.end(opts.stdin);
    } else {
      child.stdin.end();
    }
    child.on('error', (err) => {
      if (timer) clearTimeout(timer);
      resolve({ code: null, signal: null, stdout, stderr: stderr + String(err), timedOut, outputExceeded, elapsedMs: Date.now() - start });
    });
    child.on('close', (code, signal) => {
      if (timer) clearTimeout(timer);
      resolve({ code, signal, stdout, stderr, timedOut, outputExceeded, elapsedMs: Date.now() - start });
    });
  });
}

class SandboxedCppExecutor implements JudgeExecutor {
  name = 'sandboxed-cpp';

  async compileCpp(source: string): Promise<CompileResult> {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ctoj-sb-'));
    const src = path.join(dir, 'sol.cpp');
    const bin = path.join(dir, 'sol');
    await fs.writeFile(src, source, 'utf8');
    const result = await runProcess(
      COMPILER,
      ['-O2', '-std=c++17', '-static', '-o', bin, src],
      { timeoutMs: 15000 }
    );
    if (result.code !== 0) {
      const fallback = await runProcess(
        COMPILER,
        ['-O2', '-std=c++17', '-o', bin, src],
        { timeoutMs: 15000 }
      );
      if (fallback.code !== 0) {
        return {
          ok: false,
          log: result.stderr + '\n' + fallback.stderr,
          cleanup: () => fs.rm(dir, { recursive: true, force: true })
        };
      }
    }
    return {
      ok: true,
      log: '',
      artifactPath: bin,
      cleanup: () => fs.rm(dir, { recursive: true, force: true })
    };
  }

  async run(input: RunInput): Promise<RunResult> {
    const id = randomUUID();
    const memBytes = Math.max(64, input.memoryLimitMb) * 1024 * 1024;
    // prlimit --as enforces an address-space ceiling; --cpu adds a CPU-time
    // cap (whole seconds) just slightly above the wall-clock TLE so the
    // process can't pin a core indefinitely.
    const cpuSec = Math.max(2, Math.ceil(input.timeLimitMs / 1000) + 1);
    const bwrapArgs: string[] = [
      `--as=${memBytes}`,
      `--cpu=${cpuSec}`,
      '--',
      BWRAP,
      // Minimal read-only system layout — NO /etc bind so /etc/passwd etc.
      // are not visible from inside the sandbox.
      '--ro-bind', '/usr', '/usr',
      '--ro-bind', '/lib', '/lib',
      '--ro-bind', '/lib64', '/lib64',
      '--ro-bind', '/bin', '/bin',
      '--ro-bind', '/etc/ld.so.cache', '/etc/ld.so.cache',
      '--proc', '/proc',
      '--dev', '/dev',
      '--tmpfs', '/tmp',
      '--bind', input.artifactPath, '/sandbox/sol',
      '--chdir', '/sandbox',
      '--unshare-net',
      '--unshare-pid',
      '--unshare-user',
      '--unshare-uts',
      '--unshare-ipc',
      '--die-with-parent',
      '--new-session',
      '--hostname', 'sandbox',
      '/sandbox/sol'
    ];
    const sandboxEnv: NodeJS.ProcessEnv = { PATH: '/usr/bin:/bin', LANG: 'C', TMPDIR: '/tmp', NODE_ENV: process.env.NODE_ENV };
    const result = await runProcess(PRLIMIT, bwrapArgs, {
      stdin: input.input,
      timeoutMs: input.timeLimitMs,
      outputLimitBytes: input.outputLimitKb * 1024,
      env: sandboxEnv
    });
    if (result.outputExceeded) {
      return { verdict: 'OUTPUT_LIMIT_EXCEEDED', stdout: result.stdout, stderr: result.stderr, runtimeMs: result.elapsedMs, message: `run ${id}` };
    }
    if (result.timedOut) {
      return { verdict: 'TIME_LIMIT_EXCEEDED', stdout: result.stdout, stderr: result.stderr, runtimeMs: result.elapsedMs };
    }
    // prlimit kills with SIGKILL on CPU exceeded; bad_alloc on memory cap
    // surfaces as a non-zero exit. Distinguish MLE heuristically.
    if (result.code !== 0) {
      const looksLikeMle =
        /std::bad_alloc|out of memory|virtual memory exhausted|cannot allocate/i.test(result.stderr) ||
        result.signal === 'SIGKILL' && result.elapsedMs < input.timeLimitMs * 0.9;
      return {
        verdict: looksLikeMle ? 'MEMORY_LIMIT_EXCEEDED' : 'RUNTIME_ERROR',
        stdout: result.stdout,
        stderr: result.stderr,
        runtimeMs: result.elapsedMs,
        message: `exit code ${result.code ?? 'unknown'} signal ${result.signal ?? '-'}`
      };
    }
    return { verdict: 'ACCEPTED', stdout: result.stdout, stderr: result.stderr, runtimeMs: result.elapsedMs };
  }
}

export const sandboxedCppExecutor: JudgeExecutor = new SandboxedCppExecutor();
