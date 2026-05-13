'use client';
import { useEffect, useState } from 'react';

export default function AdminContests() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { fetch('/api/admin/contests').then((r) => r.json()).then((d) => setItems(d.items || [])); }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-3">Đề thi</h1>
      <p className="text-sm text-gray-500 mb-3">Đề thi mặc định được tạo qua seed. Để thêm đề mới, gọi POST /api/admin/contests với mã đề và danh sách bài (xem README).</p>
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="text-left px-3 py-2">Mã</th><th className="text-left px-3 py-2">Tên</th><th>Thời gian</th><th>Điểm</th><th>Hiển thị</th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t border-gray-100">
                <td className="px-3 py-2 font-mono text-xs">{c.code}</td>
                <td className="px-3 py-2">{c.title}</td>
                <td className="px-3 py-2 text-center">{c.durationMin}'</td>
                <td className="px-3 py-2 text-center">{c.totalPoints}</td>
                <td className="px-3 py-2 text-center">{c.isPublished ? '✓' : '✗'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
