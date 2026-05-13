// Problem definition used by the seeder. The seeder compiles `cppCode` with g++
// and runs it on each generated input to produce the expected output, so the
// solution is the source of truth.
export interface SubtaskDef {
  name: string;
  points: number;
  order: number; // 1..N
  constraints: string;
}

export interface TestSpec {
  /** 1-based order within problem */
  order: number;
  /** 1-based subtask index (matches SubtaskDef.order) */
  subtaskOrder: number;
  isSample: boolean;
  input: string;
}

export interface EditorialDef {
  idea: string;
  observations: string;
  approach: string;
  algorithmAnalysis: string;
  timeComplexity: string;
  memoryComplexity: string;
  cppCode: string;
  codeExplanation: string;
  commonMistakes: string;
}

export interface ProblemDef {
  code: string;
  title: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  notes?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';
  timeLimitMs: number;
  memoryLimitMb: number;
  outputLimitKb: number;
  totalPoints: number;
  fileIoEnabled: boolean;
  fileInputName?: string | null;
  fileOutputName?: string | null;
  showEditorial: boolean;
  isPublished: boolean;
  provinceCode?: string | null;
  examYear?: number | null;
  source?: string | null;
  tagSlugs: string[];
  subtasks: SubtaskDef[];
  /** Function producing 30 test specs (3 samples + 27 hidden) */
  generateTests: () => TestSpec[];
  editorial: EditorialDef;
}

export interface ContestDef {
  code: string;
  title: string;
  description?: string;
  durationMin: number;
  totalPoints: number; // displayed (10)
  problemCodes: string[]; // 4 problems
  problemPoints: number[]; // [3,3,2,2]
  provinceCode?: string | null;
  examYear?: number | null;
}
