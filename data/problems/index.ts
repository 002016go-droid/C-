import * as arith from './arith';
import * as array from './array';
import * as str from './string';
import * as sortsearch from './sortsearch';
import * as prefix from './prefix';
import * as twoptr from './twoptr';
import * as greedy from './greedy';
import * as dp from './dp';
import * as backtrack from './backtrack';
import * as bfsdfs from './bfsdfs';
import { ProblemDef, ContestDef } from '../types';

export const allProblems: ProblemDef[] = [
  arith.AR_SUM_DIV, arith.AR_PRIME, arith.AR_GCD, arith.AR_PERFECT, arith.AR_DIGIT,
  array.AR_MAX2, array.AR_FREQ, array.AR_SHIFT, array.AR_INVERSE, array.AR_SECOND_MIN,
  str.ST_COUNT_VOWEL, str.ST_PALIN, str.ST_ANAGRAM, str.ST_COMPRESS,
  sortsearch.SS_KTH, sortsearch.SS_MERGE, sortsearch.SS_BINSEARCH,
  prefix.PS_RANGE, prefix.PS_COUNTEQ, prefix.PS_DIFF,
  twoptr.TP_SUMK, twoptr.TP_LONGEST, twoptr.TP_DISTINCT,
  greedy.GR_ACTIVITY, greedy.GR_COIN, greedy.GR_MEETING,
  dp.DP_LIS, dp.DP_COIN,
  backtrack.BT_SUBSET,
  bfsdfs.BFS_GRID
];

export const allContests: ContestDef[] = [
  {
    code: 'MOCK-MIEN-TRUNG-01',
    title: 'Đề mô phỏng chuyên Tin vào 10 - Miền Trung số 01',
    description: 'Đề mô phỏng phong cách chuyên Tin vào 10 các tỉnh miền Trung: số học, mảng, hai con trỏ, quy hoạch động cơ bản.',
    durationMin: 150,
    totalPoints: 10,
    problemCodes: ['AR-SUM-DIV', 'AR-FREQ', 'TP-SUMK', 'DP-COIN'],
    problemPoints: [3, 3, 2, 2],
    provinceCode: 'quang-nam',
    examYear: 2024
  },
  {
    code: 'MOCK-MIEN-TRUNG-02',
    title: 'Đề mô phỏng chuyên Tin vào 10 - Miền Trung số 02',
    description: 'Đề mô phỏng: số nguyên tố, xâu, prefix sum, BFS lưới.',
    durationMin: 150,
    totalPoints: 10,
    problemCodes: ['AR-PRIME', 'ST-ANAGRAM', 'PS-RANGE', 'BFS-GRID'],
    problemPoints: [3, 3, 2, 2],
    provinceCode: 'da-nang',
    examYear: 2024
  },
  {
    code: 'MOCK-MIEN-TRUNG-03',
    title: 'Đề mô phỏng chuyên Tin vào 10 - Miền Trung số 03',
    description: 'Đề mô phỏng: kỹ thuật cơ bản, đoạn liên tiếp, tham lam, DP.',
    durationMin: 150,
    totalPoints: 10,
    problemCodes: ['AR-DIGIT', 'ST-PALIN', 'PS-COUNTEQ', 'DP-LIS'],
    problemPoints: [3, 3, 2, 2],
    provinceCode: 'quang-ngai',
    examYear: 2024
  }
];
