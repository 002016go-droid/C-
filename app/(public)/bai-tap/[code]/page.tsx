'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { DifficultyBadge, VerdictBadge } from '@/components/Badge';
import { StarsDisplay, StarsInput } from '@/components/Stars';

type ProblemDetail = {
  id: string; code: string; title: string; statement: string;
  inputFormat: string; outputFormat: string; constraints: string; notes?: string | null;
  difficulty: string; realDifficulty: string;
  timeLimitMs: number; memoryLimitMb: number; outputLimitKb: number; totalPoints: number;
  fileIoEnabled: boolean; fileInputName?: string | null; fileOutputName?: string | null;
  province: { code: string; name: string } | null; examYear: number | null;
  source?: string | null;
  tags: { slug: string; name: string }[];
  subtasks: { id: string; name: string; points: number; constraints: string | null }[];
  samples: { id: string; order: number; input: string; expectedOutput: string }[];
  editorial: null | {
    idea: string; observations: string; approach: string; algorithmAnalysis: string;
    timeComplexity: string; memoryComplexity: string; cppCode: string;
    codeExplanation: string; commonMistakes: string;
  };
  avgRating: number; ratingCount: number; totalSubs: number; acRate: number;
  myProgress: { hasSubmitted: boolean; solved: boolean; bestScore: number } | null;
  myRating: number;
};

const STARTER_CPP = `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // TODO: code lời giải tại đây
    return 0;
}
`;

const REPORT_TYPES = [
  { v: 'STATEMENT', t: 'Lỗi đề bài' },
  { v: 'SAMPLE_IO', t: 'Lỗi input/output mẫu' },
  { v: 'HIDDEN_TEST', t: 'Lỗi test ẩn' },
  { v: 'EDITORIAL', t: 'Lỗi lời giải' },
  { v: 'SAMPLE_CODE', t: 'Lỗi code mẫu' },
  { v: 'DIFFICULTY', t: 'Lỗi phân loại độ khó' },
  { v: 'OTHER', t: 'Lỗi khác' }
];

