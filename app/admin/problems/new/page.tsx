'use client';
import { useState } from 'react';

export default function NewProblem() {
  const [form, setForm] = useState({
    code: 'BAI-MOI', title: 'Bài mới', statement: 'Mô tả đề', inputFormat: 'Một số n', outputFormat: 'In ra n',
    constraints: '1 ≤ n ≤ 1e5', notes: '', difficulty: 'EASY', timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240,
    totalPoints: 100, fileIoEnabled: false, fileInputName: '', fileOutputName: '',
    showEditorial: true, isPublished: true, provinceCode: '', examYear: '', source: '', tagSlugs: ''
  });
  const [msg, setMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    const payload: any = { ...form, examYear: form.examYear ? Number(form.examYear) : undefined, tagSlugs: form.tagSlugs.split(',').map((s) => s.trim()).filter(Boolean) };
    const r = await fetch('/api/admin/problems', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const d = await r.json();
    if (!r.ok) setMsg('Lỗi: ' + (d.error || ''));
    else setMsg('Đã lưu, id = ' + d.id);
  }

  function bind<K extends keyof typeof form>(k: K) {
    return (v: any) => setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-3">Thêm/Cập nhật bài</h1>
      <p className="text-sm text-gray-500 mb-3">Form ngắn gọn cho admin: chỉnh sửa metadata bài. Subtask, test case và editorial dùng API tương ứng (xem README).</p>
      <form onSubmit={submit} className="space-y-3 bg-white border border-gray-200 rounded p-4">
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Mã"><input className="input" value={form.code} onChange={(e) => bind('code')(e.target.value)} /></Field>
          <Field label="Tên"><input className="input" value={form.title} onChange={(e) => bind('title')(e.target.value)} /></Field>
        </div>
        <Field label="Statement"><textarea className="input h-32" value={form.statement} onChange={(e) => bind('statement')(e.target.value)} /></Field>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Input format"><textarea className="input h-20" value={form.inputFormat} onChange={(e) => bind('inputFormat')(e.target.value)} /></Field>
          <Field label="Output format"><textarea className="input h-20" value={form.outputFormat} onChange={(e) => bind('outputFormat')(e.target.value)} /></Field>
        </div>
        <Field label="Constraints"><textarea className="input h-20" value={form.constraints} onChange={(e) => bind('constraints')(e.target.value)} /></Field>
        <Field label="Notes"><textarea className="input h-12" value={form.notes} onChange={(e) => bind('notes')(e.target.value)} /></Field>
        <div className="grid md:grid-cols-4 gap-3">
          <Field label="Độ khó">
            <select className="input" value={form.difficulty} onChange={(e) => bind('difficulty')(e.target.value)}>
              <option value="EASY">Dễ</option><option value="MEDIUM">Trung bình</option>
              <option value="HARD">Khó</option><option value="VERY_HARD">Rất khó</option>
            </select>
          </Field>
          <Field label="Time (ms)"><input type="number" className="input" value={form.timeLimitMs} onChange={(e) => bind('timeLimitMs')(Number(e.target.value))} /></Field>
          <Field label="Memory (MB)"><input type="number" className="input" value={form.memoryLimitMb} onChange={(e) => bind('memoryLimitMb')(Number(e.target.value))} /></Field>
          <Field label="Output (KB)"><input type="number" className="input" value={form.outputLimitKb} onChange={(e) => bind('outputLimitKb')(Number(e.target.value))} /></Field>
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          <Field label="Tổng điểm"><input type="number" className="input" value={form.totalPoints} onChange={(e) => bind('totalPoints')(Number(e.target.value))} /></Field>
          <Field label="Tỉnh code"><input className="input" placeholder="quang-nam" value={form.provinceCode} onChange={(e) => bind('provinceCode')(e.target.value)} /></Field>
          <Field label="Năm đề"><input className="input" placeholder="2023" value={form.examYear} onChange={(e) => bind('examYear')(e.target.value)} /></Field>
          <Field label="Tags (slug,...)"><input className="input" placeholder="so-hoc,prefix-sum" value={form.tagSlugs} onChange={(e) => bind('tagSlugs')(e.target.value)} /></Field>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.fileIoEnabled} onChange={(e) => bind('fileIoEnabled')(e.target.checked)} /> Bật file I/O</label>
          <Field label="File input"><input className="input" value={form.fileInputName} onChange={(e) => bind('fileInputName')(e.target.value)} /></Field>
          <Field label="File output"><input className="input" value={form.fileOutputName} onChange={(e) => bind('fileOutputName')(e.target.value)} /></Field>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.showEditorial} onChange={(e) => bind('showEditorial')(e.target.checked)} /> Hiển thị lời giải</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isPublished} onChange={(e) => bind('isPublished')(e.target.checked)} /> Công khai</label>
        </div>
        <Field label="Nguồn"><input className="input" value={form.source} onChange={(e) => bind('source')(e.target.value)} /></Field>
        <button className="btn-primary">Lưu</button>
        {msg && <div className="text-sm">{msg}</div>}
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
