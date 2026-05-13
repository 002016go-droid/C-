// Types shared between judge executor implementations

export type Verdict =
  | 'PENDING'
  | 'JUDGING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'RUNTIME_ERROR'
  | 'COMPILATION_ERROR'
  | 'OUTPUT_LIMIT_EXCEEDED'
  | 'SYSTEM_ERROR'
  | 'SKIPPED';

export interface CompileResult {
  ok: boolean;
  log: string;
  /** Path to compiled binary if ok=true (executor-specific) */
  artifactPath?: string;
  cleanup?: () => Promise<void> | void;
}

export interface RunInput {
  artifactPath: string;
  input: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  outputLimitKb: number;
}

export interface RunResult {
  verdict: Verdict;
  stdout: string;
  stderr: string;
  runtimeMs: number;
  memoryKb?: number;
  message?: string;
}

export interface JudgeExecutor {
  name: string;
  compileCpp(source: string): Promise<CompileResult>;
  run(input: RunInput): Promise<RunResult>;
}
