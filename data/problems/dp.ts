import { ProblemDef, TestSpec } from '../types';
import { makeRng, randInt, arr } from '../helpers';

function ts(samples: string[], small: ((r: () => number) => string)[], medium: ((r: () => number) => string)[], large: ((r: () => number) => string)[]): TestSpec[] {
  const out: TestSpec[] = [];
  let idx = 1;
  samples.forEach((s) => out.push({ order: idx++, subtaskOrder: 1, isSample: true, input: s }));
  const r1 = makeRng(811); for (const g of small) out.push({ order: idx++, subtaskOrder: 1, isSample: false, input: g(r1) });
  const r2 = makeRng(822); for (const g of medium) out.push({ order: idx++, subtaskOrder: 2, isSample: false, input: g(r2) });
  const r3 = makeRng(833); for (const g of large) out.push({ order: idx++, subtaskOrder: 3, isSample: false, input: g(r3) });
  return out;
}

// 1. DP-LIS — Longest increasing subsequence
export const DP_LIS: ProblemDef = {
  code: 'DP-LIS',
  title: 'Dãy con tăng dài nhất',
  statement: `Cho dãy a[1..n]. Tìm độ dài DÃY CON TĂNG nghiêm ngặt DÀI NHẤT của a.`,
  inputFormat: 'Dòng 1: n.\nDòng 2: n số nguyên.',
  outputFormat: 'In ra độ dài dãy con tăng dài nhất.',
  constraints: '1 ≤ n ≤ 10^5, |a[i]| ≤ 10^9.',
  difficulty: 'HARD',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'da-nang', examYear: 2024, source: 'Tự biên soạn theo phong cách đề Đà Nẵng.',
  tagSlugs: ['qhd'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n ≤ 100, DP O(n^2).' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n ≤ 5000.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n ≤ 10^5, cần thuật toán O(n log n).' }
  ],
  generateTests: () => ts(
    ['6\n3 1 4 1 5 9\n', '5\n1 2 3 4 5\n', '5\n5 4 3 2 1\n'],
    arr(7, () => (r) => { const n = randInt(r, 5, 100); return `${n}\n${arr(n, () => randInt(r, -100, 100)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 2000, 5000); return `${n}\n${arr(n, () => randInt(r, -1000, 1000)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 80000, 100000); return `${n}\n${arr(n, () => randInt(r, -1_000_000_000, 1_000_000_000)).join(' ')}\n`; })
  ),
  editorial: {
    idea: 'Duy trì mảng tails[], với tails[k] là giá trị nhỏ nhất kết thúc một LIS dài k+1. Khi duyệt a[i], tìm vị trí thay thế bằng lower_bound.',
    observations: 'Mảng tails luôn tăng nghiêm ngặt; do đó dùng nhị phân tìm.',
    approach: 'tails ban đầu rỗng. Với mỗi x: vị trí pos = lower_bound(tails, x); nếu pos == tails.size() thì push_back x, ngược lại tails[pos] = x.',
    algorithmAnalysis: 'O(n log n).',
    timeComplexity: 'O(n log n)',
    memoryComplexity: 'O(n)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin >> n;
    vector<long long> tails;
    for (int i = 0; i < n; ++i) {
        long long x; cin >> x;
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    cout << tails.size() << '\\n';
}
`,
    codeExplanation: 'Patience sorting: duy trì mảng tails đại diện cho giá trị cuối cùng nhỏ nhất với mỗi độ dài.',
    commonMistakes: '- Dùng upper_bound thay vì lower_bound → LIS không nghiêm ngặt.\n- DP O(n^2) chỉ qua subtask nhỏ.'
  }
};

// 2. DP-COIN — Knapsack 0/1 nhỏ
export const DP_COIN: ProblemDef = {
  code: 'DP-COIN',
  title: 'Balo cơ bản',
  statement: `Có n vật phẩm, vật phẩm i có khối lượng w[i] và giá trị v[i]. Có balo sức chứa W. Mỗi vật phẩm chỉ được lấy nhiều nhất 1 lần. Tìm tổng giá trị lớn nhất khi tổng khối lượng các vật được chọn ≤ W.`,
  inputFormat: 'Dòng 1: n và W.\nn dòng sau, mỗi dòng w[i] và v[i].',
  outputFormat: 'Tổng giá trị lớn nhất.',
  constraints: '1 ≤ n ≤ 100, 1 ≤ W ≤ 10000, 1 ≤ w[i], v[i] ≤ 10^4.',
  difficulty: 'MEDIUM',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'quang-nam', examYear: 2023, source: 'Tự biên soạn theo phong cách đề Quảng Nam.',
  tagSlugs: ['qhd'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n, W ≤ 20.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n ≤ 50, W ≤ 1000.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n ≤ 100, W ≤ 10^4.' }
  ],
  generateTests: () => {
    function gen(r: () => number, n: number, W: number) {
      const items: string[] = [];
      for (let i = 0; i < n; i++) items.push(`${randInt(r, 1, W)} ${randInt(r, 1, 100)}`);
      return `${n} ${W}\n${items.join('\n')}\n`;
    }
    return ts(
      ['3 5\n2 3\n3 4\n4 5\n', '1 10\n5 7\n', '2 1\n2 100\n3 200\n'],
      arr(7, () => (r) => gen(r, randInt(r, 5, 20), randInt(r, 5, 20))),
      arr(10, () => (r) => gen(r, randInt(r, 30, 50), randInt(r, 500, 1000))),
      arr(10, () => (r) => gen(r, randInt(r, 80, 100), randInt(r, 5000, 10000)))
    );
  },
  editorial: {
    idea: 'DP balo 0/1: dp[j] là giá trị max khi tổng khối lượng ≤ j. Với mỗi item, duyệt j từ W về w[i] và cập nhật dp[j] = max(dp[j], dp[j - w[i]] + v[i]).',
    observations: 'Duyệt ngược chiều j để tránh dùng lại 1 item.',
    approach: 'Khởi tạo dp[0..W] = 0. Vòng for item, vòng for j từ W về w[i].',
    algorithmAnalysis: 'O(n*W) = 10^6, đủ nhanh.',
    timeComplexity: 'O(n*W)',
    memoryComplexity: 'O(W)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, W; cin >> n >> W;
    vector<long long> dp(W + 1, 0);
    for (int i = 0; i < n; ++i) {
        int w, v; cin >> w >> v;
        for (int j = W; j >= w; --j) dp[j] = max(dp[j], dp[j - w] + v);
    }
    cout << dp[W] << '\\n';
}
`,
    codeExplanation: 'Mảng DP 1 chiều, duyệt j ngược chiều để mỗi item dùng tối đa 1 lần.',
    commonMistakes: '- Duyệt j theo chiều tăng dần → bài toán balo không giới hạn (cho lấy lặp).\n- Quên long long cho v lớn (vẫn vừa int).'
  }
};
