export const DIFFICULTY = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
  VERY_HARD: 'VERY_HARD'
} as const;

export const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: 'Dễ',
  MEDIUM: 'Trung bình',
  HARD: 'Khó',
  VERY_HARD: 'Rất khó'
};

export const VERDICT_LABEL: Record<string, string> = {
  PENDING: 'Đang chờ',
  JUDGING: 'Đang chấm',
  ACCEPTED: 'Accepted',
  WRONG_ANSWER: 'Wrong Answer',
  TIME_LIMIT_EXCEEDED: 'TLE',
  MEMORY_LIMIT_EXCEEDED: 'MLE',
  RUNTIME_ERROR: 'Runtime Error',
  COMPILATION_ERROR: 'Compilation Error',
  OUTPUT_LIMIT_EXCEEDED: 'Output Limit Exceeded',
  SYSTEM_ERROR: 'System Error'
};

export const VERDICT_COLOR: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  JUDGING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  WRONG_ANSWER: 'bg-red-100 text-red-800',
  TIME_LIMIT_EXCEEDED: 'bg-orange-100 text-orange-800',
  MEMORY_LIMIT_EXCEEDED: 'bg-orange-100 text-orange-800',
  RUNTIME_ERROR: 'bg-rose-100 text-rose-800',
  COMPILATION_ERROR: 'bg-rose-100 text-rose-800',
  OUTPUT_LIMIT_EXCEEDED: 'bg-orange-100 text-orange-800',
  SYSTEM_ERROR: 'bg-gray-200 text-gray-800',
  SKIPPED: 'bg-gray-100 text-gray-600'
};

export const REPORT_TYPE_LABEL: Record<string, string> = {
  STATEMENT: 'Lỗi đề bài',
  SAMPLE_IO: 'Lỗi input/output mẫu',
  HIDDEN_TEST: 'Lỗi test ẩn',
  EDITORIAL: 'Lỗi lời giải',
  SAMPLE_CODE: 'Lỗi code mẫu',
  DIFFICULTY: 'Lỗi phân loại độ khó',
  OTHER: 'Lỗi khác'
};

export const REPORT_STATUS_LABEL: Record<string, string> = {
  NEW: 'Mới',
  IN_PROGRESS: 'Đang xử lý',
  RESOLVED: 'Đã xử lý',
  REJECTED: 'Từ chối'
};

export const REGIONS = ['Miền Trung', 'Miền Bắc', 'Miền Nam'] as const;

export const ALGORITHM_TOPICS = [
  { slug: 'so-hoc', name: 'Số học' },
  { slug: 'mang', name: 'Mảng' },
  { slug: 'xau', name: 'Xâu' },
  { slug: 'sap-xep', name: 'Sắp xếp và tìm kiếm' },
  { slug: 'prefix-sum', name: 'Prefix sum' },
  { slug: 'hai-con-tro', name: 'Hai con trỏ' },
  { slug: 'tham-lam', name: 'Tham lam' },
  { slug: 'qhd', name: 'Quy hoạch động cơ bản' },
  { slug: 'de-quy', name: 'Đệ quy/Quay lui' },
  { slug: 'bfs-dfs', name: 'BFS/DFS cơ bản' },
  { slug: 'stack-queue', name: 'Stack/Queue/Map/Set' }
];
