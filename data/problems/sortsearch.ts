import { ProblemDef, TestSpec } from '../types';
import { makeRng, randInt, arr } from '../helpers';

function ts(samples: string[], small: ((r: () => number) => string)[], medium: ((r: () => number) => string)[], large: ((r: () => number) => string)[]): TestSpec[] {
  const out: TestSpec[] = [];
  let idx = 1;
  samples.forEach((s) => out.push({ order: idx++, subtaskOrder: 1, isSample: true, input: s }));
  const r1 = makeRng(411); for (const g of small) out.push({ order: idx++, subtaskOrder: 1, isSample: false, input: g(r1) });
  const r2 = makeRng(422); for (const g of medium) out.push({ order: idx++, subtaskOrder: 2, isSample: false, input: g(r2) });
  const r3 = makeRng(433); for (const g of large) out.push({ order: idx++, subtaskOrder: 3, isSample: false, input: g(r3) });
  return out;
}

// 1. SS-KTH — Phần tử lớn thứ K
export const SS_KTH: ProblemDef = {
  code: 'SS-KTH',
  title: 'Phần tử lớn thứ K',
  statement: `Cho mảng a[1..n] và số K (1 ≤ K ≤ n). Hãy in ra giá trị lớn thứ K trong mảng (tính cả lặp). Ví dụ: a = [3,1,3,2], K = 2 → đáp án 3 (giá trị lớn thứ hai khi sắp giảm: 3,3,2,1).`,
  inputFormat: 'Dòng 1: n và K.\nDòng 2: n số nguyên a[1..n].',
  outputFormat: 'In ra giá trị lớn thứ K.',
  constraints: '1 ≤ K ≤ n ≤ 2*10^5, |a[i]| ≤ 10^9.',
  difficulty: 'EASY',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'binh-dinh', examYear: 2022, source: 'Tự biên soạn theo phong cách đề Bình Định.',
  tagSlugs: ['sap-xep'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n ≤ 1000.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n ≤ 10^4.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n ≤ 2*10^5.' }
  ],
  generateTests: () => ts(
    ['4 2\n3 1 3 2\n', '5 1\n5 5 5 5 5\n', '5 5\n10 20 30 40 50\n'],
    arr(7, () => (r) => { const n = randInt(r, 5, 1000); const k = randInt(r, 1, n); return `${n} ${k}\n${arr(n, () => randInt(r, -100, 100)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 5000, 10000); const k = randInt(r, 1, n); return `${n} ${k}\n${arr(n, () => randInt(r, -1000, 1000)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 150000, 200000); const k = randInt(r, 1, n); return `${n} ${k}\n${arr(n, () => randInt(r, -1_000_000_000, 1_000_000_000)).join(' ')}\n`; })
  ),
  editorial: {
    idea: 'Sắp xếp mảng giảm dần và lấy phần tử thứ K.',
    observations: 'Cùng có thể dùng nth_element O(n) nhưng sort cho code ngắn gọn và đủ nhanh.',
    approach: 'sort(a.rbegin(), a.rend()); in a[K-1].',
    algorithmAnalysis: 'O(n log n).',
    timeComplexity: 'O(n log n)',
    memoryComplexity: 'O(n)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, k; cin >> n >> k;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    sort(a.begin(), a.end(), greater<long long>());
    cout << a[k - 1] << '\\n';
}
`,
    codeExplanation: 'Sort giảm dần rồi in phần tử thứ K-1 (0-based).',
    commonMistakes: '- Quên K là 1-based.\n- Dùng partial_sort sai chỉ số.'
  }
};

// 2. SS-MERGE — Trộn hai dãy đã sắp
export const SS_MERGE: ProblemDef = {
  code: 'SS-MERGE',
  title: 'Trộn hai dãy sắp xếp',
  statement: `Cho hai dãy đã sắp xếp tăng dần a[1..n] và b[1..m]. Hãy trộn hai dãy thành một dãy sắp xếp tăng dần.`,
  inputFormat: 'Dòng 1: n và m.\nDòng 2: n số nguyên a.\nDòng 3: m số nguyên b.',
  outputFormat: 'In ra n + m số nguyên đã sắp xếp.',
  constraints: '1 ≤ n, m ≤ 10^5, |a[i]|, |b[i]| ≤ 10^9.',
  difficulty: 'EASY',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'phu-yen', examYear: 2020, source: 'Tự biên soạn theo phong cách đề Phú Yên.',
  tagSlugs: ['sap-xep'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n, m ≤ 1000.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n, m ≤ 10^4.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n, m ≤ 10^5.' }
  ],
  generateTests: () => {
    function gen(r: () => number, n: number, m: number) {
      const a = arr(n, () => randInt(r, -1000, 1000)).sort((x, y) => x - y);
      const b = arr(m, () => randInt(r, -1000, 1000)).sort((x, y) => x - y);
      return `${n} ${m}\n${a.join(' ')}\n${b.join(' ')}\n`;
    }
    return ts(
      ['3 3\n1 4 5\n2 3 6\n', '2 2\n1 2\n3 4\n', '1 1\n0\n0\n'],
      arr(7, () => (r) => gen(r, randInt(r, 5, 1000), randInt(r, 5, 1000))),
      arr(10, () => (r) => gen(r, randInt(r, 5000, 10000), randInt(r, 5000, 10000))),
      arr(10, () => (r) => gen(r, randInt(r, 80000, 100000), randInt(r, 80000, 100000)))
    );
  },
  editorial: {
    idea: 'Dùng kỹ thuật hai con trỏ duyệt song song hai mảng.',
    observations: 'Khi một mảng hết, append phần còn lại của mảng kia.',
    approach: 'i, j = 0. Trong khi i < n và j < m: nếu a[i] ≤ b[j] in a[i++]; ngược lại in b[j++]. Sau đó in nốt phần còn lại.',
    algorithmAnalysis: 'O(n + m).',
    timeComplexity: 'O(n + m)',
    memoryComplexity: 'O(n + m)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m; cin >> n >> m;
    vector<long long> a(n), b(m);
    for (auto& x : a) cin >> x;
    for (auto& x : b) cin >> x;
    int i = 0, j = 0; bool first = true;
    auto put = [&](long long v) { if (!first) cout << ' '; cout << v; first = false; };
    while (i < n && j < m) { if (a[i] <= b[j]) put(a[i++]); else put(b[j++]); }
    while (i < n) put(a[i++]);
    while (j < m) put(b[j++]);
    cout << '\\n';
}
`,
    codeExplanation: 'Hai con trỏ i, j duyệt a và b. Phần tử nhỏ hơn in trước.',
    commonMistakes: '- Gộp rồi sort tốn O((n+m) log(n+m)), vẫn pass nhưng không đúng tinh thần đề.\n- Quên in phần còn lại.'
  }
};

