import { ProblemDef, TestSpec } from '../types';
import { makeRng, randInt, arr } from '../helpers';

function ts(samples: string[], small: ((r: () => number) => string)[], medium: ((r: () => number) => string)[], large: ((r: () => number) => string)[]): TestSpec[] {
  const out: TestSpec[] = [];
  let idx = 1;
  samples.forEach((s) => out.push({ order: idx++, subtaskOrder: 1, isSample: true, input: s }));
  const r1 = makeRng(611); for (const g of small) out.push({ order: idx++, subtaskOrder: 1, isSample: false, input: g(r1) });
  const r2 = makeRng(622); for (const g of medium) out.push({ order: idx++, subtaskOrder: 2, isSample: false, input: g(r2) });
  const r3 = makeRng(633); for (const g of large) out.push({ order: idx++, subtaskOrder: 3, isSample: false, input: g(r3) });
  return out;
}

// 1. TP-SUMK — Số cặp có tổng = K (mảng tăng)
export const TP_SUMK: ProblemDef = {
  code: 'TP-SUMK',
  title: 'Cặp số có tổng bằng K',
  statement: `Cho mảng a[1..n] đã sắp xếp tăng dần và số nguyên K. Đếm số cặp (i, j) với i < j sao cho a[i] + a[j] = K.`,
  inputFormat: 'Dòng 1: n và K.\nDòng 2: n số nguyên (đã sắp tăng).',
  outputFormat: 'In ra số cặp.',
  constraints: '1 ≤ n ≤ 2*10^5, |a[i]|, |K| ≤ 10^9.',
  difficulty: 'MEDIUM',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'quang-ngai', examYear: 2023, source: 'Tự biên soạn theo phong cách đề Quảng Ngãi.',
  tagSlugs: ['hai-con-tro'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n ≤ 1000.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n ≤ 5*10^4.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n ≤ 2*10^5.' }
  ],
  generateTests: () => {
    function gen(r: () => number, n: number, vlim: number) {
      const a = arr(n, () => randInt(r, -vlim, vlim)).sort((x, y) => x - y);
      const K = a[Math.floor(r() * n)] + a[Math.floor(r() * n)];
      return `${n} ${K}\n${a.join(' ')}\n`;
    }
    return ts(
      ['4 5\n1 2 3 4\n', '5 0\n-2 -1 0 1 2\n', '1 10\n5\n'],
      arr(7, () => (r) => gen(r, randInt(r, 5, 1000), 1000)),
      arr(10, () => (r) => gen(r, randInt(r, 30000, 50000), 1_000_000)),
      arr(10, () => (r) => gen(r, randInt(r, 150000, 200000), 1_000_000_000))
    );
  },
  editorial: {
    idea: 'Dùng hai con trỏ i ở đầu, j ở cuối. So sánh tổng a[i] + a[j] với K.',
    observations: 'Cần xử lý phần tử lặp: khi a[i] = a[j] (tức cụm cùng giá trị), số cặp là C(c,2).',
    approach: 'Vòng while i < j: nếu sum < K thì ++i; nếu sum > K thì --j; bằng K thì đếm nhóm trùng giá trị ở cả hai đầu rồi cộng đúng số cặp.',
    algorithmAnalysis: 'O(n).',
    timeComplexity: 'O(n)',
    memoryComplexity: 'O(n)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; long long K; cin >> n >> K;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    int i = 0, j = n - 1;
    long long ans = 0;
    while (i < j) {
        long long s = a[i] + a[j];
        if (s < K) ++i;
        else if (s > K) --j;
        else {
            if (a[i] == a[j]) {
                long long c = j - i + 1; ans += c * (c - 1) / 2; break;
            }
            long long li = 0, lj = 0;
            long long va = a[i], vb = a[j];
            while (i <= j && a[i] == va) { ++i; ++li; }
            while (i <= j && a[j] == vb) { --j; ++lj; }
            ans += li * lj;
        }
    }
    cout << ans << '\\n';
}
`,
    codeExplanation: 'Hai con trỏ. Khi tổng bằng K và hai giá trị khác nhau, đếm số phần tử bằng a[i] và a[j], cộng tích vào.',
    commonMistakes: '- Quên xử lý trùng khi a[i] = a[j].\n- Sai dùng int cho ans.'
  }
};

// 2. TP-LONGEST — Đoạn dài nhất có tổng ≤ S
export const TP_LONGEST: ProblemDef = {
  code: 'TP-LONGEST',
  title: 'Đoạn dài nhất tổng không vượt S',
  statement: `Cho mảng a[1..n] gồm số nguyên không âm và số S. Tìm độ dài lớn nhất của đoạn liên tiếp có tổng ≤ S.`,
  inputFormat: 'Dòng 1: n và S.\nDòng 2: n số nguyên không âm.',
  outputFormat: 'Một số nguyên là độ dài đoạn dài nhất.',
  constraints: '1 ≤ n ≤ 2*10^5, 0 ≤ a[i] ≤ 10^9, 0 ≤ S ≤ 10^18.',
  difficulty: 'MEDIUM',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'binh-dinh', examYear: 2023, source: 'Tự biên soạn theo phong cách đề Bình Định.',
  tagSlugs: ['hai-con-tro'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n ≤ 1000, brute force.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n ≤ 5*10^4.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n ≤ 2*10^5.' }
  ],
  generateTests: () => ts(
    ['5 6\n1 2 3 4 5\n', '3 0\n0 0 0\n', '1 5\n10\n'],
    arr(7, () => (r) => { const n = randInt(r, 5, 1000); return `${n} ${randInt(r, 0, 100000)}\n${arr(n, () => randInt(r, 0, 100)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 30000, 50000); return `${n} ${randInt(r, 0, 1_000_000_000)}\n${arr(n, () => randInt(r, 0, 1_000_000)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 150000, 200000); return `${n} ${randInt(r, 0, 1_000_000_000_000)}\n${arr(n, () => randInt(r, 0, 1_000_000_000)).join(' ')}\n`; })
  ),
  editorial: {
    idea: 'Sliding window: r mở rộng, l co lại khi tổng > S.',
    observations: 'Vì a[i] không âm, tổng cửa sổ tăng đơn điệu khi mở rộng r → áp dụng hai con trỏ.',
    approach: 'Khởi tạo l = 0, sum = 0, ans = 0. Lặp r = 0..n-1: sum += a[r]; while sum > S thì sum -= a[l++]; ans = max(ans, r - l + 1).',
    algorithmAnalysis: 'O(n).',
    timeComplexity: 'O(n)',
    memoryComplexity: 'O(n)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long n, S; cin >> n >> S;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    long long sum = 0, ans = 0;
    int l = 0;
    for (int r = 0; r < n; ++r) {
        sum += a[r];
        while (sum > S) sum -= a[l++];
        ans = max(ans, (long long)(r - l + 1));
    }
    cout << ans << '\\n';
}
`,
    codeExplanation: 'Sliding window: r tăng dần; khi tổng vượt S, đẩy l lên cho tới khi tổng ≤ S.',
    commonMistakes: '- Khi a[r] > S, cần để l > r, code vẫn đúng vì cuối cùng l = r+1 và độ dài 0.\n- Quên dùng long long cho S và sum.'
  }
};

