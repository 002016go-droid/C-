// Simple in-process queue used both by the API submit handler (fire-and-forget)
// and the standalone worker (long-polling DB queue).
import { prisma } from '../../lib/db';
import { judgeSubmission } from './runner';

const inflight = new Set<string>();

export function enqueueSubmissionInline(submissionId: string) {
  if (inflight.has(submissionId)) return;
  inflight.add(submissionId);
  // Fire-and-forget; errors are persisted inside judgeSubmission
  setImmediate(async () => {
    try {
      await judgeSubmission(submissionId);
    } finally {
      inflight.delete(submissionId);
    }
  });
}

export async function pickPendingSubmission(): Promise<string | null> {
  const sub = await prisma.submission.findFirst({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' }
  });
  return sub?.id ?? null;
}
