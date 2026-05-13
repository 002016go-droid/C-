import { ProblemDef, TestSpec } from '../types';
import { makeRng, randInt, arr } from '../helpers';

function ts(samples: string[], small: ((r: () => number) => string)[], medium: ((r: () => number) => string)[], large: ((r: () => number) => string)[]): TestSpec[] {
  const out: TestSpec[] = [];
  let idx = 1;
  samples.forEach((s) => out.push({ order: idx++, subtaskOrder: 1, isSample: true, input: s }));
  const r1 = makeRng(11); for (const g of small) out.push({ order: idx++, subtaskOrder: 1, isSample: false, input: g(r1) });
  const r2 = makeRng(22); for (const g of medium) out.push({ order: idx++, subtaskOrder: 2, isSample: false, input: g(r2) });
  const r3 = makeRng(33); for (const g of large) out.push({ order: idx++, subtaskOrder: 3, isSample: false, input: g(r3) });
  return out;
}

// 1. AR-MAX2 — Tổng lớn nhất 2 phần tử khác chỉ số
export const AR_MAX2: ProblemDef = {
  code: 'AR-MAX2',
  title: 'Tổng lớn nhất hai phần tử',
  statement: `Cho mảng a[1..n] gồm n số nguyên. Hãy tìm giá trị lớn nhất của a[i] + a[j] với i ≠ j.`,
  inputFormat: 'Dòng 1: n.\nDòng 2: n số nguyên.',
  outputFormat: 'In ra giá trị lớn nhất tìm được.',
  constraints: '2 ≤ n ≤ 10^5, |a[i]| ≤ 10^9.',
  difficulty: 'EASY',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'quang-nam', examYear: 2022, source: 'Tự biên soạn theo phong cách đề Quảng Nam.',
  tagSlugs: ['mang'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n ≤ 200, brute force O(n^2).' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n ≤ 10^4.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n ≤ 10^5.' }
  ],
  generateTests: () => ts(
    ['3\n1 2 3\n', '4\n-1 -5 -3 -2\n', '2\n10 -10\n'],
    arr(7, () => (r) => { const n = randInt(r, 5, 200); return `${n}\n${arr(n, () => randInt(r, -1000, 1000)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 1000, 10000); return `${n}\n${arr(n, () => randInt(r, -1_000_000_000, 1_000_000_000)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 90000, 100000); return `${n}\n${arr(n, () => randInt(r, -1_000_000_000, 1_000_000_000)).join(' ')}\n`; })
  ),
  editorial: {
    idea: 'Hai phần tử lớn nhất tổng lại sẽ cho kết quả. Duyệt một lần tìm max1 và max2.',
    observations: 'Không nhất thiết phải sắp xếp — chỉ cần một lượt duyệt với hai biến.',
    approach: 'Khởi tạo max1, max2 = -INF. Với mỗi a[i]: nếu a[i] > max1 thì max2 = max1, max1 = a[i]; ngược lại nếu a[i] > max2 thì max2 = a[i].',
    algorithmAnalysis: 'Một lượt duyệt mảng O(n), không cần sắp xếp.',
    timeComplexity: 'O(n)',
    memoryComplexity: 'O(1)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    long long m1 = LLONG_MIN, m2 = LLONG_MIN;
    for (int i = 0; i < n; ++i) {
        long long x; cin >> x;
        if (x >= m1) { m2 = m1; m1 = x; }
        else if (x > m2) m2 = x;
    }
    cout << m1 + m2 << '\\n';
}
`,
    codeExplanation: 'Duyệt mảng, duy trì giá trị lớn nhất m1 và giá trị lớn thứ hai m2. In tổng.',
    commonMistakes: '- Tổng hai số có thể tới 2*10^9, phải dùng long long.\n- Khởi tạo m1, m2 = 0 sẽ sai khi mảng toàn số âm.'
  }
};

// 2. AR-FREQ — Tần suất xuất hiện
export const AR_FREQ: ProblemDef = {
  code: 'AR-FREQ',
  title: 'Phần tử xuất hiện nhiều nhất',
  statement: `Cho mảng a[1..n]. Tìm phần tử xuất hiện nhiều nhất; nếu có nhiều phần tử cùng tần suất, in ra phần tử có giá trị nhỏ nhất.`,
  inputFormat: 'Dòng 1: n.\nDòng 2: n số nguyên không âm.',
  outputFormat: 'In ra giá trị xuất hiện nhiều nhất (nhỏ nhất nếu nhiều phần tử cùng tần suất) và số lần xuất hiện, cách nhau bởi dấu cách.',
  constraints: '1 ≤ n ≤ 2*10^5, 0 ≤ a[i] ≤ 10^9.',
  difficulty: 'EASY',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'da-nang', examYear: 2021, source: 'Tự biên soạn theo phong cách đề Đà Nẵng.',
  tagSlugs: ['mang', 'stack-queue'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n ≤ 1000, a[i] ≤ 1000.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n ≤ 10^4.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n ≤ 2*10^5.' }
  ],
  generateTests: () => ts(
    ['5\n1 2 2 3 3\n', '6\n5 5 5 1 1 9\n', '1\n7\n'],
    arr(7, () => (r) => { const n = randInt(r, 5, 1000); return `${n}\n${arr(n, () => randInt(r, 0, 100)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 5000, 10000); return `${n}\n${arr(n, () => randInt(r, 0, 1_000_000_000)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 150000, 200000); return `${n}\n${arr(n, () => randInt(r, 0, 1_000_000_000)).join(' ')}\n`; })
  ),
  editorial: {
    idea: 'Dùng std::map<int,int> hoặc std::unordered_map đếm tần suất, sau đó duyệt tìm phần tử tốt nhất.',
    observations: 'Với a[i] tới 10^9 không thể dùng mảng đếm cố định. Cần map.',
    approach: 'Đếm tần suất bằng map. Duyệt map: nếu tần suất lớn hơn best, hoặc bằng best nhưng giá trị nhỏ hơn thì cập nhật.',
    algorithmAnalysis: 'O(n log n) với map; có thể giảm còn O(n) với unordered_map.',
    timeComplexity: 'O(n log n)',
    memoryComplexity: 'O(n)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    map<long long,int> cnt;
    for (int i = 0; i < n; ++i) { long long x; cin >> x; ++cnt[x]; }
    long long bestVal = 0;
    int bestCnt = -1;
    for (auto& kv : cnt) {
        if (kv.second > bestCnt) { bestCnt = kv.second; bestVal = kv.first; }
    }
    cout << bestVal << ' ' << bestCnt << '\\n';
}
`,
    codeExplanation: 'Đếm bằng map (sắp theo giá trị tăng dần). Duyệt từ giá trị nhỏ tới lớn, chỉ cập nhật khi tần suất CAO HƠN. Giá trị nhỏ nhất với cùng tần suất được giữ lại nhờ thứ tự duyệt.',
    commonMistakes: '- Cập nhật khi tần suất ≥ → chọn giá trị lớn hơn, sai đề.\n- Dùng mảng cnt[10^9 + 1] sẽ MLE.'
  }
};

