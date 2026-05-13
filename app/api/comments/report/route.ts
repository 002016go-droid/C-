import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';

const schema = z.object({ commentId: z.string() });
export async function POST(req: Request) {
  try { await requireUser(); } catch { return NextResponse.json({ error: 'Đăng nhập để báo cáo' }, { status: 401 }); }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  await prisma.problemComment.update({
    where: { id: parsed.data.commentId },
    data: { reportCount: { increment: 1 }, status: 'REPORTED' }
  });
  return NextResponse.json({ ok: true });
}
