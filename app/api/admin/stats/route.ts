import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/session';

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Chỉ admin' }, { status: 403 }); }
  const [users, problems, submissions, ratings, reports] = await Promise.all([
    prisma.user.count(),
    prisma.problem.count(),
    prisma.submission.count(),
    prisma.problemRating.findMany({ select: { problemId: true, stars: true } }),
    prisma.problemReport.groupBy({ by: ['problemId'], _count: { _all: true } })
  ]);
  const ac = await prisma.submission.count({ where: { status: 'ACCEPTED' } });
  const acRate = submissions ? ac / submissions : 0;
  const mostSubmitted = await prisma.submission.groupBy({ by: ['problemId'], _count: { _all: true }, orderBy: { _count: { problemId: 'desc' } }, take: 5 });
  const mostSubmittedWithTitle = await Promise.all(mostSubmitted.map(async (m) => {
    const p = await prisma.problem.findUnique({ where: { id: m.problemId }, select: { code: true, title: true } });
    return { code: p?.code, title: p?.title, count: m._count._all };
  }));
  // Hardest by AC rate
  const subStats = await prisma.submission.groupBy({ by: ['problemId', 'status'], _count: { _all: true } });
  const map: Record<string, { total: number; ac: number }> = {};
  for (const s of subStats) {
    map[s.problemId] ??= { total: 0, ac: 0 };
    map[s.problemId].total += s._count._all;
    if (s.status === 'ACCEPTED') map[s.problemId].ac += s._count._all;
  }
  const hardestEntries = Object.entries(map).filter(([, v]) => v.total >= 1).sort((a, b) => (a[1].ac / a[1].total) - (b[1].ac / b[1].total)).slice(0, 5);
  const hardest = await Promise.all(hardestEntries.map(async ([pid, v]) => {
    const p = await prisma.problem.findUnique({ where: { id: pid }, select: { code: true, title: true } });
    return { code: p?.code, title: p?.title, acRate: v.total ? v.ac / v.total : 0 };
  }));
  // Top reported problems
  const topReported = await Promise.all(reports.sort((a, b) => b._count._all - a._count._all).slice(0, 5).map(async (r) => {
    const p = await prisma.problem.findUnique({ where: { id: r.problemId }, select: { code: true, title: true } });
    return { code: p?.code, title: p?.title, count: r._count._all };
  }));
  // Highest & lowest rated
  const ratingByProblem: Record<string, { sum: number; count: number }> = {};
  for (const r of ratings) {
    ratingByProblem[r.problemId] ??= { sum: 0, count: 0 };
    ratingByProblem[r.problemId].sum += r.stars;
    ratingByProblem[r.problemId].count += 1;
  }
  const ratingEntries = Object.entries(ratingByProblem).filter(([, v]) => v.count >= 1).map(([pid, v]) => ({ pid, avg: v.sum / v.count }));
  const topRated = await Promise.all(ratingEntries.sort((a, b) => b.avg - a.avg).slice(0, 5).map(async (e) => {
    const p = await prisma.problem.findUnique({ where: { id: e.pid }, select: { code: true, title: true } });
    return { code: p?.code, title: p?.title, avg: e.avg };
  }));
  const lowRated = await Promise.all(ratingEntries.sort((a, b) => a.avg - b.avg).slice(0, 5).map(async (e) => {
    const p = await prisma.problem.findUnique({ where: { id: e.pid }, select: { code: true, title: true } });
    return { code: p?.code, title: p?.title, avg: e.avg };
  }));
  // Top active users
  const topActive = await prisma.submission.groupBy({ by: ['userId'], _count: { _all: true }, orderBy: { _count: { userId: 'desc' } }, take: 5 });
  const topActiveWithName = await Promise.all(topActive.map(async (t) => {
    const u = await prisma.user.findUnique({ where: { id: t.userId }, select: { email: true, name: true } });
    return { user: u?.name || u?.email, count: t._count._all };
  }));
  return NextResponse.json({
    totals: { users, problems, submissions, acRate, ac },
    mostSubmitted: mostSubmittedWithTitle,
    hardest,
    topReported,
    topRated,
    lowRated,
    topActive: topActiveWithName
  });
}
