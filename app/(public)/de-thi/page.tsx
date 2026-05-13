import Link from 'next/link';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DeThiPage() {
  const contests = await prisma.contest.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    include: { problems: { include: { problem: { select: { code: true, title: true, difficulty: true } } }, orderBy: { order: 'asc' } } }
  });
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Đề thi mô phỏng chuyên Tin vào 10</h1>
      <p className="text-sm text-gray-600 mb-4">
        Mỗi đề gồm 4 bài, thời gian 150 phút, tổng 10 điểm. Phân bố điểm 3 - 3 - 2 - 2.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        {contests.map((c) => (
          <div key={c.id} className="bg-white border border-gray-200 rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">{c.title}</h2>
              <span className="text-sm text-gray-500">{c.durationMin} phút · {c.totalPoints} điểm</span>
            </div>
            {c.description && <div className="text-sm text-gray-600 mb-2">{c.description}</div>}
            <ol className="text-sm space-y-1 list-decimal pl-5">
              {c.problems.map((p) => (
                <li key={p.problem.code}>
                  <Link href={`/bai-tap/${p.problem.code}`} className="text-brand-700 hover:underline">{p.problem.title}</Link>
                  <span className="text-gray-500"> · {p.points} điểm</span>
                </li>
              ))}
            </ol>
            <div className="mt-3"><Link href={`/de-thi/${c.code}`} className="btn-secondary text-sm">Xem đề</Link></div>
          </div>
        ))}
        {contests.length === 0 && (
          <div className="text-sm text-gray-500">Chưa có đề thi.</div>
        )}
      </div>
    </div>
  );
}
