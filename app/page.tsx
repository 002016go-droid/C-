import Link from 'next/link';
import { prisma } from '@/lib/db';
import { DifficultyBadge } from '@/components/Badge';
import { StarsDisplay } from '@/components/Stars';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [newest, topRatedRaw, contests, totalProblems, totalUsers, totalSubs] = await Promise.all([
    prisma.problem.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { province: true, examYear: true }
    }),
    prisma.problem.findMany({
      where: { isPublished: true },
      include: { ratings: { select: { stars: true } }, province: true }
    }),
    prisma.contest.findMany({ where: { isPublished: true }, orderBy: { createdAt: 'desc' }, take: 4, include: { problems: true } }),
    prisma.problem.count({ where: { isPublished: true } }),
    prisma.user.count(),
    prisma.submission.count()
  ]);
  const topRated = topRatedRaw
    .map((p) => ({
      ...p,
      avg: p.ratings.length ? p.ratings.reduce((a, b) => a + b.stars, 0) / p.ratings.length : 0,
      count: p.ratings.length
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 6);

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="container mx-auto max-w-7xl px-4 py-16 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">ChuyenTinOJ</h1>
          <p className="text-lg md:text-xl mb-2 max-w-3xl">
            Nền tảng luyện thi Online Judge dành cho học sinh thi chuyên Tin vào lớp 10.
          </p>
          <p className="text-sm md:text-base mb-8 max-w-3xl text-brand-100">
            Bài tập biên soạn theo phong cách đề thi miền Trung: Quảng Nam, Đà Nẵng, Quảng Ngãi, Huế, Bình Định, Phú Yên, Khánh Hòa.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/bai-tap" className="btn-primary !bg-white !text-brand-700 hover:!bg-gray-100">
              Bắt đầu luyện tập
            </Link>
            <Link href="/lo-trinh" className="btn-secondary !bg-transparent !text-white !border-white hover:!bg-white/10">
              Lộ trình ôn thi
            </Link>
            <Link href="/de-thi" className="btn-secondary !bg-transparent !text-white !border-white hover:!bg-white/10">
              Đề thi mô phỏng
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6 max-w-2xl w-full">
            <div className="text-center">
              <div className="text-3xl font-bold">{totalProblems}</div>
              <div className="text-sm text-brand-100">Bài luyện</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{totalUsers}</div>
              <div className="text-sm text-brand-100">Học sinh</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{totalSubs}</div>
              <div className="text-sm text-brand-100">Lượt submit</div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Bài mới nhất</h2>
          <div className="space-y-2">
            {newest.map((p) => (
              <Link
                key={p.id}
                href={`/bai-tap/${p.code}`}
                className="flex items-center justify-between gap-3 bg-white rounded border border-gray-200 p-3 hover:border-brand-500"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs text-gray-500">
                    {p.code}
                    {p.province ? ` · ${p.province.name}` : ''}
                    {p.examYear ? ` · ${p.examYear.year}` : ''}
                  </div>
                </div>
                <DifficultyBadge value={p.difficulty} />
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Bài được đánh giá cao</h2>
          <div className="space-y-2">
            {topRated.map((p) => (
              <Link
                key={p.id}
                href={`/bai-tap/${p.code}`}
                className="flex items-center justify-between gap-3 bg-white rounded border border-gray-200 p-3 hover:border-brand-500"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs text-gray-500">{p.code}{p.province ? ` · ${p.province.name}` : ''}</div>
                </div>
                <StarsDisplay value={p.avg} count={p.count} />
              </Link>
            ))}
            {topRated.length === 0 && (
              <div className="text-sm text-gray-500">Chưa có dữ liệu đánh giá.</div>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 pb-12">
        <h2 className="text-2xl font-bold mb-4">Đề thi nổi bật</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contests.map((c) => (
            <Link key={c.id} href={`/de-thi/${c.code}`} className="block bg-white rounded border border-gray-200 p-4 hover:border-brand-500">
              <div className="font-semibold">{c.title}</div>
              <div className="text-sm text-gray-500 mt-1">{c.problems.length} bài · {c.durationMin} phút · {c.totalPoints} điểm</div>
            </Link>
          ))}
          {contests.length === 0 && (
            <div className="text-sm text-gray-500">Sẽ sớm có đề thi.</div>
          )}
        </div>
      </section>
    </div>
  );
}
