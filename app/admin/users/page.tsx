'use client';
import { useEffect, useState } from 'react';

export default function AdminUsers() {
  const [items, setItems] = useState<any[]>([]);
  async function load() {
    const r = await fetch('/api/admin/users');
    const d = await r.json();
    setItems(d.items || []);
  }
  useEffect(() => { load(); }, []);
  async function patch(userId: string, body: any) {
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, ...body }) });
    load();
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-3">Người dùng</h1>
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr><th className="text-left px-3 py-2">Email</th><th className="text-left px-3 py-2">Tên</th><th className="text-left px-3 py-2">Role</th><th className="text-left px-3 py-2">Submit</th><th>Trạng thái</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-t border-gray-100">
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{u.name}</td>
                <td className="px-3 py-2">{u.role}</td>
                <td className="px-3 py-2">{u._count.submissions}</td>
                <td className="px-3 py-2">{u.isBanned ? 'Bị khóa' : 'Hoạt động'}</td>
                <td className="px-3 py-2 space-x-2">
                  {u.role === 'ADMIN' ? (
                    <button onClick={() => patch(u.id, { role: 'USER' })} className="text-xs text-brand-700 hover:underline">Bỏ admin</button>
                  ) : (
                    <button onClick={() => patch(u.id, { role: 'ADMIN' })} className="text-xs text-brand-700 hover:underline">Cấp admin</button>
                  )}
                  <button onClick={() => patch(u.id, { isBanned: !u.isBanned })} className="text-xs text-red-700 hover:underline">{u.isBanned ? 'Mở khóa' : 'Khóa'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
