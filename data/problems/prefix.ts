import { ProblemDef, TestSpec } from '../types';
import { makeRng, randInt, arr } from '../helpers';

function ts(samples: string[], small: ((r: () => number) => string)[], medium: ((r: () => number) => string)[], large: ((r: () => number) => string)[]): TestSpec[] {
  const out: TestSpec[] = [];
  let idx = 1;
  samples.forEach((s) => out.push({ order: idx++, subtaskOrder: 1, isSample: true, input: s }));
  const r1 = makeRng(511); for (const g of small) out.push({ order: idx++, subtaskOrder: 1, isSample: false, input: g(r1) });
  const r2 = makeRng(522); for (const g of medium) out.push({ order: idx++, subtaskOrder: 2, isSample: false, input: g(r2) });
  const r3 = makeRng(533); for (const g of large) out.push({ order: idx++, subtaskOrder: 3, isSample: false, input: g(r3) });
  return out;
}

// 1. PS-RANGE — Truy vấn tổng đoạn
export const PS_RANGE: ProblemDef = {
  code: 'PS-RANGE',
  title: 'Truy vấn tổng đoạn',
  statement: `Cho mảng a[1..n] và q truy vấn dạng (L, R). Mỗi truy vấn yêu cầu tính tổng a[L] + a[L+1] + ... + a[R].`,
  inputFormat: 'Dòng 1: n và q.\nDòng 2: n số nguyên a[1..n].\nq dòng sau, mỗi dòng hai số L và R (1 ≤ L ≤ R ≤ n).',
  outputFormat: 'q dòng, mỗi dòng tổng a[L..R].',
  constraints: '1 ≤ n, q ≤ 2*10^5, |a[i]| ≤ 10^9.',
  difficulty: 'EASY',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'quang-nam', examYear: 2024, source: 'Tự biên soạn theo phong cách đề Quảng Nam.',
  tagSlugs: ['prefix-sum'],
  subtasks: [
    { name: 'Subtask 1', points: 40, order: 1, constraints: 'n, q ≤ 1000, brute force O(n*q).' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n, q ≤ 5*10^4.' },
    { name: 'Subtask 3', points: 30, order: 3, constraints: 'n, q ≤ 2*10^5.' }
  ],
  generateTests: () => {
    function gen(r: () => number, n: number, q: number) {
      const a = arr(n, () => randInt(r, -1_000_000_000, 1_000_000_000));
      const queries = arr(q, () => { let l = randInt(r, 1, n); let R = randInt(r, l, n); return `${l} ${R}`; });
      return `${n} ${q}\n${a.join(' ')}\n${queries.join('\n')}\n`;
    }
    return ts(
      ['5 2\n1 2 3 4 5\n1 5\n2 4\n', '3 1\n-1 -1 -1\n1 3\n', '1 1\n7\n1 1\n'],
      arr(7, () => (r) => gen(r, randInt(r, 5, 1000), randInt(r, 5, 1000))),
      arr(10, () => (r) => gen(r, randInt(r, 30000, 50000), randInt(r, 30000, 50000))),
      arr(10, () => (r) => gen(r, randInt(r, 150000, 200000), randInt(r, 150000, 200000)))
    );
  },
  editorial: {
    idea: 'Tính prefix[i] = a[1] + a[2] + ... + a[i]. Tổng a[L..R] = prefix[R] - prefix[L-1].',
    observations: 'Tổng có thể lớn nên prefix nên là long long.',
    approach: 'Dựng prefix O(n). Mỗi truy vấn O(1).',
    algorithmAnalysis: 'O(n + q).',
    timeComplexity: 'O(n + q)',
    memoryComplexity: 'O(n)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, q; cin >> n >> q;
    vector<long long> p(n + 1, 0);
    for (int i = 1; i <= n; ++i) { long long x; cin >> x; p[i] = p[i-1] + x; }
    while (q--) {
        int L, R; cin >> L >> R;
        cout << (p[R] - p[L-1]) << '\\n';
    }
}
`,
    codeExplanation: 'Dựng prefix p[i]. Truy vấn trả p[R] - p[L-1].',
    commonMistakes: '- Dùng int cho prefix dễ tràn.\n- Sai chỉ số khi tính p[L-1].'
  }
};

// 2. PS-COUNTEQ — Đếm khoảng có tổng bằng 0
export const PS_COUNTEQ: ProblemDef = {
  code: 'PS-COUNTEQ',
  title: 'Đếm đoạn có tổng bằng 0',
  statement: `Cho mảng a[1..n] gồm số nguyên (có thể âm). Đếm số đoạn liên tiếp [L, R] có tổng bằng 0.`,
  inputFormat: 'Dòng 1: n.\nDòng 2: n số nguyên.',
  outputFormat: 'In ra số đoạn có tổng bằng 0.',
  constraints: '1 ≤ n ≤ 2*10^5, |a[i]| ≤ 10^9.',
  difficulty: 'MEDIUM',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'da-nang', examYear: 2024, source: 'Tự biên soạn theo phong cách đề Đà Nẵng.',
  tagSlugs: ['prefix-sum', 'stack-queue'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n ≤ 1000, brute force O(n^2).' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n ≤ 5*10^4.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n ≤ 2*10^5.' }
  ],
  generateTests: () => ts(
    ['5\n1 -1 2 -2 0\n', '3\n1 2 3\n', '4\n0 0 0 0\n'],
    arr(7, () => (r) => { const n = randInt(r, 5, 1000); return `${n}\n${arr(n, () => randInt(r, -3, 3)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 30000, 50000); return `${n}\n${arr(n, () => randInt(r, -10, 10)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 150000, 200000); return `${n}\n${arr(n, () => randInt(r, -2, 2)).join(' ')}\n`; })
  ),
  editorial: {
    idea: 'Đoạn tổng 0 ↔ prefix[L-1] = prefix[R]. Đếm số cặp prefix có giá trị bằng nhau.',
    observations: 'Dùng map<long long,int> đếm tần suất prefix; với mỗi giá trị xuất hiện c lần, có C(c,2) cặp; cũng nên cộng các cặp tạo bởi prefix=0 (đoạn bắt đầu từ 1).',
    approach: 'Khởi tạo cnt[0] = 1. Duyệt prefix, mỗi lần cộng cnt[p] rồi ++cnt[p]. Tổng ans = Σ.',
    algorithmAnalysis: 'O(n log n) với map, O(n) với unordered_map.',
    timeComplexity: 'O(n log n)',
    memoryComplexity: 'O(n)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin >> n;
    map<long long,long long> cnt;
    cnt[0] = 1;
    long long pref = 0, ans = 0;
    for (int i = 0; i < n; ++i) {
        long long x; cin >> x;
        pref += x;
        ans += cnt[pref];
        ++cnt[pref];
    }
    cout << ans << '\\n';
}
`,
    codeExplanation: 'Đếm theo prefix: mỗi lần gặp prefix p đã có cnt[p] lần thì có thêm cnt[p] đoạn tổng 0 kết thúc tại i.',
    commonMistakes: '- Quên khởi tạo cnt[0] = 1.\n- Dùng int cho ans (số đoạn có thể lớn).'
  }
};

// 3. PS-DIFF — Cộng đoạn (difference array)
export const PS_DIFF: ProblemDef = {
  code: 'PS-DIFF',
  title: 'Cập nhật đoạn nhiều lần',
  statement: `Cho mảng a[1..n] ban đầu toàn 0. Thực hiện q phép cập nhật, mỗi phép có dạng (L, R, V): cộng V vào tất cả a[L..R]. Sau q phép, in mảng cuối.`,
  inputFormat: 'Dòng 1: n và q.\nq dòng sau, mỗi dòng L, R, V.',
  outputFormat: 'In ra n số nguyên là mảng cuối.',
  constraints: '1 ≤ n, q ≤ 2*10^5, |V| ≤ 10^9.',
  difficulty: 'MEDIUM',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'hue', examYear: 2023, source: 'Tự biên soạn theo phong cách đề Huế.',
  tagSlugs: ['prefix-sum'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n, q ≤ 1000, brute force.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n, q ≤ 5*10^4.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n, q ≤ 2*10^5.' }
  ],
  generateTests: () => {
    function gen(r: () => number, n: number, q: number) {
      const ops = arr(q, () => { let l = randInt(r, 1, n); let R = randInt(r, l, n); let V = randInt(r, -1000, 1000); return `${l} ${R} ${V}`; });
      return `${n} ${q}\n${ops.join('\n')}\n`;
    }
    return ts(
      ['5 2\n1 3 1\n2 5 2\n', '3 1\n1 3 5\n', '1 1\n1 1 -7\n'],
      arr(7, () => (r) => gen(r, randInt(r, 5, 1000), randInt(r, 5, 1000))),
      arr(10, () => (r) => gen(r, randInt(r, 30000, 50000), randInt(r, 30000, 50000))),
      arr(10, () => (r) => gen(r, randInt(r, 150000, 200000), randInt(r, 150000, 200000)))
    );
  },
  editorial: {
    idea: 'Dùng mảng hiệu (difference array): diff[L] += V, diff[R+1] -= V. Sau đó prefix sum chính là mảng kết quả.',
    observations: 'Không cập nhật từng phần tử trong [L,R] để tránh O(n*q).',
    approach: 'Đọc q phép. Cập nhật diff. Cuối cùng prefix sum và in.',
    algorithmAnalysis: 'O(n + q).',
    timeComplexity: 'O(n + q)',
    memoryComplexity: 'O(n)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, q; cin >> n >> q;
    vector<long long> diff(n + 2, 0);
    while (q--) {
        int L, R; long long V; cin >> L >> R >> V;
        diff[L] += V;
        diff[R + 1] -= V;
    }
    long long cur = 0;
    for (int i = 1; i <= n; ++i) {
        cur += diff[i];
        cout << cur;
        cout << (i == n ? '\\n' : ' ');
    }
}
`,
    codeExplanation: 'Cập nhật diff theo công thức, sau đó prefix sum cho mảng cuối.',
    commonMistakes: '- Tràn int khi V*q lớn → dùng long long.\n- Sai biên diff[R+1] khi R = n.'
  }
};
