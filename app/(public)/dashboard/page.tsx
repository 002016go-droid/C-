'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { VerdictBadge, DifficultyBadge } from '@/components/Badge';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/dashboard').then((r) => r.json()).then(setData);
  }, [status]);

  if (status === 'unauthenticated') {
    return <div className="container mx-auto max-w-5xl px-4 py-10">Bạn cần <Link href="/dang-nhap" className="text-brand-700 underline">đăng nhập</Link>.</div>;
  }
  if (!data) return <div className="container mx-auto max-w-5xl px-4 py-10">Đang tải...</div>;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard của {session?.user?.name}</h1>
      <div className="grid md:grid-cols-4 gap-3 mb-6">
        <Stat title="Bài đã thử" value={data.summary.tried} />
        <Stat title="Bài AC" value={data.summary.solved} />
        <Stat title="Tỉ lệ AC" value={(data.summary.acRate * 100).toFixed(0) + '%'} />
        <Stat title="Tổng submit" value={data.summary.totalSubmissions} />
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-gray-200 rounded p-4">
          <h2 className="font-semibold mb-3">Chủ đề mạnh / yếu</h2>
          {data.topics.length === 0 ? (
            <div className="text-sm text-gray-500">Chưa có dữ liệu.</div>
          ) : (
            <ul className="text-sm space-y-1">
              {data.topics.map((t: any) => (
                <li key={t.slug} className="flex items-center justify-between gap-2">
                  <span>{t.name}</span>
                  <span className="text-gray-600">{t.solved}/{t.tried} ({(t.rate * 100).toFixed(0)}%)</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <h2 className="font-semibold mb-3">Gợi ý bài tiếp theo</h2>
          <ul className="text-sm space-y-1">
            {data.suggestions.map((p: any) => (
              <li key={p.id} className="flex items-center justify-between">
                <Link href={`/bai-tap/${p.code}`} className="text-brand-700 hover:underline">{p.title}</Link>
                <DifficultyBadge value={p.difficulty} />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded p-4">
        <h2 className="font-semibold mb-3">Bài làm gần đây</h2>
        <table className="min-w-full text-sm">
          <thead className="text-gray-600">
            <tr><th className="text-left py-2">Bài</th><th>Trạng thái</th><th>Điểm</th><th>Thời điểm</th></tr>
          </thead>
          <tbody>
            {data.recent.map((s: any) => (
              <tr key={s.id} className="border-t border-gray-100">
                <td className="py-2"><Link href={`/bai-tap/${s.problemCode}`} className="text-brand-700 hover:underline">{s.problemTitle}</Link></td>
                <td><Link href={`/bai-lam/${s.id}`}><VerdictBadge value={s.status} /></Link></td>
                <td>{s.totalScore}/{s.maxScore}</td>
                <td>{new Date(s.createdAt).toLocaleString('vi-VN')}</td>
              </tr>
            ))}
            {data.recent.length === 0 && <tr><td colSpan={4} className="py-3 text-gray-500">Chưa có bài làm nào.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}
