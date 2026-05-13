import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/session';

const schema = z.object({
  problemId: z.string(),
  tests: z.array(z.object({
    id: z.string().optional(),
    order: z.number().int().min(1),
    isSample: z.boolean().default(false),
    input: z.string(),
    expectedOutput: z.string(),
    subtaskOrder: z.number().int().optional(),
    timeLimitMs: z.number().int().optional().nullable(),
    memoryLimitMb: z.number().int().optional().nullable()
  }))
});

export async function POST(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Chỉ admin' }, { status: 403 }); }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });

  const subtasks = await prisma.subtask.findMany({ where: { problemId: parsed.data.problemId }, orderBy: { order: 'asc' } });
  await prisma.testCase.deleteMany({ where: { problemId: parsed.data.problemId } });
  for (const t of parsed.data.tests) {
    const sub = t.subtaskOrder != null ? subtasks.find((s) => s.order === t.subtaskOrder) : undefined;
    await prisma.testCase.create({
      data: {
        problemId: parsed.data.problemId,
        subtaskId: sub?.id,
        order: t.order,
        isSample: t.isSample,
        input: t.input,
        expectedOutput: t.expectedOutput,
        timeLimitMs: t.timeLimitMs ?? null,
        memoryLimitMb: t.memoryLimitMb ?? null
      }
    });
  }
  return NextResponse.json({ ok: true });
}
