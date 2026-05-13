'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminProblems() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/admin/problems').then((r) => r.json()).then((d) => setItems(d.items || []));
  }, []);
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold">Quản lý bài tập</h1>
        <Link href="/admin/problems/new" className="btn-primary">Thêm bài</Link>
      </div>
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">Mã</th>
              <th className="text-left px-3 py-2">Tên</th>
              <th className="text-left px-3 py-2">Độ khó</th>
              <th className="text-left px-3 py-2">Tỉnh</th>
              <th className="text-left px-3 py-2">Năm</th>
              <th className="text-left px-3 py-2">Tags</th>
              <th className="text-left px-3 py-2">Hiển thị</th>
              <th className="px-3 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="px-3 py-2 font-mono text-xs">{p.code}</td>
                <td className="px-3 py-2">{p.title}</td>
                <td className="px-3 py-2">{p.difficulty}</td>
                <td className="px-3 py-2">{p.province || '-'}</td>
                <td className="px-3 py-2">{p.examYear || '-'}</td>
                <td className="px-3 py-2">{p.tags.join(', ')}</td>
                <td className="px-3 py-2">{p.isPublished ? 'Đang hiển thị' : 'Ẩn'}</td>
                <td className="px-3 py-2"><Link href={`/admin/problems/${p.id}`} className="text-brand-700 hover:underline">Xem</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
