import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/session';

const upsertSchema = z.object({
  code: z.string().min(1).max(64),
  title: z.string().min(1).max(200),
  statement: z.string().min(1),
  inputFormat: z.string().min(1),
  outputFormat: z.string().min(1),
  constraints: z.string().min(1),
  notes: z.string().optional().default(''),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'VERY_HARD']),
  timeLimitMs: z.number().int().min(100).max(60_000).default(1000),
  memoryLimitMb: z.number().int().min(16).max(1024).default(256),
  outputLimitKb: z.number().int().min(64).max(102400).default(10240),
  totalPoints: z.number().int().min(1).max(1000).default(100),
  fileIoEnabled: z.boolean().default(false),
  fileInputName: z.string().optional().nullable(),
  fileOutputName: z.string().optional().nullable(),
  showEditorial: z.boolean().default(true),
  isPublished: z.boolean().default(true),
  provinceCode: z.string().optional().nullable(),
  examYear: z.number().int().optional().nullable(),
  source: z.string().optional().nullable(),
  tagSlugs: z.array(z.string()).default([])
});

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Chỉ admin' }, { status: 403 }); }
  const items = await prisma.problem.findMany({
    orderBy: { createdAt: 'desc' },
    include: { province: true, examYear: true, tags: { include: { tag: true } } }
  });
  return NextResponse.json({
    items: items.map((p) => ({
      id: p.id, code: p.code, title: p.title, difficulty: p.difficulty,
      isPublished: p.isPublished,
      province: p.province?.name ?? null,
      examYear: p.examYear?.year ?? null,
      tags: p.tags.map((t) => t.tag.name)
    }))
  });
}

export async function POST(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Chỉ admin' }, { status: 403 }); }
  const parsed = upsertSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message || 'Dữ liệu không hợp lệ' }, { status: 400 });
  const d = parsed.data;
  let provinceId: string | undefined;
  if (d.provinceCode) {
    const prov = await prisma.province.findUnique({ where: { code: d.provinceCode } });
    if (!prov) return NextResponse.json({ error: 'Tỉnh/thành không hợp lệ' }, { status: 400 });
    provinceId = prov.id;
  }
  let examYearId: string | undefined;
  if (d.examYear) {
    const ey = await prisma.examYear.upsert({ where: { year: d.examYear }, update: {}, create: { year: d.examYear } });
    examYearId = ey.id;
  }
  const existing = await prisma.problem.findUnique({ where: { code: d.code } });
  const problem = existing
    ? await prisma.problem.update({
        where: { id: existing.id },
        data: {
          title: d.title, statement: d.statement, inputFormat: d.inputFormat,
          outputFormat: d.outputFormat, constraints: d.constraints, notes: d.notes,
          difficulty: d.difficulty, timeLimitMs: d.timeLimitMs, memoryLimitMb: d.memoryLimitMb,
          outputLimitKb: d.outputLimitKb, totalPoints: d.totalPoints,
          fileIoEnabled: d.fileIoEnabled, fileInputName: d.fileInputName, fileOutputName: d.fileOutputName,
          showEditorial: d.showEditorial, isPublished: d.isPublished,
          provinceId: provinceId ?? null, examYearId: examYearId ?? null, source: d.source ?? null
        }
      })
    : await prisma.problem.create({
        data: {
          code: d.code, title: d.title, statement: d.statement, inputFormat: d.inputFormat,
          outputFormat: d.outputFormat, constraints: d.constraints, notes: d.notes,
          difficulty: d.difficulty, timeLimitMs: d.timeLimitMs, memoryLimitMb: d.memoryLimitMb,
          outputLimitKb: d.outputLimitKb, totalPoints: d.totalPoints,
          fileIoEnabled: d.fileIoEnabled, fileInputName: d.fileInputName, fileOutputName: d.fileOutputName,
          showEditorial: d.showEditorial, isPublished: d.isPublished,
          provinceId: provinceId ?? null, examYearId: examYearId ?? null, source: d.source ?? null
        }
      });
  // Sync tags
  await prisma.problemTag.deleteMany({ where: { problemId: problem.id } });
  for (const slug of d.tagSlugs) {
    const tag = await prisma.tag.findUnique({ where: { slug } });
    if (tag) await prisma.problemTag.create({ data: { problemId: problem.id, tagId: tag.id } });
  }
  return NextResponse.json({ id: problem.id });
}
