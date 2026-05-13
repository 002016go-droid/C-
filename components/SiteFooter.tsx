export function SiteFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="container mx-auto max-w-7xl px-4 py-6 text-sm text-gray-500 flex flex-col md:flex-row md:justify-between gap-2">
        <div>© {new Date().getFullYear()} ChuyenTinOJ - Luyện thi chuyên Tin vào lớp 10</div>
        <div>Tự biên soạn, không sao chép nguyên văn đề thi thật. Định hướng miền Trung.</div>
      </div>
    </footer>
  );
}
