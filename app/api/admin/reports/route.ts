import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/session';

export async function GET(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Chỉ admin' }, { status: 403 }); }
  const url = new URL(req.url);
  const status = url.searchParams.get('status') || '';
  const type = url.searchParams.get('type') || '';
  const where: any = {};
  if (status) where.status = status;
  if (type) where.type = type;
  const items = await prisma.problemReport.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true, name: true } }, problem: { select: { code: true, title: true } } }
  });
  return NextResponse.json({ items });
}

const patchSchema = z.object({ id: z.string(), status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']), adminNote: z.string().optional() });
export async function PATCH(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Chỉ admin' }, { status: 403 }); }
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  const d = parsed.data;
  await prisma.problemReport.update({
    where: { id: d.id },
    data: {
      status: d.status,
      adminNote: d.adminNote ?? '',
      resolvedAt: d.status === 'RESOLVED' || d.status === 'REJECTED' ? new Date() : null
    }
  });
  return NextResponse.json({ ok: true });
}
