import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u?.id) throw new Error('Bạn cần đăng nhập');
  return u;
}

export async function requireAdmin() {
  const u = await getCurrentUser();
  if (!u?.id || u.role !== 'ADMIN') throw new Error('Chỉ admin được phép');
  return u;
}
