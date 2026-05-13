'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export function SiteHeader() {
  const { data: session, status } = useSession();
  const user = session?.user;
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-brand-700">
            ChuyenTinOJ
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/bai-tap" className="hover:text-brand-600">Bài tập</Link>
            <Link href="/de-thi" className="hover:text-brand-600">Đề thi</Link>
            <Link href="/lo-trinh" className="hover:text-brand-600">Lộ trình</Link>
            {user && <Link href="/dashboard" className="hover:text-brand-600">Dashboard</Link>}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {status === 'loading' ? null : user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="btn-secondary !py-1.5">Admin</Link>
              )}
              <Link href="/ho-so" className="btn-secondary !py-1.5">
                {user.name || user.email}
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-secondary !py-1.5">
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/dang-nhap" className="btn-secondary !py-1.5">Đăng nhập</Link>
              <Link href="/dang-ky" className="btn-primary !py-1.5">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
