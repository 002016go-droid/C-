'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function AdminProblemDetail() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<any>(null);
  useEffect(() => {
    fetch(`/api/admin/problems/${id}`).then((r) => r.json()).then((d) => setP(d.problem));
  }, [id]);
  if (!p) return <div>Đang tải...</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">{p.title}</h1>
      <div className="text-sm text-gray-500 mb-4">{p.code} · {p.difficulty}</div>

      <div className="bg-white border border-gray-200 rounded p-4 mb-3 text-sm">
        <h2 className="font-semibold mb-2">Subtasks ({p.subtasks.length})</h2>
        <ul className="list-disc pl-5">
          {p.subtasks.map((s: any) => (
            <li key={s.id}>{s.name} - {s.points} điểm ({s.testCases.length} test)</li>
          ))}
        </ul>
      </div>
      <div className="bg-white border border-gray-200 rounded p-4 mb-3 text-sm">
        <h2 className="font-semibold mb-2">Test cases ({p.testCases.length})</h2>
        <ul className="list-disc pl-5">
          {p.testCases.slice(0, 10).map((t: any) => (
            <li key={t.id}>Test {t.order} {t.isSample ? '(mẫu)' : '(ẩn)'}</li>
          ))}
          {p.testCases.length > 10 && <li>... và {p.testCases.length - 10} test nữa</li>}
        </ul>
      </div>
      <div className="bg-white border border-gray-200 rounded p-4 text-sm">
        <h2 className="font-semibold mb-2">Editorial</h2>
        {p.editorial ? (
          <div className="whitespace-pre-wrap">{p.editorial.idea?.slice(0, 200)}...</div>
        ) : (
          <div className="text-gray-500">Chưa có editorial.</div>
        )}
      </div>
    </div>
  );
}
