import Link from 'next/link';

const PHASES = [
  { idx: 1, title: 'Giai đoạn 1: C++ cơ bản', desc: 'Input/output, if, loop, array, string.', tags: [] },
  { idx: 2, title: 'Giai đoạn 2: Số học, mảng, xâu', desc: 'Ước số, nguyên tố, prefix sum đơn giản, xử lý xâu cơ bản.', tags: ['so-hoc', 'mang', 'xau'] },
  { idx: 3, title: 'Giai đoạn 3: Sort, search, prefix sum, frequency', desc: 'Sắp xếp, tìm kiếm nhị phân, tần suất.', tags: ['sap-xep', 'prefix-sum'] },
  { idx: 4, title: 'Giai đoạn 4: Two pointers, greedy', desc: 'Hai con trỏ, tham lam.', tags: ['hai-con-tro', 'tham-lam'] },
  { idx: 5, title: 'Giai đoạn 5: Recursion, backtracking', desc: 'Đệ quy, quay lui có cắt nhánh.', tags: ['de-quy'] },
  { idx: 6, title: 'Giai đoạn 6: Quy hoạch động cơ bản', desc: 'DP dãy, DP balo cơ bản.', tags: ['qhd'] },
  { idx: 7, title: 'Giai đoạn 7: BFS/DFS cơ bản', desc: 'Lưới, đồ thị đơn giản.', tags: ['bfs-dfs'] },
  { idx: 8, title: 'Giai đoạn 8: Luyện đề miền Trung', desc: 'Đề thi mô phỏng phong cách chuyên Tin lớp 10.', tags: [] }
];

export default function LoTrinhPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">Lộ trình ôn thi chuyên Tin vào lớp 10</h1>
      <p className="text-sm text-gray-600 mb-6">
        Theo trình tự từ cơ bản đến đề mô phỏng. Hãy làm tuần tự theo từng giai đoạn.
      </p>
      <ol className="space-y-3 relative border-l-2 border-brand-200 pl-6">
        {PHASES.map((p) => (
          <li key={p.idx} className="bg-white border border-gray-200 rounded p-4 relative">
            <span className="absolute -left-9 top-4 bg-brand-600 text-white rounded-full w-7 h-7 text-sm flex items-center justify-center">{p.idx}</span>
            <div className="font-semibold">{p.title}</div>
            <div className="text-sm text-gray-600 mt-1">{p.desc}</div>
            {p.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {p.tags.map((t) => (
                  <Link key={t} href={`/bai-tap?tag=${t}`} className="badge bg-brand-100 text-brand-800 hover:bg-brand-200">
                    {t}
                  </Link>
                ))}
              </div>
            )}
            {p.idx === 8 && (
              <Link href="/de-thi" className="btn-primary mt-3 inline-flex">Vào trang đề thi</Link>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