// 3. SS-BINSEARCH — Đếm số ≥ X
export const SS_BINSEARCH: ProblemDef = {
  code: 'SS-BINSEARCH',
  title: 'Truy vấn đếm số lớn hơn',
  statement: `Cho mảng a[1..n] (đã sắp tăng dần) và q truy vấn. Mỗi truy vấn là số X, đếm số phần tử của a có giá trị ≥ X.`,
  inputFormat: 'Dòng 1: n và q.\nDòng 2: n số nguyên (đã sắp tăng).\nq dòng tiếp theo, mỗi dòng một số X.',
  outputFormat: 'q dòng, mỗi dòng là kết quả tương ứng.',
  constraints: '1 ≤ n, q ≤ 2*10^5, |a[i]|, |X| ≤ 10^9.',
  difficulty: 'MEDIUM',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'khanh-hoa', examYear: 2024, source: 'Tự biên soạn theo phong cách đề Khánh Hòa.',
  tagSlugs: ['sap-xep'],
  subtasks: [
    { name: 'Subtask 1', points: 40, order: 1, constraints: 'n, q ≤ 1000, brute force O(n*q).' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n, q ≤ 5*10^4.' },
    { name: 'Subtask 3', points: 30, order: 3, constraints: 'n, q ≤ 2*10^5.' }
  ],
  generateTests: () => {
    function gen(r: () => number, n: number, q: number, vlim: number) {
      const a = arr(n, () => randInt(r, -vlim, vlim)).sort((x, y) => x - y);
      const queries = arr(q, () => randInt(r, -vlim, vlim));
      return `${n} ${q}\n${a.join(' ')}\n${queries.join('\n')}\n`;
    }
    return ts(
      ['5 3\n1 2 2 4 5\n2\n3\n6\n', '1 1\n10\n5\n', '3 2\n-1 0 1\n0\n2\n'],
      arr(7, () => (r) => gen(r, randInt(r, 5, 1000), randInt(r, 5, 1000), 1000)),
      arr(10, () => (r) => gen(r, randInt(r, 30000, 50000), randInt(r, 30000, 50000), 1_000_000)),
      arr(10, () => (r) => gen(r, randInt(r, 150000, 200000), randInt(r, 150000, 200000), 1_000_000_000))
    );
  },
  editorial: {
    idea: 'Vì a đã sắp tăng, ta dùng lower_bound để tìm vị trí đầu tiên ≥ X. Số phần tử ≥ X = n - pos.',
    observations: 'Brute force O(n*q) chỉ qua subtask 1.',
    approach: 'Đọc mảng. Với mỗi truy vấn X, gọi lower_bound trên a; in n - (it - a.begin()).',
    algorithmAnalysis: 'O((n + q) log n).',
    timeComplexity: 'O((n+q) log n)',
    memoryComplexity: 'O(n)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, q; cin >> n >> q;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    while (q--) {
        long long X; cin >> X;
        auto it = lower_bound(a.begin(), a.end(), X);
        cout << (a.end() - it) << '\\n';
    }
}
`,
    codeExplanation: 'lower_bound trả về iterator đầu tiên ≥ X. Khoảng cách tới end là số phần tử ≥ X.',
    commonMistakes: '- Dùng upper_bound đếm sai (đếm > X).\n- Quên dùng I/O nhanh khi q lớn.'
  }
};
