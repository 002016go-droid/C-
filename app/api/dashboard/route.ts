import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';

export async function GET() {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'Đăng nhập để xem dashboard' }, { status: 401 }); }

  const [progresses, recent] = await Promise.all([
    prisma.userProblemProgress.findMany({
      where: { userId: user.id! },
      include: { problem: { include: { tags: { include: { tag: true } } } } }
    }),
    prisma.submission.findMany({
      where: { userId: user.id! },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { problem: { select: { code: true, title: true } } }
    })
  ]);

  const tried = progresses.length;
  const solved = progresses.filter((p) => p.solved).length;
  const acRate = tried ? solved / tried : 0;

  // Topic strengths/weaknesses
  const topicStat: Record<string, { tried: number; solved: number; name: string }> = {};
  for (const p of progresses) {
    for (const t of p.problem.tags) {
      const slug = t.tag.slug;
      topicStat[slug] ??= { tried: 0, solved: 0, name: t.tag.name };
      topicStat[slug].tried += 1;
      if (p.solved) topicStat[slug].solved += 1;
    }
  }
  const topics = Object.entries(topicStat).map(([slug, s]) => ({
    slug,
    name: s.name,
    tried: s.tried,
    solved: s.solved,
    rate: s.tried ? s.solved / s.tried : 0
  }));
  topics.sort((a, b) => b.rate - a.rate);

  // Suggested problems: ones not yet solved, prioritize easier
  const triedIds = new Set(progresses.map((p) => p.problemId));
  const suggestions = await prisma.problem.findMany({
    where: { isPublished: true, id: { notIn: Array.from(triedIds) } },
    orderBy: [{ difficulty: 'asc' }, { createdAt: 'desc' }],
    take: 5,
    select: { id: true, code: true, title: true, difficulty: true }
  });

  return NextResponse.json({
    summary: {
      tried,
      solved,
      acRate,
      totalSubmissions: await prisma.submission.count({ where: { userId: user.id! } })
    },
    topics,
    recent: recent.map((s) => ({
      id: s.id,
      problemCode: s.problem.code,
      problemTitle: s.problem.title,
      status: s.status,
      totalScore: s.totalScore,
      maxScore: s.maxScore,
      createdAt: s.createdAt
    })),
    suggestions
  });
}
