import { ProblemDef, TestSpec } from '../types';
import { makeRng, randInt, arr } from '../helpers';

function ts(samples: string[], small: ((r: () => number) => string)[], medium: ((r: () => number) => string)[], large: ((r: () => number) => string)[]): TestSpec[] {
  const out: TestSpec[] = [];
  let idx = 1;
  samples.forEach((s) => out.push({ order: idx++, subtaskOrder: 1, isSample: true, input: s }));
  const r1 = makeRng(911); for (const g of small) out.push({ order: idx++, subtaskOrder: 1, isSample: false, input: g(r1) });
  const r2 = makeRng(922); for (const g of medium) out.push({ order: idx++, subtaskOrder: 2, isSample: false, input: g(r2) });
  const r3 = makeRng(933); for (const g of large) out.push({ order: idx++, subtaskOrder: 3, isSample: false, input: g(r3) });
  return out;
}

// BT-SUBSET — Đếm tập con tổng bằng S
export const BT_SUBSET: ProblemDef = {
  code: 'BT-SUBSET',
  title: 'Đếm tập con tổng bằng S',
  statement: `Cho n số nguyên dương a[1..n] và số S. Đếm số tập con (kể cả tập rỗng) có tổng bằng S.`,
  inputFormat: 'Dòng 1: n và S.\nDòng 2: n số nguyên.',
  outputFormat: 'Số tập con có tổng bằng S.',
  constraints: '1 ≤ n ≤ 30, 0 ≤ S ≤ 10^9, 1 ≤ a[i] ≤ 10^8.',
  difficulty: 'HARD',
  timeLimitMs: 2000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'khanh-hoa', examYear: 2022, source: 'Tự biên soạn theo phong cách đề Khánh Hòa.',
  tagSlugs: ['de-quy'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n ≤ 15.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n ≤ 22.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n ≤ 30, dùng meet-in-the-middle.' }
  ],
  generateTests: () => {
    function gen(r: () => number, n: number, vlim: number) {
      const a = arr(n, () => randInt(r, 1, vlim));
      const S = a.filter(() => r() < 0.5).reduce((x, y) => x + y, 0);
      return `${n} ${S}\n${a.join(' ')}\n`;
    }
    return ts(
      ['4 3\n1 2 3 4\n', '3 0\n5 6 7\n', '1 1\n1\n'],
      arr(7, () => (r) => gen(r, randInt(r, 5, 15), 100)),
      arr(10, () => (r) => gen(r, randInt(r, 18, 22), 100000)),
      arr(10, () => (r) => gen(r, randInt(r, 25, 30), 100_000_000))
    );
  },
  editorial: {
    idea: 'Chia n phần tử thành hai nửa. Sinh tất cả tổng tập con của mỗi nửa, sau đó với mỗi tổng x ở nửa 1, đếm số y ở nửa 2 sao cho x + y = S.',
    observations: 'Brute force 2^n = 2^30 = 10^9 sẽ TLE. Meet-in-the-middle giảm còn 2 * 2^15 = ~65000.',
    approach: 'Sinh tổng cho nửa A và nửa B. Sort B. Với mỗi a thuộc A, đếm số b thuộc B mà b = S - a (dùng equal_range hoặc map).',
    algorithmAnalysis: 'O(2^(n/2) * n).',
    timeComplexity: 'O(2^(n/2) * log)',
    memoryComplexity: 'O(2^(n/2))',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; long long S; cin >> n >> S;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    int n1 = n / 2, n2 = n - n1;
    vector<long long> A, B;
    for (int m = 0; m < (1 << n1); ++m) {
        long long s = 0;
        for (int i = 0; i < n1; ++i) if (m & (1 << i)) s += a[i];
        A.push_back(s);
    }
    for (int m = 0; m < (1 << n2); ++m) {
        long long s = 0;
        for (int i = 0; i < n2; ++i) if (m & (1 << i)) s += a[n1 + i];
        B.push_back(s);
    }
    sort(B.begin(), B.end());
    long long ans = 0;
    for (long long x : A) {
        long long need = S - x;
        auto pr = equal_range(B.begin(), B.end(), need);
        ans += pr.second - pr.first;
    }
    cout << ans << '\\n';
}
`,
    codeExplanation: 'Sinh tổng nửa A và B. Với mỗi tổng x ở A, tìm số tổng y = S - x ở B bằng equal_range.',
    commonMistakes: '- Cố gắng duyệt 2^n trực tiếp → TLE.\n- Sai chỉ số khi chia n1, n2.'
  }
};