// 3. TP-DISTINCT — Đoạn dài nhất có ít nhất K giá trị phân biệt
export const TP_DISTINCT: ProblemDef = {
  code: 'TP-DISTINCT',
  title: 'Đoạn ít nhất K giá trị phân biệt',
  statement: `Cho mảng a[1..n] và số K. Tìm độ dài LỚN NHẤT của đoạn con liên tiếp có nhiều nhất K giá trị phân biệt.`,
  inputFormat: 'Dòng 1: n và K.\nDòng 2: n số nguyên dương a[1..n].',
  outputFormat: 'Một số nguyên là độ dài lớn nhất.',
  constraints: '1 ≤ n ≤ 2*10^5, 1 ≤ K ≤ n, 1 ≤ a[i] ≤ 10^9.',
  difficulty: 'HARD',
  timeLimitMs: 2000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'khanh-hoa', examYear: 2023, source: 'Tự biên soạn theo phong cách đề Khánh Hòa.',
  tagSlugs: ['hai-con-tro', 'stack-queue'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n ≤ 1000.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n ≤ 3*10^4.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n ≤ 2*10^5.' }
  ],
  generateTests: () => ts(
    ['5 2\n1 2 1 3 4\n', '5 1\n1 1 1 1 1\n', '6 3\n1 2 3 1 2 4\n'],
    arr(7, () => (r) => { const n = randInt(r, 5, 1000); return `${n} ${randInt(r, 1, n)}\n${arr(n, () => randInt(r, 1, 10)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 20000, 30000); return `${n} ${randInt(r, 1, n)}\n${arr(n, () => randInt(r, 1, 1000)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 150000, 200000); return `${n} ${randInt(r, 1, n)}\n${arr(n, () => randInt(r, 1, 1_000_000_000)).join(' ')}\n`; })
  ),
  editorial: {
    idea: 'Sliding window dùng unordered_map<int,int> đếm tần suất; tăng r, khi số khóa > K thì co l.',
    observations: 'Số phần tử phân biệt = số khóa hiện có trong map.',
    approach: 'Duy trì map cnt. r tăng dần, ++cnt[a[r]]. Khi (int)cnt.size() > K thì --cnt[a[l]]; nếu cnt[a[l]] = 0 thì erase; l++. Sau khi điều chỉnh, ans = max(ans, r-l+1).',
    algorithmAnalysis: 'O(n) trung bình với unordered_map.',
    timeComplexity: 'O(n)',
    memoryComplexity: 'O(n)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, K; cin >> n >> K;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    unordered_map<long long,int> cnt;
    int l = 0, ans = 0;
    for (int r = 0; r < n; ++r) {
        ++cnt[a[r]];
        while ((int)cnt.size() > K) {
            if (--cnt[a[l]] == 0) cnt.erase(a[l]);
            ++l;
        }
        ans = max(ans, r - l + 1);
    }
    cout << ans << '\\n';
}
`,
    codeExplanation: 'Sliding window với map đếm tần suất, co cửa sổ khi số khóa > K.',
    commonMistakes: '- Quên erase khi tần suất về 0 → map.size() tính sai.\n- Dùng map<int,int> thay vì unordered_map có thể chậm trong subtask lớn nhưng vẫn pass.'
  }
};
