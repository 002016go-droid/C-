import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const contests = await prisma.contest.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    include: { problems: { include: { problem: { select: { code: true, title: true } } }, orderBy: { order: 'asc' } } }
  });
  return NextResponse.json({
    items: contests.map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      description: c.description,
      durationMin: c.durationMin,
      totalPoints: c.totalPoints,
      problems: c.problems.map((p) => ({ order: p.order, points: p.points, code: p.problem.code, title: p.problem.title }))
    }))
  });
}
