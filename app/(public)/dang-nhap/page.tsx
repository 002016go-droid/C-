'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

function Form() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get('callbackUrl') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setErr('Email hoặc mật khẩu không đúng');
    else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 bg-white rounded border border-gray-200 p-4">
      <div>
        <label className="label">Email</label>
        <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="label">Mật khẩu</label>
        <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {err && <div className="text-sm text-red-600">{err}</div>}
      <button className="btn-primary w-full" disabled={loading}>{loading ? 'Đang xử lý...' : 'Đăng nhập'}</button>
      <div className="text-sm text-gray-500 text-center">
        Chưa có tài khoản? <Link href="/dang-ky" className="text-brand-600 hover:underline">Đăng ký</Link>
      </div>
      <div className="text-xs text-gray-400 text-center">
        Tài khoản mẫu: admin@chuyentinoj.vn / admin123 · user@chuyentinoj.vn / user1234
      </div>
    </form>
  );
}

export default function DangNhapPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Đăng nhập</h1>
      <Suspense fallback={<div className="text-sm text-gray-500">Đang tải...</div>}>
        <Form />
      </Suspense>
    </div>
  );
}
