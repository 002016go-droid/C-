import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/session';

const schema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().default(''),
  durationMin: z.number().int().min(15).max(600).default(150),
  totalPoints: z.number().int().min(1).default(10),
  hasRanking: z.boolean().default(true),
  isPublished: z.boolean().default(true),
  provinceCode: z.string().optional().nullable(),
  examYear: z.number().int().optional().nullable(),
  problems: z.array(z.object({ problemCode: z.string(), order: z.number().int(), points: z.number() }))
});

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Chỉ admin' }, { status: 403 }); }
  const items = await prisma.contest.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Chỉ admin' }, { status: 403 }); }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message || 'Dữ liệu không hợp lệ' }, { status: 400 });
  const d = parsed.data;
  let provinceId: string | undefined;
  if (d.provinceCode) {
    const p = await prisma.province.findUnique({ where: { code: d.provinceCode } });
    if (p) provinceId = p.id;
  }
  const existing = await prisma.contest.findUnique({ where: { code: d.code } });
  const contest = existing
    ? await prisma.contest.update({ where: { id: existing.id }, data: { title: d.title, description: d.description, durationMin: d.durationMin, totalPoints: d.totalPoints, hasRanking: d.hasRanking, isPublished: d.isPublished, provinceId: provinceId ?? null, examYear: d.examYear ?? null } })
    : await prisma.contest.create({ data: { code: d.code, title: d.title, description: d.description, durationMin: d.durationMin, totalPoints: d.totalPoints, hasRanking: d.hasRanking, isPublished: d.isPublished, provinceId: provinceId ?? null, examYear: d.examYear ?? null } });
  await prisma.contestProblem.deleteMany({ where: { contestId: contest.id } });
  for (const cp of d.problems) {
    const p = await prisma.problem.findUnique({ where: { code: cp.problemCode } });
    if (!p) continue;
    await prisma.contestProblem.create({ data: { contestId: contest.id, problemId: p.id, order: cp.order, points: cp.points } });
  }
  return NextResponse.json({ id: contest.id });
}
