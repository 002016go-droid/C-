import Link from 'next/link';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const [u, p, s, r] = await Promise.all([
    prisma.user.count(),
    prisma.problem.count(),
    prisma.submission.count(),
    prisma.problemReport.count({ where: { status: 'NEW' } })
  ]);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-3">Bảng điều khiển admin</h1>
      <div className="grid md:grid-cols-4 gap-3">
        <Stat label="Người dùng" value={u} href="/admin/users" />
        <Stat label="Bài tập" value={p} href="/admin/problems" />
        <Stat label="Submission" value={s} href="/admin/stats" />
        <Stat label="Báo lỗi (mới)" value={r} href="/admin/reports" />
      </div>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="bg-white border border-gray-200 rounded p-4 hover:border-brand-500">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </Link>
  );
}
