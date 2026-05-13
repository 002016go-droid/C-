import { ProblemDef, TestSpec } from '../types';
import { makeRng, randInt, arr } from '../helpers';

function ts(samples: string[], small: ((r: () => number) => string)[], medium: ((r: () => number) => string)[], large: ((r: () => number) => string)[]): TestSpec[] {
  const out: TestSpec[] = [];
  let idx = 1;
  samples.forEach((s) => out.push({ order: idx++, subtaskOrder: 1, isSample: true, input: s }));
  const r1 = makeRng(711); for (const g of small) out.push({ order: idx++, subtaskOrder: 1, isSample: false, input: g(r1) });
  const r2 = makeRng(722); for (const g of medium) out.push({ order: idx++, subtaskOrder: 2, isSample: false, input: g(r2) });
  const r3 = makeRng(733); for (const g of large) out.push({ order: idx++, subtaskOrder: 3, isSample: false, input: g(r3) });
  return out;
}

// 1. GR-ACTIVITY — Activity selection
export const GR_ACTIVITY: ProblemDef = {
  code: 'GR-ACTIVITY',
  title: 'Lịch hoạt động',
  statement: `Có n hoạt động, hoạt động i bắt đầu tại s[i] và kết thúc tại f[i]. Hai hoạt động được coi là không trùng nếu hoạt động này kết thúc tại thời điểm ≤ thời điểm bắt đầu hoạt động kia. Hãy chọn nhiều hoạt động không trùng nhất.`,
  inputFormat: 'Dòng 1: n.\nn dòng tiếp theo, mỗi dòng hai số s[i] và f[i] (s[i] < f[i]).',
  outputFormat: 'In ra số hoạt động nhiều nhất có thể chọn.',
  constraints: '1 ≤ n ≤ 10^5, 0 ≤ s[i] < f[i] ≤ 10^9.',
  difficulty: 'MEDIUM',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'quang-nam', examYear: 2021, source: 'Tự biên soạn theo phong cách đề Quảng Nam.',
  tagSlugs: ['tham-lam', 'sap-xep'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n ≤ 1000.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n ≤ 10^4.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n ≤ 10^5.' }
  ],
  generateTests: () => ts(
    ['3\n1 3\n2 5\n4 6\n', '4\n0 1\n1 2\n2 3\n3 4\n', '1\n0 100\n'],
    arr(7, () => (r) => { const n = randInt(r, 5, 1000); return `${n}\n${arr(n, () => { const s = randInt(r, 0, 100); const f = s + randInt(r, 1, 50); return `${s} ${f}`; }).join('\n')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 5000, 10000); return `${n}\n${arr(n, () => { const s = randInt(r, 0, 1_000_000); const f = s + randInt(r, 1, 1000); return `${s} ${f}`; }).join('\n')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 80000, 100000); return `${n}\n${arr(n, () => { const s = randInt(r, 0, 1_000_000_000 - 1000); const f = s + randInt(r, 1, 1000); return `${s} ${f}`; }).join('\n')}\n`; })
  ),
  editorial: {
    idea: 'Sắp xếp theo f tăng dần, duyệt chọn mỗi hoạt động nếu s[i] ≥ kết thúc gần nhất.',
    observations: 'Đây là bài toán activity selection cổ điển.',
    approach: 'Sort theo f; biến last_end = -1; với mỗi (s, f) nếu s ≥ last_end, chọn và cập nhật last_end = f.',
    algorithmAnalysis: 'O(n log n) do sort.',
    timeComplexity: 'O(n log n)',
    memoryComplexity: 'O(n)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin >> n;
    vector<pair<long long,long long>> v(n);
    for (auto& [s, f] : v) cin >> s >> f;
    sort(v.begin(), v.end(), [](auto& a, auto& b) { return a.second < b.second; });
    long long last = LLONG_MIN;
    int cnt = 0;
    for (auto& [s, f] : v) if (s >= last) { ++cnt; last = f; }
    cout << cnt << '\\n';
}
`,
    codeExplanation: 'Sort theo f. Duyệt chọn nếu s ≥ kết thúc gần nhất.',
    commonMistakes: '- Sort theo s không cho kết quả tối ưu.\n- Quên trường hợp s = f (tham khảo định nghĩa: yêu cầu s ≥ kết thúc trước).'
  }
};

// 2. GR-COIN — Đổi tiền (mệnh giá vô số đồng)
export const GR_COIN: ProblemDef = {
  code: 'GR-COIN',
  title: 'Đổi tiền mệnh giá lớn',
  statement: `Cho n mệnh giá tiền a[1..n] và số tiền cần đổi S. Mỗi mệnh giá có vô số đồng. Hệ thống mệnh giá "đẹp" có tính chất mệnh giá lớn luôn là bội của mệnh giá nhỏ hơn nó (đề bảo đảm). Hãy tìm số đồng ít nhất để đổi đủ S đồng. Đề luôn có lời giải.`,
  inputFormat: 'Dòng 1: n và S.\nDòng 2: n số nguyên dương a[1..n], được sắp xếp tăng dần; a[1] = 1.',
  outputFormat: 'In ra số đồng ít nhất.',
  constraints: '1 ≤ n ≤ 20, 1 ≤ a[i] ≤ 10^9, 1 ≤ S ≤ 10^15.',
  difficulty: 'EASY',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'da-nang', examYear: 2019, source: 'Tự biên soạn theo phong cách đề Đà Nẵng.',
  tagSlugs: ['tham-lam'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'S ≤ 100.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'S ≤ 10^6.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'S ≤ 10^15.' }
  ],
  generateTests: () => {
    function chain(r: () => number, maxStep: number) {
      const xs: number[] = [1];
      let last = 1;
      const len = randInt(r, 2, Math.min(20, 8));
      for (let i = 1; i < len; i++) { last *= randInt(r, 2, maxStep); if (last > 1_000_000_000) break; xs.push(last); }
      return xs;
    }
    function gen(r: () => number, slim: number) {
      const xs = chain(r, 5);
      return `${xs.length} ${randInt(r, 1, slim)}\n${xs.join(' ')}\n`;
    }
    return ts(
      ['4 13\n1 2 5 10\n', '3 7\n1 5 25\n', '1 1\n1\n'],
      arr(7, () => (r) => gen(r, 100)),
      arr(10, () => (r) => gen(r, 1_000_000)),
      arr(10, () => (r) => gen(r, 1_000_000_000_000))
    );
  },
  editorial: {
    idea: 'Tham lam: chọn mệnh giá lớn nhất ≤ S, lấy floor(S/a[i]) đồng, rồi S = S mod a[i].',
    observations: 'Vì mệnh giá lớn là bội của mệnh giá nhỏ, tham lam luôn tối ưu.',
    approach: 'Duyệt từ mệnh giá lớn nhất xuống, cộng S/a[i] vào đếm và đặt S = S % a[i].',
    algorithmAnalysis: 'O(n).',
    timeComplexity: 'O(n)',
    memoryComplexity: 'O(n)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; long long S; cin >> n >> S;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    long long ans = 0;
    for (int i = n - 1; i >= 0; --i) {
        if (S >= a[i]) { ans += S / a[i]; S %= a[i]; }
    }
    cout << ans << '\\n';
}
`,
    codeExplanation: 'Duyệt mệnh giá từ lớn xuống, lấy số đồng tối đa rồi cập nhật phần còn lại.',
    commonMistakes: '- Dùng int cho ans dễ tràn khi S = 10^15.\n- Quên a[1] = 1 đảm bảo có nghiệm.'
  }
};

