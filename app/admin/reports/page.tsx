'use client';
import { useEffect, useState } from 'react';

const TYPE_LABEL: Record<string, string> = {
  STATEMENT: 'Đề bài', SAMPLE_IO: 'IO mẫu', HIDDEN_TEST: 'Test ẩn',
  EDITORIAL: 'Lời giải', SAMPLE_CODE: 'Code mẫu', DIFFICULTY: 'Độ khó', OTHER: 'Khác'
};

export default function AdminReports() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState({ status: '', type: '' });
  async function load() {
    const p = new URLSearchParams(filter);
    const r = await fetch('/api/admin/reports?' + p.toString());
    const d = await r.json();
    setItems(d.items || []);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter.status, filter.type]);
  async function patch(id: string, status: string, adminNote?: string) {
    await fetch('/api/admin/reports', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, adminNote }) });
    load();
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-3">Báo lỗi</h1>
      <div className="flex gap-3 mb-3 text-sm">
        <select className="input max-w-xs" value={filter.status} onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}>
          <option value="">Tất cả trạng thái</option><option value="NEW">Mới</option><option value="IN_PROGRESS">Đang xử lý</option><option value="RESOLVED">Đã xử lý</option><option value="REJECTED">Từ chối</option>
        </select>
        <select className="input max-w-xs" value={filter.type} onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}>
          <option value="">Tất cả loại</option>
          {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        {items.map((r) => (
          <div key={r.id} className="bg-white border border-gray-200 rounded p-3 text-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-gray-500">{r.user.email} · bài {r.problem.code} · {TYPE_LABEL[r.type]} · {r.status}</div>
              <div className="space-x-2">
                <button onClick={() => patch(r.id, 'IN_PROGRESS')} className="text-xs text-brand-700 hover:underline">Đang xử lý</button>
                <button onClick={() => patch(r.id, 'RESOLVED')} className="text-xs text-green-700 hover:underline">Đã xử lý</button>
                <button onClick={() => patch(r.id, 'REJECTED')} className="text-xs text-red-700 hover:underline">Từ chối</button>
              </div>
            </div>
            <div className="whitespace-pre-wrap">{r.description}</div>
            {r.adminNote && <div className="mt-1 text-xs text-gray-500">Ghi chú admin: {r.adminNote}</div>}
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-gray-500">Không có báo lỗi.</div>}
      </div>
    </div>
  );
}
