import './globals.css';
import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'ChuyenTinOJ - Luyện thi chuyên Tin lớp 10',
  description:
    'Nền tảng luyện thi Online Judge dành cho học sinh thi chuyên Tin vào lớp 10 tại Việt Nam, theo phong cách đề thi miền Trung.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
