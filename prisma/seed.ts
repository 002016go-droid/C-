import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { spawn } from 'child_process';
import { mkdtemp, mkdir, writeFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { allProblems, allContests } from '../data/problems';
import type { ProblemDef } from '../data/types';

const prisma = new PrismaClient();

const PROVINCES = [
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

const EXAM_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024];

const COMPILER = process.env.JUDGE_CPP_COMPILER || 'g++';
const COMPILE_FLAGS = ['-O2', '-std=c++17', '-w', '-pipe'];
const RUN_TIMEOUT_MS = 8000;

async function compile(source: string, outPath: string): Promise<{ ok: boolean; log: string }> {
  return new Promise((resolve) => {
    const proc = spawn(COMPILER, [...COMPILE_FLAGS, '-x', 'c++', '-', '-o', outPath], { stdio: ['pipe', 'pipe', 'pipe'] });
    let log = '';
    proc.stderr.on('data', (d) => (log += d.toString()));
    proc.on('error', (e) => resolve({ ok: false, log: log + e.message }));
    proc.on('close', (code) => resolve({ ok: code === 0, log }));
    proc.stdin.write(source);
    proc.stdin.end();
  });
}

async function runBinary(binPath: string, input: string): Promise<{ stdout: string; stderr: string; code: number | null; timedOut: boolean }> {
  return new Promise((resolve) => {
    const proc = spawn(binPath, [], { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = ''; let stderr = ''; let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; try { proc.kill('SIGKILL'); } catch {} }, RUN_TIMEOUT_MS);
    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('error', (e) => { clearTimeout(timer); resolve({ stdout, stderr: stderr + e.message, code: null, timedOut: false }); });
    proc.on('close', (code) => { clearTimeout(timer); resolve({ stdout, stderr, code, timedOut }); });
    proc.stdin.write(input);
    proc.stdin.end();
  });
}

async function generateExpectedOutputs(p: ProblemDef): Promise<{ inputs: string[]; outputs: string[]; orders: number[]; subtaskOrders: number[]; isSamples: boolean[] }> {
  const tests = p.generateTests();
  if (tests.length !== 30) throw new Error(`Problem ${p.code} expected 30 tests, got ${tests.length}`);
  const inputs = tests.map((t) => t.input);
  const orders = tests.map((t) => t.order);
  const subtaskOrders = tests.map((t) => t.subtaskOrder);
  const isSamples = tests.map((t) => t.isSample);
  const dir = await mkdtemp(join(tmpdir(), 'chuyentinoj-seed-'));
  const bin = join(dir, 'sol');
  try {
    const compileRes = await compile(p.editorial.cppCode, bin);
    if (!compileRes.ok) throw new Error(`Compile failed for ${p.code}: ${compileRes.log}`);
    const outputs: string[] = [];
    for (let i = 0; i < inputs.length; i++) {
      const res = await runBinary(bin, inputs[i]);
      if (res.timedOut || res.code !== 0) throw new Error(`Solution failed on test ${i + 1} for ${p.code}: code=${res.code} timedOut=${res.timedOut} stderr=${res.stderr}`);
      outputs.push(res.stdout);
    }
    return { inputs, outputs, orders, subtaskOrders, isSamples };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function seedReferenceData() {
  for (const p of PROVINCES) await prisma.province.upsert({ where: { code: p.code }, update: { name: p.name }, create: p });
  for (const t of TAGS) await prisma.tag.upsert({ where: { slug: t.slug }, update: { name: t.name }, create: t });
  for (const y of EXAM_YEARS) await prisma.examYear.upsert({ where: { year: y }, update: {}, create: { year: y } });
}

async function seedUsers() {
  const adminHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@chuyentinoj.vn' },
    update: { name: 'Quản trị viên', passwordHash: adminHash, role: 'ADMIN' },
    create: { email: 'admin@chuyentinoj.vn', name: 'Quản trị viên', passwordHash: adminHash, role: 'ADMIN' }
  });
  const userHash = await bcrypt.hash('user1234', 10);
  await prisma.user.upsert({
    where: { email: 'user@chuyentinoj.vn' },
    update: { name: 'Học sinh mẫu', passwordHash: userHash, role: 'USER' },
    create: { email: 'user@chuyentinoj.vn', name: 'Học sinh mẫu', passwordHash: userHash, role: 'USER' }
  });
}

async function seedProblem(p: ProblemDef): Promise<void> {
  console.log(`[seed] Problem ${p.code} (${p.title})`);
  const { inputs, outputs, orders, subtaskOrders, isSamples } = await generateExpectedOutputs(p);

  const provinceId = p.provinceCode ? (await prisma.province.findUnique({ where: { code: p.provinceCode } }))?.id ?? null : null;
  const examYearId = p.examYear ? (await prisma.examYear.findUnique({ where: { year: p.examYear } }))?.id ?? null : null;

  const data: Prisma.ProblemUncheckedCreateInput = {
    code: p.code,
    title: p.title,
    statement: p.statement,
    inputFormat: p.inputFormat,
    outputFormat: p.outputFormat,
    constraints: p.constraints,
    notes: p.notes,
    difficulty: p.difficulty,
    timeLimitMs: p.timeLimitMs,
    memoryLimitMb: p.memoryLimitMb,
    outputLimitKb: p.outputLimitKb,
    totalPoints: p.totalPoints,
    fileIoEnabled: p.fileIoEnabled,
    fileInputName: p.fileInputName ?? null,
    fileOutputName: p.fileOutputName ?? null,
    showEditorial: p.showEditorial,
    isPublished: p.isPublished,
    provinceId,
    examYearId,
    source: p.source ?? null
  };

  const created = await prisma.problem.upsert({
    where: { code: p.code },
    update: data,
    create: data
  });

  await prisma.problemTag.deleteMany({ where: { problemId: created.id } });
  for (const slug of p.tagSlugs) {
    const tag = await prisma.tag.findUnique({ where: { slug } });
    if (!tag) throw new Error(`Tag ${slug} not found`);
    await prisma.problemTag.create({ data: { problemId: created.id, tagId: tag.id } });
  }

  await prisma.testCase.deleteMany({ where: { problemId: created.id } });
  await prisma.subtask.deleteMany({ where: { problemId: created.id } });

  const subtaskIds: Record<number, string> = {};
  for (const st of p.subtasks) {
    const created2 = await prisma.subtask.create({
      data: {
        problemId: created.id, name: st.name, points: st.points, order: st.order, constraints: st.constraints
      }
    });
    subtaskIds[st.order] = created2.id;
  }

  for (let i = 0; i < inputs.length; i++) {
    await prisma.testCase.create({
      data: {
        problemId: created.id,
        subtaskId: subtaskIds[subtaskOrders[i]] || null,
        order: orders[i],
        isSample: isSamples[i],
        input: inputs[i],
        expectedOutput: outputs[i]
      }
    });
  }

  await prisma.editorial.upsert({
    where: { problemId: created.id },
    update: { ...p.editorial },
    create: { problemId: created.id, ...p.editorial }
  });
}

async function seedContests() {
  for (const c of allContests) {
    const provinceId = c.provinceCode ? (await prisma.province.findUnique({ where: { code: c.provinceCode } }))?.id ?? null : null;
    const created = await prisma.contest.upsert({
      where: { code: c.code },
      update: { title: c.title, description: c.description, durationMin: c.durationMin, totalPoints: c.totalPoints, hasRanking: true, isPublished: true, provinceId, examYear: c.examYear ?? null },
      create: { code: c.code, title: c.title, description: c.description, durationMin: c.durationMin, totalPoints: c.totalPoints, hasRanking: true, isPublished: true, provinceId, examYear: c.examYear ?? null }
    });
    await prisma.contestProblem.deleteMany({ where: { contestId: created.id } });
    for (let i = 0; i < c.problemCodes.length; i++) {
      const problem = await prisma.problem.findUnique({ where: { code: c.problemCodes[i] } });
      if (!problem) throw new Error(`Contest ${c.code}: problem ${c.problemCodes[i]} not found`);
      await prisma.contestProblem.create({
        data: { contestId: created.id, problemId: problem.id, order: i + 1, points: c.problemPoints[i] }
      });
    }
  }
}

async function main() {
  console.log('[seed] Reference data');
  await seedReferenceData();
  console.log('[seed] Users');
  await seedUsers();
  console.log('[seed] Problems');
  for (const p of allProblems) {
    await seedProblem(p);
  }
  console.log('[seed] Contests');
  await seedContests();
  console.log('[seed] DONE');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
