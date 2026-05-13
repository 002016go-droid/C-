'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DifficultyBadge } from '@/components/Badge';

export default function DeThiDetailPage() {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch(`/api/contests/${code}`).then((r) => r.json()).then(setData);
  }, [code]);
  if (!data) return <div className="container mx-auto max-w-5xl px-4 py-10">Đang tải...</div>;
  const c = data.contest;
  if (!c) return <div className="container mx-auto max-w-5xl px-4 py-10">{data.error || 'Không tìm thấy đề'}</div>;
  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">{c.title}</h1>
      <div className="text-sm text-gray-500 mb-4">
        Thời gian: {c.durationMin} phút · Tổng điểm: {c.totalPoints}
      </div>
      <div className="bg-white border border-gray-200 rounded mb-4">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">Bài</th>
              <th className="text-left px-3 py-2">Tên</th>
              <th className="text-left px-3 py-2">Độ khó</th>
              <th className="text-right px-3 py-2">Điểm</th>
            </tr>
          </thead>
          <tbody>
            {c.problems.map((p: any, i: number) => (
              <tr key={p.code} className="border-t border-gray-100">
                <td className="px-3 py-2 font-mono">Bài {i + 1}</td>
                <td className="px-3 py-2"><Link href={`/bai-tap/${p.code}`} className="text-brand-700 hover:underline">{p.title}</Link></td>
                <td className="px-3 py-2"><DifficultyBadge value={p.difficulty} /></td>
                <td className="px-3 py-2 text-right">{p.points.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {c.hasRanking && (
        <div className="bg-white border border-gray-200 rounded p-3">
          <h2 className="font-semibold mb-2">Bảng xếp hạng</h2>
          {data.ranking.length === 0 ? (
            <div className="text-sm text-gray-500">Chưa có dữ liệu.</div>
          ) : (
            <ol className="text-sm space-y-1">
              {data.ranking.map((r: any, i: number) => (
                <li key={r.userId} className="flex items-center justify-between border-b border-gray-100 py-1">
                  <span>#{i + 1} {r.name}</span><span className="font-semibold">{r.total.toFixed(2)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
