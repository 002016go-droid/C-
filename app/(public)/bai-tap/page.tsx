'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DifficultyBadge } from '@/components/Badge';
import { StarsDisplay } from '@/components/Stars';

type Item = {
  id: string; code: string; title: string; difficulty: string;
  province: { code: string; name: string } | null;
  examYear: number | null;
  tags: { slug: string; name: string }[];
  avgRating: number; ratingCount: number;
  totalSubs: number; acRate: number;
  userStatus: 'TODO' | 'TRIED' | 'AC';
};

const PROVINCES = [
  { code: '', name: 'Tất cả tỉnh' },
  { code: 'quang-nam', name: 'Quảng Nam' },
  { code: 'da-nang', name: 'Đà Nẵng' },
  { code: 'quang-ngai', name: 'Quảng Ngãi' },
  { code: 'hue', name: 'Huế' },
  { code: 'binh-dinh', name: 'Bình Định' },
  { code: 'phu-yen', name: 'Phú Yên' },
  { code: 'khanh-hoa', name: 'Khánh Hòa' },
  { code: 'mien-trung-khac', name: 'Miền Trung khác' }
];

const TAGS = [
  { slug: '', name: 'Tất cả chủ đề' },
  { slug: 'so-hoc', name: 'Số học' },
  { slug: 'mang', name: 'Mảng' },
  { slug: 'xau', name: 'Xâu' },
  { slug: 'sap-xep', name: 'Sắp xếp và tìm kiếm' },
  { slug: 'prefix-sum', name: 'Prefix sum' },
  { slug: 'hai-con-tro', name: 'Hai con trỏ' },
  { slug: 'tham-lam', name: 'Tham lam' },
  { slug: 'qhd', name: 'Quy hoạch động cơ bản' },
  { slug: 'de-quy', name: 'Đệ quy/Quay lui' },
  { slug: 'bfs-dfs', name: 'BFS/DFS cơ bản' },
  { slug: 'stack-queue', name: 'Stack/Queue/Map/Set' }
];

export default function BaiTapPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState('');
  const [province, setProvince] = useState('');
  const [tag, setTag] = useState('');
  const [year, setYear] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ q, province, tag, year, difficulty, status, sort });
    fetch('/api/problems?' + params.toString())
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }, [q, province, tag, year, difficulty, status, sort]);

  const stat = useMemo(() => {
    const total = items.length;
    const ac = items.filter((i) => i.userStatus === 'AC').length;
    return { total, ac };
  }, [items]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-2xl font-bold">Bài tập</h1>
        <div className="text-sm text-gray-500">{stat.total} bài · Đã AC {stat.ac}</div>
      </div>

      <div className="bg-white rounded border border-gray-200 p-3 grid md:grid-cols-4 gap-3 mb-4">
        <input className="input md:col-span-2" placeholder="Tìm theo tên/mã bài..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={province} onChange={(e) => setProvince(e.target.value)}>
          {PROVINCES.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
        </select>
        <select className="input" value={tag} onChange={(e) => setTag(e.target.value)}>
          {TAGS.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
        </select>
        <select className="input" value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Tất cả năm</option>
          {[2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">Tất cả độ khó (admin)</option>
          <option value="EASY">Dễ</option>
          <option value="MEDIUM">Trung bình</option>
          <option value="HARD">Khó</option>
          <option value="VERY_HARD">Rất khó</option>
        </select>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="todo">Chưa làm</option>
          <option value="tried">Đã thử</option>
          <option value="ac">Đã AC</option>
        </select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Mới nhất</option>
          <option value="rating">Rating cao</option>
          <option value="ac">Tỉ lệ AC cao</option>
          <option value="hardest">Tỉ lệ AC thấp</option>
        </select>
      </div>

      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="text-left px-3 py-2">Mã</th>
              <th className="text-left px-3 py-2">Tên bài</th>
              <th className="text-left px-3 py-2">Tỉnh/Năm</th>
              <th className="text-left px-3 py-2">Chủ đề</th>
              <th className="text-left px-3 py-2">Độ khó</th>
              <th className="text-left px-3 py-2">Rating</th>
              <th className="text-right px-3 py-2">Tỉ lệ AC</th>
              <th className="text-center px-3 py-2">Của bạn</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="text-center px-3 py-6 text-gray-500">Đang tải...</td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td colSpan={8} className="text-center px-3 py-6 text-gray-500">Không có bài phù hợp.</td></tr>
            )}
            {items.map((p) => (
              <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 font-mono text-xs">{p.code}</td>
                <td className="px-3 py-2">
                  <Link href={`/bai-tap/${p.code}`} className="text-brand-700 font-medium hover:underline">{p.title}</Link>
                </td>
                <td className="px-3 py-2 text-gray-600">{p.province?.name || '-'}{p.examYear ? ` · ${p.examYear}` : ''}</td>
                <td className="px-3 py-2 text-gray-600">{p.tags.map((t) => t.name).join(', ')}</td>
                <td className="px-3 py-2"><DifficultyBadge value={p.difficulty} /></td>
                <td className="px-3 py-2"><StarsDisplay value={p.avgRating} count={p.ratingCount} /></td>
                <td className="px-3 py-2 text-right">{(p.acRate * 100).toFixed(0)}% ({p.totalSubs})</td>
                <td className="px-3 py-2 text-center">
                  {p.userStatus === 'AC' && <span className="badge bg-green-100 text-green-800">AC</span>}
                  {p.userStatus === 'TRIED' && <span className="badge bg-yellow-100 text-yellow-800">Đã thử</span>}
                  {p.userStatus === 'TODO' && <span className="badge bg-gray-100 text-gray-600">Chưa làm</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
