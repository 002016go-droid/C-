import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/session';

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Chỉ admin' }, { status: 403 }); }
  const items = await prisma.problemComment.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 200,
    include: { user: { select: { email: true } }, problem: { select: { code: true, title: true } } }
  });
  return NextResponse.json({ items });
}

const patchSchema = z.object({ id: z.string(), status: z.enum(['VISIBLE', 'HIDDEN']).optional(), delete: z.boolean().optional() });
export async function PATCH(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Chỉ admin' }, { status: 403 }); }
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  if (parsed.data.delete) {
    await prisma.problemComment.delete({ where: { id: parsed.data.id } });
  } else if (parsed.data.status) {
    await prisma.problemComment.update({ where: { id: parsed.data.id }, data: { status: parsed.data.status } });
  }
  return NextResponse.json({ ok: true });
}
