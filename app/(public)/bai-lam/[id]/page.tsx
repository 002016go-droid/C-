'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { VerdictBadge } from '@/components/Badge';

type Sub = {
  id: string; problemCode: string; problemTitle: string;
  status: string; verdict: string | null;
  totalScore: number; maxScore: number;
  runtimeMs?: number | null; compileLog?: string | null; judgeMessage?: string | null; sourceCode?: string | null;
  createdAt: string;
  results: Array<{
    verdict: string; points: number; runtimeMs?: number | null; memoryKb?: number | null;
    isSubtaskAggregate: boolean;
    subtask: null | { id: string; name: string; points: number; order: number };
    testCase: null | { order: number; isSample: boolean };
  }>;
};

export default function SubmissionPage() {
  const { id } = useParams<{ id: string }>();
  const [sub, setSub] = useState<Sub | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      const r = await fetch(`/api/submissions/${id}`);
      if (!alive) return;
      if (r.ok) {
        const d = await r.json();
        setSub(d.submission);
      }
    }
    load();
    const t = setInterval(load, 1500);
    return () => { alive = false; clearInterval(t); };
  }, [id]);

  if (!sub) return <div className="container mx-auto max-w-5xl px-4 py-10">Đang tải...</div>;

  const subtaskMap = new Map<string, typeof sub.results>();
  const noSubtaskResults: typeof sub.results = [];
  for (const r of sub.results) {
    if (r.subtask?.id) {
      const arr = subtaskMap.get(r.subtask.id) || [];
      arr.push(r);
      subtaskMap.set(r.subtask.id, arr);
    } else {
      noSubtaskResults.push(r);
    }
  }
  const subtasks = Array.from(subtaskMap.entries()).map(([sid, results]) => {
    const aggregate = results.find((r) => r.isSubtaskAggregate);
    const tests = results.filter((r) => !r.isSubtaskAggregate);
    return { id: sid, name: aggregate?.subtask?.name || results[0]?.subtask?.name || '', points: aggregate?.subtask?.points ?? results[0]?.subtask?.points ?? 0, order: aggregate?.subtask?.order ?? results[0]?.subtask?.order ?? 0, aggregate, tests };
  }).sort((a, b) => a.order - b.order);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">Kết quả nộp bài</h1>
      <div className="text-sm text-gray-500 mb-4">
        Bài: <a className="text-brand-700 hover:underline" href={`/bai-tap/${sub.problemCode}`}>{sub.problemTitle}</a> · Mã: {sub.problemCode}
      </div>

      <div className="bg-white border border-gray-200 rounded p-4 mb-4 grid md:grid-cols-4 gap-3">
        <div>
          <div className="text-xs text-gray-500">Trạng thái</div>
          <VerdictBadge value={sub.status} />
        </div>
        <div>
          <div className="text-xs text-gray-500">Điểm</div>
          <div className="text-lg font-semibold">{sub.totalScore}<span className="text-gray-500 text-sm"> / {sub.maxScore}</span></div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Thời gian chạy tối đa</div>
          <div>{sub.runtimeMs ?? '-'} ms</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Lúc</div>
          <div className="text-sm">{new Date(sub.createdAt).toLocaleString('vi-VN')}</div>
        </div>
      </div>

      {sub.status === 'COMPILATION_ERROR' && sub.compileLog && (
        <div className="bg-white border border-gray-200 rounded p-4 mb-4">
          <h2 className="font-semibold mb-2">Compile log</h2>
          <pre className="bg-gray-900 text-gray-50 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap">{sub.compileLog}</pre>
        </div>
      )}

      {subtasks.length > 0 && (
        <div className="space-y-3 mb-4">
          {subtasks.map((s) => (
            <div key={s.id} className="bg-white border border-gray-200 rounded">
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-gray-500">Tối đa {s.points} điểm</div>
                </div>
                <div className="flex items-center gap-2">
                  <VerdictBadge value={s.aggregate?.verdict} />
                  <div className="font-semibold">{s.aggregate?.points ?? 0} / {s.points}</div>
                </div>
              </div>
              <div className="p-3 grid grid-cols-5 md:grid-cols-10 gap-2 text-xs">
                {s.tests.map((t, i) => (
                  <div key={i} className={`rounded p-2 text-center ${t.verdict === 'ACCEPTED' ? 'bg-green-100 text-green-800' : t.verdict === 'SKIPPED' ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-800'}`}>
                    <div>Test {t.testCase?.order ?? i + 1}</div>
                    <div className="font-semibold">{t.verdict}</div>
                    {t.runtimeMs != null && <div className="text-[10px]">{t.runtimeMs} ms</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {noSubtaskResults.length > 0 && (
        <div className="bg-white border border-gray-200 rounded p-3">
          <div className="font-semibold mb-2">Kết quả từng test</div>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 text-xs">
            {noSubtaskResults.map((t, i) => (
              <div key={i} className={`rounded p-2 text-center ${t.verdict === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <div>Test {t.testCase?.order ?? i + 1}</div>
                <div className="font-semibold">{t.verdict}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sub.sourceCode && (
        <div className="bg-white border border-gray-200 rounded p-4 mt-4">
          <h2 className="font-semibold mb-2">Code đã nộp</h2>
          <pre className="bg-gray-900 text-gray-50 p-3 rounded text-sm overflow-x-auto"><code>{sub.sourceCode}</code></pre>
        </div>
      )}
    </div>
  );
}
