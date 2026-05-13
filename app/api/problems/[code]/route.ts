import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const p = await prisma.problem.findUnique({
    where: { code: params.code },
    include: {
      tags: { include: { tag: true } },
      province: true,
      examYear: true,
      subtasks: { orderBy: { order: 'asc' } },
      testCases: { where: { isSample: true }, orderBy: { order: 'asc' } },
      editorial: true,
      ratings: { select: { stars: true } }
    }
  });
  if (!p || !p.isPublished) return NextResponse.json({ error: 'Không tìm thấy bài' }, { status: 404 });

  const stats = await prisma.submission.findMany({
    where: { problemId: p.id },
    select: { id: true, status: true, userId: true, totalScore: true }
  });
  const totalSubs = stats.length;
  const acSubs = stats.filter((s) => s.status === 'ACCEPTED').length;
  const acRate = totalSubs ? acSubs / totalSubs : 0;

  const user = await getCurrentUser();
  let myProgress: { hasSubmitted: boolean; solved: boolean; bestScore: number } | null = null;
  let myRating = 0;
  if (user?.id) {
    const mine = stats.filter((s) => s.userId === user.id);
    myProgress = {
      hasSubmitted: mine.length > 0,
      solved: mine.some((s) => s.status === 'ACCEPTED'),
      bestScore: mine.reduce((m, s) => Math.max(m, s.totalScore), 0)
    };
    const r = await prisma.problemRating.findUnique({ where: { userId_problemId: { userId: user.id, problemId: p.id } } });
    myRating = r?.stars ?? 0;
  }

  const ratingValues = p.ratings.map((r) => r.stars);
  const avgRating = ratingValues.length ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length : 0;

  // Compute "realDifficulty" heuristically based on AC rate and unsolved attempts.
  let realDifficulty = p.difficulty;
  if (totalSubs >= 5) {
    if (acRate >= 0.7) realDifficulty = 'EASY';
    else if (acRate >= 0.4) realDifficulty = 'MEDIUM';
    else if (acRate >= 0.15) realDifficulty = 'HARD';
    else realDifficulty = 'VERY_HARD';
  }

  const showEditorial = p.showEditorial && (!user?.id || myProgress?.hasSubmitted || user.role === 'ADMIN');

  return NextResponse.json({
    problem: {
      id: p.id,
      code: p.code,
      title: p.title,
      statement: p.statement,
      inputFormat: p.inputFormat,
      outputFormat: p.outputFormat,
      constraints: p.constraints,
      notes: p.notes,
      difficulty: p.difficulty,
      realDifficulty,
      timeLimitMs: p.timeLimitMs,
      memoryLimitMb: p.memoryLimitMb,
      outputLimitKb: p.outputLimitKb,
      totalPoints: p.totalPoints,
      fileIoEnabled: p.fileIoEnabled,
      fileInputName: p.fileInputName,
      fileOutputName: p.fileOutputName,
      province: p.province ? { code: p.province.code, name: p.province.name } : null,
      examYear: p.examYear?.year ?? null,
      source: p.source,
      tags: p.tags.map((t) => ({ slug: t.tag.slug, name: t.tag.name })),
      subtasks: p.subtasks.map((s) => ({ id: s.id, name: s.name, points: s.points, constraints: s.constraints })),
      samples: p.testCases.map((t) => ({ id: t.id, order: t.order, input: t.input, expectedOutput: t.expectedOutput })),
      editorial: showEditorial && p.editorial ? p.editorial : null,
      avgRating,
      ratingCount: ratingValues.length,
      totalSubs,
      acRate,
      myProgress,
      myRating
    }
  });
}
