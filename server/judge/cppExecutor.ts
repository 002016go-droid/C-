// Local C++ executor for MVP. Runs g++ on the host machine. The architecture
// is identical to a Docker-based executor: compile + run with timeouts/limits.
//
// SECURITY NOTE: This local executor is for development/MVP only. For
// production, swap with a Docker sandbox that disables network, restricts
// CPU/memory/output, and isolates the filesystem. Drop a new module implementing
// JudgeExecutor and pick it in `server/judge/index.ts` via JUDGE_MODE env.

import { spawn } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';
import type { CompileResult, JudgeExecutor, RunInput, RunResult } from './types';

const COMPILER = process.env.JUDGE_CPP_COMPILER || 'g++';

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

class LocalCppExecutor implements JudgeExecutor {
  name = 'local-cpp';

  async compileCpp(source: string): Promise<CompileResult> {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ctoj-'));
    const src = path.join(dir, 'sol.cpp');
    const bin = path.join(dir, 'sol');
    await fs.writeFile(src, source, 'utf8');
    const result = await runProcess(
      COMPILER,
      ['-O2', '-std=c++17', '-static', '-o', bin, src],
      { timeoutMs: 15000 }
    );
    if (result.code !== 0) {
      // Try without static linking (some systems lack static libstdc++)
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
    const sandboxEnv: NodeJS.ProcessEnv = { PATH: '/usr/bin:/bin', LANG: 'C', TMPDIR: '/tmp', NODE_ENV: process.env.NODE_ENV };
    const result = await runProcess(input.artifactPath, [], {
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
    if (result.code !== 0) {
      return {
        verdict: 'RUNTIME_ERROR',
        stdout: result.stdout,
        stderr: result.stderr,
        runtimeMs: result.elapsedMs,
        message: `exit code ${result.code ?? 'unknown'} signal ${result.signal ?? '-'}`
      };
    }
    return { verdict: 'ACCEPTED', stdout: result.stdout, stderr: result.stderr, runtimeMs: result.elapsedMs };
  }
}

export const cppExecutor: JudgeExecutor = new LocalCppExecutor();
