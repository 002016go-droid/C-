import type { JudgeExecutor } from './types';
import { cppExecutor } from './cppExecutor';
import { mockExecutor } from './mockExecutor';

export function getExecutor(): JudgeExecutor {
  const mode = (process.env.JUDGE_MODE || 'local').toLowerCase();
  if (mode === 'mock') return mockExecutor;
  // 'local' is the default for MVP. 'docker' executor is reserved for a
  // future implementation (see server/judge/cppExecutor.ts header).
  return cppExecutor;
}

export type { JudgeExecutor } from './types';