// 3. AR-SHIFT — Dịch vòng trái k vị trí
export const AR_SHIFT: ProblemDef = {
  code: 'AR-SHIFT',
  title: 'Dịch vòng mảng',
  statement: `Cho mảng a[1..n] và số k. Hãy in ra mảng sau khi dịch vòng sang trái k vị trí.\n\nDịch vòng sang trái nghĩa là phần tử đầu sẽ chuyển xuống cuối, lặp lại k lần.`,
  inputFormat: 'Dòng 1: n và k.\nDòng 2: n số nguyên a[1..n].',
  outputFormat: 'In ra n số nguyên là mảng sau khi dịch.',
  constraints: '1 ≤ n ≤ 2*10^5, 0 ≤ k ≤ 10^9, |a[i]| ≤ 10^9.',
  difficulty: 'EASY',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'quang-ngai', examYear: 2020, source: 'Tự biên soạn theo phong cách đề Quảng Ngãi.',
  tagSlugs: ['mang'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n, k ≤ 1000.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n ≤ 10^4, k ≤ 10^4.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n ≤ 2*10^5, k ≤ 10^9 (cần lấy k mod n).' }
  ],
  generateTests: () => ts(
    ['5 2\n1 2 3 4 5\n', '4 0\n1 2 3 4\n', '6 1000000000\n1 2 3 4 5 6\n'],
    arr(7, () => (r) => { const n = randInt(r, 5, 1000); const k = randInt(r, 0, 1000); return `${n} ${k}\n${arr(n, () => randInt(r, -1000, 1000)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 5000, 10000); const k = randInt(r, 0, 10000); return `${n} ${k}\n${arr(n, () => randInt(r, -1_000_000_000, 1_000_000_000)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 150000, 200000); const k = randInt(r, 0, 1_000_000_000); return `${n} ${k}\n${arr(n, () => randInt(r, -1_000_000_000, 1_000_000_000)).join(' ')}\n`; })
  ),
  editorial: {
    idea: 'Dịch n vị trí trùng với không dịch. Vì vậy k thực sự = k mod n. Sau đó in a[k..n-1] rồi a[0..k-1].',
    observations: 'Đừng quay trực tiếp k lần vì k có thể đến 10^9.',
    approach: 'k %= n; in vòng từ chỉ số k đến n-1 rồi từ 0 đến k-1.',
    algorithmAnalysis: 'O(n) duyệt một lần.',
    timeComplexity: 'O(n)',
    memoryComplexity: 'O(n)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long n, k; cin >> n >> k;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    k %= n;
    for (long long i = 0; i < n; ++i) {
        cout << a[(i + k) % n];
        cout << (i + 1 == n ? '\\n' : ' ');
    }
}
`,
    codeExplanation: 'Đọc mảng. Quy đổi k modulo n rồi in mảng đã dịch.',
    commonMistakes: '- Quay k lần với k = 10^9: TLE.\n- Quên xử lý n = 1 khi k = 0.'
  }
};

// 4. AR-INVERSE — Đếm cặp nghịch thế (giới hạn nhỏ, brute force)
export const AR_INVERSE: ProblemDef = {
  code: 'AR-INVERSE',
  title: 'Cặp nghịch thế',
  statement: `Cho mảng a[1..n]. Một cặp (i, j) được gọi là nghịch thế nếu i < j và a[i] > a[j]. Hãy đếm số cặp nghịch thế.`,
  inputFormat: 'Dòng 1: n.\nDòng 2: n số nguyên a[1..n].',
  outputFormat: 'In ra số cặp nghịch thế.',
  constraints: '1 ≤ n ≤ 5000, |a[i]| ≤ 10^9.',
  difficulty: 'MEDIUM',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'phu-yen', examYear: 2024, source: 'Tự biên soạn theo phong cách đề Phú Yên.',
  tagSlugs: ['mang'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n ≤ 100.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n ≤ 1000.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n ≤ 5000.' }
  ],
  generateTests: () => ts(
    ['3\n3 2 1\n', '4\n1 2 3 4\n', '1\n42\n'],
    arr(7, () => (r) => { const n = randInt(r, 5, 100); return `${n}\n${arr(n, () => randInt(r, -100, 100)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 200, 1000); return `${n}\n${arr(n, () => randInt(r, -1000, 1000)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 4500, 5000); return `${n}\n${arr(n, () => randInt(r, -1_000_000_000, 1_000_000_000)).join(' ')}\n`; })
  ),
  editorial: {
    idea: 'Với n ≤ 5000, ta có thể duyệt tất cả O(n^2) cặp.',
    observations: 'Số cặp nghịch thế có thể lớn (đến n*(n-1)/2 ≈ 1.25*10^7), nhưng vẫn vừa long long.',
    approach: 'Hai vòng for lồng nhau đếm cặp i < j có a[i] > a[j].',
    algorithmAnalysis: 'O(n^2) ≈ 2.5*10^7, đủ nhanh.',
    timeComplexity: 'O(n^2)',
    memoryComplexity: 'O(n)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    long long cnt = 0;
    for (int i = 0; i < n; ++i)
        for (int j = i + 1; j < n; ++j)
            if (a[i] > a[j]) ++cnt;
    cout << cnt << '\\n';
}
`,
    codeExplanation: 'Hai vòng for đếm số cặp i < j thỏa a[i] > a[j].',
    commonMistakes: '- Dùng int cho biến đếm có thể vẫn fit nhưng nên dùng long long để an toàn.\n- Quên dùng I/O nhanh với n lớn.'
  }
};

// 5. AR-SECOND-MIN — Phần tử nhỏ nhì
export const AR_SECOND_MIN: ProblemDef = {
  code: 'AR-SECOND-MIN',
  title: 'Phần tử nhỏ thứ hai',
  statement: `Cho mảng a[1..n] chứa các số nguyên (có thể trùng). Tìm phần tử nhỏ thứ hai theo giá trị, tức giá trị nhỏ thứ hai khi loại bỏ trùng. Nếu mảng không có hai giá trị phân biệt, in -1.`,
  inputFormat: 'Dòng 1: n.\nDòng 2: n số nguyên.',
  outputFormat: 'In ra giá trị nhỏ thứ hai phân biệt, hoặc -1 nếu không tồn tại.',
  constraints: '1 ≤ n ≤ 10^5, |a[i]| ≤ 10^9.',
  difficulty: 'EASY',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'khanh-hoa', examYear: 2022, source: 'Tự biên soạn theo phong cách đề Khánh Hòa.',
  tagSlugs: ['mang'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n ≤ 100.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n ≤ 10^4.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n ≤ 10^5.' }
  ],
  generateTests: () => ts(
    ['5\n4 1 1 2 4\n', '3\n7 7 7\n', '1\n10\n'],
    arr(7, () => (r) => { const n = randInt(r, 5, 100); return `${n}\n${arr(n, () => randInt(r, -100, 100)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 5000, 10000); return `${n}\n${arr(n, () => randInt(r, -100, 100)).join(' ')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 80000, 100000); return `${n}\n${arr(n, () => randInt(r, -1_000_000_000, 1_000_000_000)).join(' ')}\n`; })
  ),
  editorial: {
    idea: 'Duy trì hai biến min1 < min2, duyệt mảng một lần và cập nhật theo điều kiện a[i] khác min1, min2.',
    observations: 'Không cần sắp xếp toàn bộ, chỉ cần một lượt duyệt.',
    approach: 'Khởi tạo min1, min2 = LLONG_MAX. Với mỗi x: nếu x < min1, đẩy min1 sang min2 và cập nhật min1 = x; nếu min1 < x < min2 thì min2 = x.',
    algorithmAnalysis: 'O(n).',
    timeComplexity: 'O(n)',
    memoryComplexity: 'O(1)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    long long m1 = LLONG_MAX, m2 = LLONG_MAX;
    for (int i = 0; i < n; ++i) {
        long long x; cin >> x;
        if (x < m1) { m2 = m1; m1 = x; }
        else if (x > m1 && x < m2) m2 = x;
    }
    if (m2 == LLONG_MAX) cout << -1 << '\\n';
    else cout << m2 << '\\n';
}
`,
    codeExplanation: 'Duyệt mảng, cập nhật m1, m2 đảm bảo m1 < m2 và phân biệt. Cuối cùng kiểm tra m2 đã được gán hay chưa.',
    commonMistakes: '- Cho phép x = m1 cập nhật m2 → trả về giá trị trùng.\n- Khởi tạo m1 = 0.'
  }
};
