import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';

const schema = z.object({ problemCode: z.string(), stars: z.number().int().min(1).max(5) });

export async function POST(req: Request) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'Đăng nhập để đánh giá' }, { status: 401 }); }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  const problem = await prisma.problem.findUnique({ where: { code: parsed.data.problemCode } });
  if (!problem) return NextResponse.json({ error: 'Không tìm thấy bài' }, { status: 404 });
  await prisma.problemRating.upsert({
    where: { userId_problemId: { userId: user.id!, problemId: problem.id } },
    update: { stars: parsed.data.stars },
    create: { userId: user.id!, problemId: problem.id, stars: parsed.data.stars }
  });
  const all = await prisma.problemRating.findMany({ where: { problemId: problem.id }, select: { stars: true } });
  const avg = all.length ? all.reduce((a, b) => a + b.stars, 0) / all.length : 0;
  return NextResponse.json({ ok: true, avgRating: avg, ratingCount: all.length, myRating: parsed.data.stars });
}
