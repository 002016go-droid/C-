'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function DangKyPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi đăng ký');
      const signIns = await signIn('credentials', { email, password, redirect: false });
      if (signIns?.error) throw new Error('Đăng ký thành công, nhưng đăng nhập thất bại');
      router.push('/dashboard');
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Đăng ký tài khoản</h1>
      <form onSubmit={submit} className="space-y-3 bg-white rounded border border-gray-200 p-4">
        <div>
          <label className="label">Họ và tên</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Mật khẩu (≥ 6 ký tự)</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Đang xử lý...' : 'Đăng ký'}</button>
        <div className="text-sm text-gray-500 text-center">
          Đã có tài khoản? <Link href="/dang-nhap" className="text-brand-600 hover:underline">Đăng nhập</Link>
        </div>
      </form>
    </div>
  );
}
