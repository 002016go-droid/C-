// Fallback mock executor used when local g++ is unavailable. It performs
// extremely simple heuristics so that integration tests / preview deploys can
// still demonstrate end-to-end submission flow.
import type { CompileResult, JudgeExecutor, RunInput, RunResult } from './types';

class MockExecutor implements JudgeExecutor {
  name = 'mock';
  async compileCpp(source: string): Promise<CompileResult> {
    if (!source || !/main\s*\(/.test(source)) {
      return { ok: false, log: 'Mock compile error: missing main()' };
    }
    return { ok: true, log: '', artifactPath: 'mock://artifact' };
  }
  async run(input: RunInput): Promise<RunResult> {
    // Echo first line back as a rough heuristic
    const first = input.input.split('\n').slice(0, 1).join('\n').trim();
    return { verdict: 'ACCEPTED', stdout: first, stderr: '', runtimeMs: 1 };
  }
}

export const mockExecutor: JudgeExecutor = new MockExecutor();
