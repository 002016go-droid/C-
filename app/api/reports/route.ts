import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';

const schema = z.object({
  problemCode: z.string(),
  type: z.enum(['STATEMENT', 'SAMPLE_IO', 'HIDDEN_TEST', 'EDITORIAL', 'SAMPLE_CODE', 'DIFFICULTY', 'OTHER']),
  description: z.string().min(5).max(4000)
});

export async function POST(req: Request) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'Đăng nhập để báo lỗi' }, { status: 401 }); }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  const problem = await prisma.problem.findUnique({ where: { code: parsed.data.problemCode } });
  if (!problem) return NextResponse.json({ error: 'Không tìm thấy bài' }, { status: 404 });
  const r = await prisma.problemReport.create({
    data: {
      userId: user.id!,
      problemId: problem.id,
      type: parsed.data.type,
      description: parsed.data.description,
      status: 'NEW'
    }
  });
  return NextResponse.json({ id: r.id });
}
