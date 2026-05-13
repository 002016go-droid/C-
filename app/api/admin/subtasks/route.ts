import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/session';

const schema = z.object({
  problemId: z.string(),
  subtasks: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    points: z.number().int().min(0),
    order: z.number().int().min(0).default(0),
    constraints: z.string().optional().default('')
  }))
});

export async function POST(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Chỉ admin' }, { status: 403 }); }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  const total = parsed.data.subtasks.reduce((a, b) => a + b.points, 0);
  if (total !== 100) return NextResponse.json({ error: `Tổng điểm subtasks phải bằng 100 (hiện tại ${total})` }, { status: 400 });

  // Replace all subtasks
  await prisma.subtask.deleteMany({ where: { problemId: parsed.data.problemId } });
  for (const s of parsed.data.subtasks) {
    await prisma.subtask.create({
      data: {
        problemId: parsed.data.problemId,
        name: s.name,
        points: s.points,
        order: s.order,
        constraints: s.constraints
      }
    });
  }
  return NextResponse.json({ ok: true });
}
