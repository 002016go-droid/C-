import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getCurrentUser, requireUser } from '@/lib/session';

const schema = z.object({ problemCode: z.string(), body: z.string().min(1).max(2000), parentId: z.string().nullable().optional() });

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('problemCode') || '';
  if (!code) return NextResponse.json({ error: 'Thiếu mã bài' }, { status: 400 });
  const problem = await prisma.problem.findUnique({ where: { code } });
  if (!problem) return NextResponse.json({ error: 'Không tìm thấy bài' }, { status: 404 });
  const me = await getCurrentUser();
  const comments = await prisma.problemComment.findMany({
    where: {
      problemId: problem.id,
      OR: [
        { status: 'VISIBLE' },
        ...(me ? [{ userId: me.id! }] : [])
      ]
    },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, name: true, email: true } } }
  });
  return NextResponse.json({
    items: comments.map((c) => ({
      id: c.id,
      body: c.body,
      status: c.status,
      createdAt: c.createdAt,
      author: { id: c.user.id, name: c.user.name || c.user.email },
      mine: me?.id === c.user.id,
      parentId: c.parentId
    }))
  });
}

export async function POST(req: Request) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'Đăng nhập để bình luận' }, { status: 401 }); }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  const problem = await prisma.problem.findUnique({ where: { code: parsed.data.problemCode } });
  if (!problem) return NextResponse.json({ error: 'Không tìm thấy bài' }, { status: 404 });
  const c = await prisma.problemComment.create({
    data: {
      userId: user.id!,
      problemId: problem.id,
      body: parsed.data.body,
      parentId: parsed.data.parentId || null,
      status: 'VISIBLE'
    }
  });
  return NextResponse.json({ id: c.id });
}
