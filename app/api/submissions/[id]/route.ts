import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  const sub = await prisma.submission.findUnique({
    where: { id: params.id },
    include: {
      problem: { select: { code: true, title: true, totalPoints: true } },
      results: {
        include: {
          subtask: { select: { id: true, name: true, points: true, order: true } },
          testCase: { select: { id: true, order: true, isSample: true } }
        }
      }
    }
  });
  if (!sub) return NextResponse.json({ error: 'Không tìm thấy submission' }, { status: 404 });
  const isOwner = me?.id === sub.userId;
  const isAdmin = me?.role === 'ADMIN';
  // Aggregate results by subtask (hide details of hidden tests; only show order/isSample)
  return NextResponse.json({
    submission: {
      id: sub.id,
      problemCode: sub.problem.code,
      problemTitle: sub.problem.title,
      status: sub.status,
      verdict: sub.verdict,
      totalScore: sub.totalScore,
      maxScore: sub.maxScore,
      runtimeMs: sub.runtimeMs,
      compileLog: isOwner || isAdmin ? sub.compileLog : null,
      judgeMessage: isOwner || isAdmin ? sub.judgeMessage : null,
      sourceCode: isOwner || isAdmin ? sub.sourceCode : null,
      createdAt: sub.createdAt,
      results: sub.results.map((r) => ({
        verdict: r.verdict,
        points: r.points,
        runtimeMs: r.runtimeMs,
        memoryKb: r.memoryKb,
        isSubtaskAggregate: r.isSubtaskAggregate,
        subtask: r.subtask ? { id: r.subtask.id, name: r.subtask.name, points: r.subtask.points, order: r.subtask.order } : null,
        testCase: r.testCase ? { order: r.testCase.order, isSample: r.testCase.isSample } : null
      }))
    }
  });
}
