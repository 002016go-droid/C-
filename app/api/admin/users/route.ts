import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/session';

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Chỉ admin' }, { status: 403 }); }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, name: true, role: true, isBanned: true, createdAt: true, _count: { select: { submissions: true } } }
  });
  return NextResponse.json({ items: users });
}

const patchSchema = z.object({ userId: z.string(), role: z.enum(['USER', 'ADMIN']).optional(), isBanned: z.boolean().optional() });
export async function PATCH(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Chỉ admin' }, { status: 403 }); }
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  const { userId, ...rest } = parsed.data;
  await prisma.user.update({ where: { id: userId }, data: rest });
  return NextResponse.json({ ok: true });
}
