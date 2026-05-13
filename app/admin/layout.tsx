import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentUser();
  if (!me || me.role !== 'ADMIN') redirect('/dang-nhap?callbackUrl=/admin');
  return (
    <div className="container mx-auto max-w-7xl px-4 py-4">
      <aside className="mb-4 flex flex-wrap gap-2 text-sm">
        <AdminLink href="/admin">Tổng quan</AdminLink>
        <AdminLink href="/admin/problems">Bài tập</AdminLink>
        <AdminLink href="/admin/contests">Đề thi</AdminLink>
        <AdminLink href="/admin/users">Người dùng</AdminLink>
        <AdminLink href="/admin/comments">Bình luận</AdminLink>
        <AdminLink href="/admin/reports">Báo lỗi</AdminLink>
        <AdminLink href="/admin/stats">Thống kê</AdminLink>
      </aside>
      {children}
    </div>
  );
}

function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:border-brand-500">{children}</Link>;
}
