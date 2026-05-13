import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const c = await prisma.contest.findUnique({
    where: { code: params.code },
    include: { problems: { include: { problem: { select: { id: true, code: true, title: true, difficulty: true, totalPoints: true } } }, orderBy: { order: 'asc' } } }
  });
  if (!c || !c.isPublished) return NextResponse.json({ error: 'Không tìm thấy đề' }, { status: 404 });
  const subs = await prisma.submission.findMany({
    where: { contestId: c.id },
    select: { userId: true, problemId: true, totalScore: true, status: true }
  });
  const byUser: Record<string, Record<string, number>> = {};
  for (const s of subs) {
    byUser[s.userId] ??= {};
    byUser[s.userId][s.problemId] = Math.max(byUser[s.userId][s.problemId] ?? 0, s.totalScore);
  }
  const users = await prisma.user.findMany({ where: { id: { in: Object.keys(byUser) } }, select: { id: true, name: true, email: true } });
  const ranking = users.map((u) => {
    const scores = byUser[u.id] || {};
    let total = 0;
    for (const cp of c.problems) {
      const raw = scores[cp.problem.id] || 0;
      const fraction = raw / Math.max(1, cp.problem.totalPoints);
      total += fraction * cp.points;
    }
    return { userId: u.id, name: u.name || u.email, total: Number(total.toFixed(2)) };
  }).sort((a, b) => b.total - a.total);
  return NextResponse.json({
    contest: {
      id: c.id,
      code: c.code,
      title: c.title,
      description: c.description,
      durationMin: c.durationMin,
      totalPoints: c.totalPoints,
      hasRanking: c.hasRanking,
      problems: c.problems.map((cp) => ({
        order: cp.order,
        points: cp.points,
        code: cp.problem.code,
        title: cp.problem.title,
        difficulty: cp.problem.difficulty
      }))
    },
    ranking: c.hasRanking ? ranking : []
  });
}
