'use client';
import { useEffect, useState } from 'react';

export default function AdminStats() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch('/api/admin/stats').then((r) => r.json()).then(setData); }, []);
  if (!data) return <div>Đang tải...</div>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Thống kê</h1>
      <div className="grid md:grid-cols-4 gap-3">
        <Stat label="Người dùng" v={data.totals.users} />
        <Stat label="Bài tập" v={data.totals.problems} />
        <Stat label="Submission" v={data.totals.submissions} />
        <Stat label="Tỉ lệ AC toàn hệ thống" v={(data.totals.acRate * 100).toFixed(0) + '%'} />
      </div>
      <Section title="Bài nhiều submit nhất" items={data.mostSubmitted} fmt={(i: any) => `${i.title} (${i.code}) - ${i.count}`} />
      <Section title="Bài khó nhất (AC thấp)" items={data.hardest} fmt={(i: any) => `${i.title} (${i.code}) - AC ${(i.acRate * 100).toFixed(0)}%`} />
      <Section title="Bài bị báo lỗi nhiều" items={data.topReported} fmt={(i: any) => `${i.title} (${i.code}) - ${i.count}`} />
      <Section title="Bài rating cao nhất" items={data.topRated} fmt={(i: any) => `${i.title} (${i.code}) - ${i.avg.toFixed(2)}★`} />
      <Section title="Bài rating thấp nhất" items={data.lowRated} fmt={(i: any) => `${i.title} (${i.code}) - ${i.avg.toFixed(2)}★`} />
      <Section title="Người dùng hoạt động nhiều nhất" items={data.topActive} fmt={(i: any) => `${i.user} - ${i.count} submit`} />
    </div>
  );
}

function Stat({ label, v }: { label: string; v: any }) {
  return <div className="bg-white border border-gray-200 rounded p-4"><div className="text-xs text-gray-500">{label}</div><div className="text-2xl font-semibold">{v}</div></div>;
}
function Section({ title, items, fmt }: { title: string; items: any[]; fmt: (i: any) => string }) {
  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <h2 className="font-semibold mb-2">{title}</h2>
      {(!items || items.length === 0) ? <div className="text-sm text-gray-500">Chưa có dữ liệu.</div> : (
        <ol className="text-sm list-decimal pl-5">{items.map((i, idx) => <li key={idx}>{fmt(i)}</li>)}</ol>
      )}
    </div>
  );
}