// 3. GR-MEETING — Nhỏ nhất phòng họp
export const GR_MEETING: ProblemDef = {
  code: 'GR-MEETING',
  title: 'Số phòng họp tối thiểu',
  statement: `Có n cuộc họp, cuộc họp i diễn ra trong khoảng thời gian [s[i], f[i]] (mở-đóng). Hai cuộc họp có thể dùng chung một phòng nếu cuộc trước kết thúc trước khi cuộc sau bắt đầu (tức f của cuộc trước ≤ s của cuộc sau). Hãy tính số phòng tối thiểu cần dùng.`,
  inputFormat: 'Dòng 1: n.\nn dòng sau, mỗi dòng s[i] và f[i].',
  outputFormat: 'Số phòng tối thiểu.',
  constraints: '1 ≤ n ≤ 2*10^5, 0 ≤ s[i] < f[i] ≤ 10^9.',
  difficulty: 'HARD',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'phu-yen', examYear: 2023, source: 'Tự biên soạn theo phong cách đề Phú Yên.',
  tagSlugs: ['tham-lam', 'sap-xep'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n ≤ 1000.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n ≤ 5*10^4.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n ≤ 2*10^5.' }
  ],
  generateTests: () => {
    function gen(r: () => number, n: number, tmax: number) {
      const out: string[] = [];
      for (let i = 0; i < n; i++) { const s = randInt(r, 0, tmax); const f = s + randInt(r, 1, Math.max(2, tmax / 10)); out.push(`${s} ${f}`); }
      return `${n}\n${out.join('\n')}\n`;
    }
    return ts(
      ['3\n0 10\n5 15\n10 20\n', '4\n0 1\n1 2\n2 3\n3 4\n', '1\n0 100\n'],
      arr(7, () => (r) => gen(r, randInt(r, 5, 1000), 100)),
      arr(10, () => (r) => gen(r, randInt(r, 30000, 50000), 1_000_000)),
      arr(10, () => (r) => gen(r, randInt(r, 150000, 200000), 1_000_000_000))
    );
  },
  editorial: {
    idea: 'Tách các sự kiện start (+1) và end (-1) rồi sweep, max(prefix) là kết quả.',
    observations: 'Khi cùng thời điểm, xử lý end trước start để tránh đếm dư.',
    approach: 'Tạo mảng sự kiện (time, +1/-1). Sort theo (time, type với end < start). Duyệt cộng dồn và lấy max.',
    algorithmAnalysis: 'O(n log n).',
    timeComplexity: 'O(n log n)',
    memoryComplexity: 'O(n)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin >> n;
    vector<pair<long long,int>> ev;
    ev.reserve(2 * n);
    for (int i = 0; i < n; ++i) {
        long long s, f; cin >> s >> f;
        ev.push_back({s, +1});
        ev.push_back({f, -1});
    }
    sort(ev.begin(), ev.end(), [](auto& a, auto& b) {
        if (a.first != b.first) return a.first < b.first;
        return a.second < b.second; // -1 trước +1
    });
    int cur = 0, ans = 0;
    for (auto& [t, d] : ev) { cur += d; ans = max(ans, cur); }
    cout << ans << '\\n';
}
`,
    codeExplanation: 'Sweep line trên các sự kiện start/end. Khi cùng thời điểm xử lý end trước để hợp lệ.',
    commonMistakes: '- Sort sai → tính dư phòng khi nhiều cuộc cùng kết thúc và bắt đầu cùng lúc.\n- Quên dùng long long cho thời điểm.'
  }
};
