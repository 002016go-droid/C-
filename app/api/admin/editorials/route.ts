import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/session';

const schema = z.object({
  problemId: z.string(),
  idea: z.string().min(1),
  observations: z.string().min(1),
  approach: z.string().min(1),
  algorithmAnalysis: z.string().min(1),
  timeComplexity: z.string().min(1),
  memoryComplexity: z.string().min(1),
  cppCode: z.string().min(1),
  codeExplanation: z.string().min(1),
  commonMistakes: z.string().min(1)
});

export async function POST(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Chỉ admin' }, { status: 403 }); }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  const d = parsed.data;
  await prisma.editorial.upsert({
    where: { problemId: d.problemId },
    update: { ...d },
    create: { ...d }
  });
  return NextResponse.json({ ok: true });
}
