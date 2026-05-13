// Standalone judge worker. Run with: npm run judge:worker
// Poll the DB every 500ms for PENDING submissions and judge them sequentially.
// Prisma Client auto-loads .env when imported, so JUDGE_MODE/DATABASE_URL/etc.
// from .env are available here without explicitly importing dotenv.
import { judgeSubmission } from './runner';
import { pickPendingSubmission } from './queue';

const POLL_MS = 500;

async function loop() {
  // eslint-disable-next-line no-console
  console.log('[judge-worker] started, mode=', process.env.JUDGE_MODE || 'local');
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const id = await pickPendingSubmission();
      if (!id) {
        await new Promise((r) => setTimeout(r, POLL_MS));
        continue;
      }
      // eslint-disable-next-line no-console
      console.log('[judge-worker] judging', id);
      await judgeSubmission(id);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[judge-worker] error', err);
      await new Promise((r) => setTimeout(r, POLL_MS));
    }
  }
}

loop();
