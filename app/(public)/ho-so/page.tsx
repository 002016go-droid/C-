'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { VerdictBadge } from '@/components/Badge';

export default function HoSoPage() {
  const { data: session, status } = useSession();
  const [subs, setSubs] = useState<any[]>([]);
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/submissions?limit=50').then((r) => r.json()).then((d) => setSubs(d.items || []));
  }, [status]);
  if (status === 'unauthenticated') {
    return <div className="container mx-auto max-w-5xl px-4 py-10">Bạn cần <Link href="/dang-nhap" className="text-brand-700 underline">đăng nhập</Link>.</div>;
  }
  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">Hồ sơ cá nhân</h1>
      <div className="text-sm text-gray-600 mb-4">{session?.user?.name} ({session?.user?.email}) · vai trò: {session?.user?.role}</div>
      <div className="bg-white border border-gray-200 rounded p-4">
        <h2 className="font-semibold mb-2">Lịch sử nộp bài</h2>
        <table className="min-w-full text-sm">
          <thead className="text-gray-600">
            <tr><th className="text-left py-2">Bài</th><th>Trạng thái</th><th>Điểm</th><th>Thời điểm</th></tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-t border-gray-100">
                <td className="py-2"><Link href={`/bai-tap/${s.problemCode}`} className="text-brand-700 hover:underline">{s.problemTitle}</Link></td>
                <td><Link href={`/bai-lam/${s.id}`}><VerdictBadge value={s.status} /></Link></td>
                <td>{s.totalScore}/{s.maxScore}</td>
                <td>{new Date(s.createdAt).toLocaleString('vi-VN')}</td>
              </tr>
            ))}
            {subs.length === 0 && <tr><td colSpan={4} className="py-3 text-gray-500">Chưa có submission nào.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
