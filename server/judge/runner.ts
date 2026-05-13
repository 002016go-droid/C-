// Core judging logic. Pure function over Prisma: pick a submission, run it,
// and update the database. Used both by the inline judging path (after a
// submit API call we spawn `judgeSubmission` as fire-and-forget) and by the
// standalone worker script (`server/judge/worker.ts`).

import { prisma } from '../../lib/db';
import { compareOutputs } from './compare';
import { getExecutor } from './index';
import type { Verdict } from './types';

const STATUS_FROM_VERDICT: Record<Verdict, string> = {
  PENDING: 'PENDING',
  JUDGING: 'JUDGING',
  ACCEPTED: 'ACCEPTED',
  WRONG_ANSWER: 'WRONG_ANSWER',
  TIME_LIMIT_EXCEEDED: 'TIME_LIMIT_EXCEEDED',
  MEMORY_LIMIT_EXCEEDED: 'MEMORY_LIMIT_EXCEEDED',
  RUNTIME_ERROR: 'RUNTIME_ERROR',
  COMPILATION_ERROR: 'COMPILATION_ERROR',
  OUTPUT_LIMIT_EXCEEDED: 'OUTPUT_LIMIT_EXCEEDED',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  SKIPPED: 'WRONG_ANSWER'
};

export async function judgeSubmission(submissionId: string): Promise<void> {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      problem: {
        include: {
          subtasks: { orderBy: { order: 'asc' }, include: { testCases: { orderBy: { order: 'asc' } } } },
          testCases: { orderBy: { order: 'asc' } }
        }
      }
    }
  });
  if (!submission) return;

  await prisma.submission.update({ where: { id: submissionId }, data: { status: 'JUDGING', verdict: null, totalScore: 0 } });
  await prisma.submissionResult.deleteMany({ where: { submissionId } });

  const exec = getExecutor();
  const compile = await exec.compileCpp(submission.sourceCode);
  try {
    if (!compile.ok || !compile.artifactPath) {
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: 'COMPILATION_ERROR',
          verdict: 'COMPILATION_ERROR',
          compileLog: compile.log.slice(0, 20000),
          totalScore: 0
        }
      });
      return;
    }

    // Build list of subtasks. If a problem has none, treat all test cases as
    // a single implicit subtask worth `totalPoints`.
    const subtasks = submission.problem.subtasks;
    const useSubtasks = subtasks.length > 0;
    const groupedTests = useSubtasks
      ? subtasks.map((s) => ({ subtaskId: s.id, name: s.name, points: s.points, tests: s.testCases }))
      : [{ subtaskId: null, name: 'Toàn bài', points: submission.problem.totalPoints, tests: submission.problem.testCases }];

    let totalScore = 0;
    let overallVerdict: Verdict = 'ACCEPTED';
    let maxRuntime = 0;

    for (const group of groupedTests) {
      let groupVerdict: Verdict = 'ACCEPTED';
      let groupMessage = '';
      for (const t of group.tests) {
        const tl = t.timeLimitMs ?? submission.problem.timeLimitMs;
        const ml = t.memoryLimitMb ?? submission.problem.memoryLimitMb;
        const ol = submission.problem.outputLimitKb;
        if (groupVerdict !== 'ACCEPTED') {
          await prisma.submissionResult.create({
            data: {
              submissionId,
              subtaskId: group.subtaskId,
              testCaseId: t.id,
              verdict: 'SKIPPED',
              points: 0,
              message: 'Bỏ qua do subtask đã fail'
            }
          });
          continue;
        }
        const runRes = await exec.run({
          artifactPath: compile.artifactPath,
          input: t.input,
          timeLimitMs: tl,
          memoryLimitMb: ml,
          outputLimitKb: ol
        });
        maxRuntime = Math.max(maxRuntime, runRes.runtimeMs);
        let verdict: Verdict = runRes.verdict;
        if (verdict === 'ACCEPTED') {
          const ok = compareOutputs(runRes.stdout, t.expectedOutput, 'normalized');
          if (!ok) verdict = 'WRONG_ANSWER';
        }
        await prisma.submissionResult.create({
          data: {
            submissionId,
            subtaskId: group.subtaskId,
            testCaseId: t.id,
            verdict,
            runtimeMs: runRes.runtimeMs,
            memoryKb: runRes.memoryKb,
            points: 0,
            message: runRes.message?.slice(0, 500) ?? ''
          }
        });
        if (verdict !== 'ACCEPTED') {
          groupVerdict = verdict;
          groupMessage = `Fail tại test ${t.order}`;
        }
      }
      const groupPoints = groupVerdict === 'ACCEPTED' ? group.points : 0;
      totalScore += groupPoints;
      if (group.subtaskId) {
        await prisma.submissionResult.create({
          data: {
            submissionId,
            subtaskId: group.subtaskId,
            isSubtaskAggregate: true,
            verdict: groupVerdict,
            points: groupPoints,
            message: groupMessage
          }
        });
      }
      if (groupVerdict !== 'ACCEPTED' && overallVerdict === 'ACCEPTED') overallVerdict = groupVerdict;
    }

    const finalStatus = totalScore === submission.problem.totalPoints && overallVerdict === 'ACCEPTED'
      ? 'ACCEPTED'
      : STATUS_FROM_VERDICT[overallVerdict] ?? 'WRONG_ANSWER';

    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: finalStatus,
        verdict: finalStatus,
        totalScore,
        maxScore: submission.problem.totalPoints,
        runtimeMs: maxRuntime,
        compileLog: compile.log.slice(0, 5000)
      }
    });

    // Update user progress
    await prisma.userProblemProgress.upsert({
      where: { userId_problemId: { userId: submission.userId, problemId: submission.problemId } },
      update: {
        attempts: { increment: 1 },
        bestScore: { set: undefined },
        lastTriedAt: new Date()
      },
      create: {
        userId: submission.userId,
        problemId: submission.problemId,
        attempts: 1,
        bestScore: totalScore,
        solved: finalStatus === 'ACCEPTED',
        lastTriedAt: new Date()
      }
    });
    // refresh bestScore/solved after increment (cannot do in single upsert with conditional)
    const prog = await prisma.userProblemProgress.findUnique({
      where: { userId_problemId: { userId: submission.userId, problemId: submission.problemId } }
    });
    if (prog) {
      await prisma.userProblemProgress.update({
        where: { id: prog.id },
        data: {
          bestScore: Math.max(prog.bestScore, totalScore),
          solved: prog.solved || finalStatus === 'ACCEPTED'
        }
      });
    }
  } catch (err) {
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: 'SYSTEM_ERROR', verdict: 'SYSTEM_ERROR', judgeMessage: String(err).slice(0, 1000) }
    });
  } finally {
    if (compile.cleanup) await compile.cleanup();
  }
}