export default function ProblemDetailPage() {
  const { code } = useParams<{ code: string }>();
  const { data: session } = useSession();
  const [p, setP] = useState<ProblemDetail | null>(null);
  const [tab, setTab] = useState<'statement' | 'submit' | 'editorial' | 'submissions'>('statement');
  const [src, setSrc] = useState(STARTER_CPP);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [mySubs, setMySubs] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [reportType, setReportType] = useState('STATEMENT');
  const [reportBody, setReportBody] = useState('');
  const [reportMsg, setReportMsg] = useState('');

  const reload = useCallback(async () => {
    const r = await fetch(`/api/problems/${code}`);
    if (r.ok) {
      const d = await r.json();
      setP(d.problem);
    }
  }, [code]);

  const loadComments = useCallback(async () => {
    const r = await fetch(`/api/comments?problemCode=${code}`);
    if (r.ok) {
      const d = await r.json();
      setComments(d.items || []);
    }
  }, [code]);

  const loadMySubs = useCallback(async () => {
    const r = await fetch(`/api/submissions?limit=50`);
    if (r.ok) {
      const d = await r.json();
      setMySubs((d.items || []).filter((s: any) => s.problemCode === code));
    }
  }, [code]);

  useEffect(() => { reload(); loadComments(); }, [reload, loadComments]);
  useEffect(() => { if (session?.user) loadMySubs(); }, [session?.user, loadMySubs]);

  async function submitSolution() {
    if (!session?.user) { window.location.href = '/dang-nhap?callbackUrl=/bai-tap/' + code; return; }
    setSubmitError(''); setSubmitting(true);
    try {
      const r = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemCode: code, sourceCode: src, language: 'cpp17' }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Lỗi gửi bài');
      window.location.href = `/bai-lam/${d.id}`;
    } catch (e) {
      setSubmitError((e as Error).message);
    } finally { setSubmitting(false); }
  }

  async function submitRating(stars: number) {
    if (!session?.user) { alert('Đăng nhập để đánh giá'); return; }
    const r = await fetch('/api/ratings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemCode: code, stars }) });
    if (r.ok) reload();
  }

  async function postComment() {
    if (!commentBody.trim()) return;
    const r = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemCode: code, body: commentBody }) });
    if (r.ok) { setCommentBody(''); loadComments(); }
    else { const d = await r.json(); alert(d.error || 'Lỗi'); }
  }

  async function reportComment(id: string) {
    if (!confirm('Báo cáo bình luận này?')) return;
    await fetch('/api/comments/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commentId: id }) });
    loadComments();
  }

  async function submitProblemReport(e: React.FormEvent) {
    e.preventDefault();
    setReportMsg('');
    if (!session?.user) { alert('Đăng nhập để báo lỗi'); return; }
    const r = await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemCode: code, type: reportType, description: reportBody }) });
    if (r.ok) { setReportMsg('Cảm ơn bạn, báo lỗi đã được gửi.'); setReportBody(''); }
    else { const d = await r.json(); setReportMsg(d.error || 'Lỗi'); }
  }

  if (!p) return <div className="container mx-auto max-w-7xl px-4 py-10">Đang tải...</div>;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold flex-1">{p.title}</h1>
        <span className="text-sm text-gray-500 font-mono">{p.code}</span>
        <DifficultyBadge value={p.difficulty} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded">
            <nav className="flex border-b border-gray-200">
              {(['statement', 'submit', 'editorial', 'submissions'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium ${tab === t ? 'border-b-2 border-brand-600 text-brand-700' : 'text-gray-600 hover:text-brand-600'}`}>
                  {t === 'statement' ? 'Đề bài' : t === 'submit' ? 'Nộp bài' : t === 'editorial' ? 'Lời giải' : 'Bài làm của bạn'}
                </button>
              ))}
            </nav>

            {tab === 'statement' && (
              <div className="p-4 space-y-4">
                <section className="prose-vn whitespace-pre-wrap">{p.statement}</section>
                <section>
                  <h2 className="font-semibold text-lg">Định dạng input</h2>
                  <div className="prose-vn whitespace-pre-wrap">{p.inputFormat}</div>
                </section>
                <section>
                  <h2 className="font-semibold text-lg">Định dạng output</h2>
                  <div className="prose-vn whitespace-pre-wrap">{p.outputFormat}</div>
                </section>
                <section>
                  <h2 className="font-semibold text-lg">Ràng buộc</h2>
                  <div className="prose-vn whitespace-pre-wrap">{p.constraints}</div>
                </section>
                {p.subtasks.length > 0 && (
                  <section>
                    <h2 className="font-semibold text-lg">Subtasks</h2>
                    <ul className="list-disc pl-6 text-sm">
                      {p.subtasks.map((s) => (
                        <li key={s.id}>
                          <span className="font-medium">{s.name}</span> — {s.points} điểm
                          {s.constraints ? `: ${s.constraints}` : ''}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                <section>
                  <h2 className="font-semibold text-lg">Ví dụ</h2>
                  {p.samples.map((s) => (
                    <div key={s.id} className="grid md:grid-cols-2 gap-3 my-2">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Input #{s.order}</div>
                        <pre className="bg-gray-900 text-gray-50 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap">{s.input}</pre>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Output #{s.order}</div>
                        <pre className="bg-gray-900 text-gray-50 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap">{s.expectedOutput}</pre>
                      </div>
                    </div>
                  ))}
                </section>
                {p.notes && (
                  <section>
                    <h2 className="font-semibold text-lg">Ghi chú</h2>
                    <div className="prose-vn whitespace-pre-wrap">{p.notes}</div>
                  </section>
                )}
              </div>
            )}

            {tab === 'submit' && (
              <div className="p-4 space-y-3">
                <div className="text-sm text-gray-500">Ngôn ngữ: C++17 (g++ -O2 -std=c++17)</div>
                <textarea
                  className="input font-mono text-sm h-80"
                  value={src}
                  onChange={(e) => setSrc(e.target.value)}
                  spellCheck={false}
                />
                {submitError && <div className="text-sm text-red-600">{submitError}</div>}
                <button onClick={submitSolution} disabled={submitting} className="btn-primary">
                  {submitting ? 'Đang gửi...' : 'Submit'}
                </button>
              </div>
            )}

            {tab === 'editorial' && (
              <div className="p-4 space-y-4">
                {!p.editorial && (
                  <div className="text-sm text-gray-500">
                    Lời giải sẽ hiển thị sau khi bạn nộp bài (theo cấu hình của admin).
                  </div>
                )}
                {p.editorial && (
                  <div className="space-y-4">
                    <section><h2 className="font-semibold text-lg">Ý tưởng</h2><div className="prose-vn whitespace-pre-wrap">{p.editorial.idea}</div></section>
                    <section><h2 className="font-semibold text-lg">Nhận xét</h2><div className="prose-vn whitespace-pre-wrap">{p.editorial.observations}</div></section>
                    <section><h2 className="font-semibold text-lg">Hướng giải quyết</h2><div className="prose-vn whitespace-pre-wrap">{p.editorial.approach}</div></section>
                    <section><h2 className="font-semibold text-lg">Phân tích thuật toán</h2><div className="prose-vn whitespace-pre-wrap">{p.editorial.algorithmAnalysis}</div></section>
                    <section>
                      <h2 className="font-semibold text-lg">Độ phức tạp</h2>
                      <div className="text-sm">Thời gian: <code>{p.editorial.timeComplexity}</code> · Bộ nhớ: <code>{p.editorial.memoryComplexity}</code></div>
                    </section>
                    <section>
                      <h2 className="font-semibold text-lg">Code mẫu C++17</h2>
                      <pre className="bg-gray-900 text-gray-50 p-3 rounded text-sm overflow-x-auto"><code>{p.editorial.cppCode}</code></pre>
                    </section>
                    <section><h2 className="font-semibold text-lg">Giải thích code</h2><div className="prose-vn whitespace-pre-wrap">{p.editorial.codeExplanation}</div></section>
                    <section><h2 className="font-semibold text-lg">Lỗi thường gặp</h2><div className="prose-vn whitespace-pre-wrap">{p.editorial.commonMistakes}</div></section>
                  </div>
                )}
              </div>
            )}

            {tab === 'submissions' && (
              <div className="p-4 space-y-2">
                {mySubs.length === 0 && <div className="text-sm text-gray-500">Bạn chưa có bài làm nào cho bài này.</div>}
                {mySubs.map((s) => (
                  <Link key={s.id} href={`/bai-lam/${s.id}`} className="flex items-center gap-3 border border-gray-200 rounded p-2 hover:bg-gray-50">
                    <VerdictBadge value={s.status} />
                    <div className="flex-1 text-sm">Điểm: {s.totalScore}/{s.maxScore}</div>
                    <div className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleString('vi-VN')}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded p-4">
            <h2 className="text-lg font-semibold mb-2">Bình luận</h2>
            {session?.user ? (
              <div className="space-y-2 mb-3">
                <textarea className="input h-20" placeholder="Viết bình luận..." value={commentBody} onChange={(e) => setCommentBody(e.target.value)} />
                <button onClick={postComment} className="btn-primary">Gửi bình luận</button>
              </div>
            ) : (
              <div className="text-sm text-gray-500 mb-2">Đăng nhập để bình luận.</div>
            )}
            <div className="space-y-2">
              {comments.length === 0 && <div className="text-sm text-gray-500">Chưa có bình luận.</div>}
              {comments.map((c) => (
                <div key={c.id} className="border border-gray-200 rounded p-2 text-sm">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="font-medium">{c.author.name}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{new Date(c.createdAt).toLocaleString('vi-VN')}</span>
                      {c.status === 'HIDDEN' && <span className="badge bg-gray-200 text-gray-700">Đã ẩn</span>}
                      {c.status === 'REPORTED' && <span className="badge bg-yellow-100 text-yellow-800">Bị báo cáo</span>}
                      {!c.mine && session?.user && (
                        <button onClick={() => reportComment(c.id)} className="text-red-600 hover:underline">Báo cáo</button>
                      )}
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap">{c.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="bg-white border border-gray-200 rounded p-3 text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500">Tỉnh/Thành</span><span>{p.province?.name || '-'}</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500">Năm đề</span><span>{p.examYear ?? '-'}</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500">Nguồn</span><span className="text-right">{p.source || 'Tự biên soạn'}</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500">Thời gian</span><span>{p.timeLimitMs} ms</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500">Bộ nhớ</span><span>{p.memoryLimitMb} MB</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500">Output</span><span>{p.outputLimitKb} KB</span>
            </div>
            {p.fileIoEnabled && (
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500">File I/O</span>
                <span>{p.fileInputName || '-'} / {p.fileOutputName || '-'}</span>
              </div>
            )}
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500">Tổng điểm</span><span>{p.totalPoints}</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500">Độ khó thực tế</span><DifficultyBadge value={p.realDifficulty} /></div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500">Tỉ lệ AC</span><span>{(p.acRate * 100).toFixed(0)}% ({p.totalSubs})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Chủ đề</span>
              <span className="text-right">{p.tags.map((t) => t.name).join(', ') || '-'}</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded p-3">
            <h3 className="font-semibold mb-2">Đánh giá</h3>
            {!session?.user && <div className="text-sm text-gray-500 mb-2">Đăng nhập để đánh giá</div>}
            <StarsInput value={p.myRating} onChange={submitRating} disabled={!session?.user} />
            <div className="mt-2"><StarsDisplay value={p.avgRating} count={p.ratingCount} /></div>
          </div>

          <div className="bg-white border border-gray-200 rounded p-3 text-sm">
            <h3 className="font-semibold mb-2">Báo lỗi bài</h3>
            <form onSubmit={submitProblemReport} className="space-y-2">
              <select className="input" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                {REPORT_TYPES.map((t) => <option key={t.v} value={t.v}>{t.t}</option>)}
              </select>
              <textarea className="input h-20" value={reportBody} onChange={(e) => setReportBody(e.target.value)} placeholder="Mô tả lỗi..." />
              <button className="btn-secondary w-full" disabled={!session?.user}>Gửi báo lỗi</button>
              {reportMsg && <div className="text-xs text-green-700">{reportMsg}</div>}
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
