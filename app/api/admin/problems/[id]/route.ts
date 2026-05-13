import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/session';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Chỉ admin' }, { status: 403 }); }
  const p = await prisma.problem.findUnique({
    where: { id: params.id },
    include: {
      tags: { include: { tag: true } },
      subtasks: { orderBy: { order: 'asc' }, include: { testCases: { orderBy: { order: 'asc' } } } },
      testCases: { orderBy: { order: 'asc' } },
      editorial: true,
      province: true,
      examYear: true
    }
  });
  if (!p) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  return NextResponse.json({ problem: p });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Chỉ admin' }, { status: 403 }); }
  await prisma.problem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
