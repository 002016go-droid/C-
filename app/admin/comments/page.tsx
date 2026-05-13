'use client';
import { useEffect, useState } from 'react';

export default function AdminComments() {
  const [items, setItems] = useState<any[]>([]);
  async function load() {
    const r = await fetch('/api/admin/comments');
    const d = await r.json();
    setItems(d.items || []);
  }
  useEffect(() => { load(); }, []);
  async function patch(id: string, body: any) {
    await fetch('/api/admin/comments', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...body }) });
    load();
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-3">Bình luận</h1>
      <div className="space-y-2">
        {items.map((c) => (
          <div key={c.id} className="bg-white border border-gray-200 rounded p-3 text-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="text-gray-500 text-xs">{c.user.email} · bài {c.problem.code} · {new Date(c.createdAt).toLocaleString('vi-VN')} · {c.status}</div>
              <div className="space-x-2">
                <button onClick={() => patch(c.id, { status: c.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE' })} className="text-xs text-brand-700 hover:underline">{c.status === 'VISIBLE' ? 'Ẩn' : 'Hiện'}</button>
                <button onClick={() => patch(c.id, { delete: true })} className="text-xs text-red-700 hover:underline">Xóa</button>
              </div>
            </div>
            <div className="whitespace-pre-wrap">{c.body}</div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-gray-500">Chưa có bình luận.</div>}
      </div>
    </div>
  );
}
