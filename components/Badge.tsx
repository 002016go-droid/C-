import { cn } from '@/lib/util';

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('badge bg-gray-100 text-gray-700', className)}>{children}</span>;
}

export function DifficultyBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    EASY: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HARD: 'bg-orange-100 text-orange-800',
    VERY_HARD: 'bg-rose-100 text-rose-800'
  };
  const label: Record<string, string> = {
    EASY: 'Dễ',
    MEDIUM: 'Trung bình',
    HARD: 'Khó',
    VERY_HARD: 'Rất khó'
  };
  return <span className={cn('badge', map[value] || 'bg-gray-100 text-gray-700')}>{label[value] || value}</span>;
}

export function VerdictBadge({ value }: { value?: string | null }) {
  if (!value) return <Badge>—</Badge>;
  const map: Record<string, string> = {
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
  const label: Record<string, string> = {
    PENDING: 'Đang chờ',
    JUDGING: 'Đang chấm',
    ACCEPTED: 'Accepted',
    WRONG_ANSWER: 'Wrong Answer',
    TIME_LIMIT_EXCEEDED: 'TLE',
    MEMORY_LIMIT_EXCEEDED: 'MLE',
    RUNTIME_ERROR: 'Runtime Error',
    COMPILATION_ERROR: 'Compilation Error',
    OUTPUT_LIMIT_EXCEEDED: 'Output Limit Exceeded',
    SYSTEM_ERROR: 'System Error',
    SKIPPED: 'Skipped'
  };
  return <span className={cn('badge', map[value] || 'bg-gray-100 text-gray-700')}>{label[value] || value}</span>;
}
