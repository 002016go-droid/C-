import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const province = url.searchParams.get('province') || '';
  const year = url.searchParams.get('year');
  const tag = url.searchParams.get('tag') || '';
  const difficulty = url.searchParams.get('difficulty') || '';
  const status = url.searchParams.get('status') || ''; // all|todo|tried|ac
  const sort = url.searchParams.get('sort') || 'newest'; // newest|rating|ac|hardest

  const where: any = { isPublished: true };
  if (q) where.OR = [
    { title: { contains: q } },
    { code: { contains: q } }
  ];
  if (province) where.province = { code: province };
  if (year) where.examYear = { year: Number(year) };
  if (tag) where.tags = { some: { tag: { slug: tag } } };
  if (difficulty) where.difficulty = difficulty;

  const user = await getCurrentUser();
  const problems = await prisma.problem.findMany({
    where,
    orderBy: sort === 'newest' ? { createdAt: 'desc' } : { createdAt: 'desc' },
    include: {
      tags: { include: { tag: true } },
      province: true,
      examYear: true,
      ratings: { select: { stars: true } },
      submissions: { select: { id: true, status: true, userId: true } }
    },
    take: 200
  });

  const items = problems.map((p) => {
    const ratingValues = p.ratings.map((r) => r.stars);
    const avgRating = ratingValues.length ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length : 0;
    const ratingCount = ratingValues.length;
    const totalSubs = p.submissions.length;
    const acSubs = p.submissions.filter((s) => s.status === 'ACCEPTED').length;
    const acRate = totalSubs ? acSubs / totalSubs : 0;
    let userStatus: 'TODO' | 'TRIED' | 'AC' = 'TODO';
    if (user?.id) {
      const mine = p.submissions.filter((s) => s.userId === user.id);
      if (mine.some((s) => s.status === 'ACCEPTED')) userStatus = 'AC';
      else if (mine.length) userStatus = 'TRIED';
    }
    return {
      id: p.id,
      code: p.code,
      title: p.title,
      difficulty: p.difficulty,
      province: p.province ? { code: p.province.code, name: p.province.name } : null,
      examYear: p.examYear?.year ?? null,
      tags: p.tags.map((t) => ({ slug: t.tag.slug, name: t.tag.name })),
      avgRating,
      ratingCount,
      totalSubs,
      acRate,
      userStatus
    };
  });

  let filtered = items;
  if (status === 'todo') filtered = filtered.filter((i) => i.userStatus === 'TODO');
  else if (status === 'tried') filtered = filtered.filter((i) => i.userStatus === 'TRIED');
  else if (status === 'ac') filtered = filtered.filter((i) => i.userStatus === 'AC');

  if (sort === 'rating') filtered.sort((a, b) => b.avgRating - a.avgRating);
  else if (sort === 'ac') filtered.sort((a, b) => b.acRate - a.acRate);
  else if (sort === 'hardest') filtered.sort((a, b) => a.acRate - b.acRate);

  return NextResponse.json({ items: filtered });
}
