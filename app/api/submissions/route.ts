import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { enqueueSubmissionInline } from '@/server/judge/queue';

const submitSchema = z.object({
  problemCode: z.string().min(1),
  language: z.literal('cpp17').default('cpp17'),
  sourceCode: z.string().min(1).max(200_000),
  contestId: z.string().optional().nullable()
});

export async function POST(req: Request) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 }); }
  const body = await req.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message || 'Dữ liệu không hợp lệ' }, { status: 400 });

  const problem = await prisma.problem.findUnique({ where: { code: parsed.data.problemCode } });
  if (!problem) return NextResponse.json({ error: 'Không tìm thấy bài' }, { status: 404 });

  const sub = await prisma.submission.create({
    data: {
      userId: user.id!,
      problemId: problem.id,
      language: 'cpp17',
      sourceCode: parsed.data.sourceCode,
      status: 'PENDING',
      contestId: parsed.data.contestId || null,
      maxScore: problem.totalPoints
    }
  });
  // fire-and-forget judge in same process (MVP). A separate worker also picks
  // up any PENDING submissions if running.
  enqueueSubmissionInline(sub.id);
  return NextResponse.json({ id: sub.id });
}

export async function GET(req: Request) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 }); }
  const url = new URL(req.url);
  const limit = Math.min(50, Number(url.searchParams.get('limit') || '20'));
  const subs = await prisma.submission.findMany({
    where: { userId: user.id! },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { problem: { select: { code: true, title: true, totalPoints: true } } }
  });
  return NextResponse.json({
    items: subs.map((s) => ({
      id: s.id,
      problemCode: s.problem.code,
      problemTitle: s.problem.title,
      status: s.status,
      verdict: s.verdict,
      totalScore: s.totalScore,
      maxScore: s.maxScore,
      runtimeMs: s.runtimeMs,
      language: s.language,
      createdAt: s.createdAt
    }))
  });
}
