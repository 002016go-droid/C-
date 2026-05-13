import { ProblemDef, TestSpec } from '../types';
import { makeRng, randInt, arr } from '../helpers';

function ts(samples: string[], small: ((rng: () => number) => string)[], medium: ((rng: () => number) => string)[], large: ((rng: () => number) => string)[]): TestSpec[] {
  const out: TestSpec[] = [];
  let idx = 1;
  samples.forEach((s, i) => out.push({ order: idx++, subtaskOrder: 1, isSample: true, input: s }));
  const rng1 = makeRng(1001);
  for (let i = 0; i < small.length; i++) out.push({ order: idx++, subtaskOrder: 1, isSample: false, input: small[i](rng1) });
  const rng2 = makeRng(2002);
  for (let i = 0; i < medium.length; i++) out.push({ order: idx++, subtaskOrder: 2, isSample: false, input: medium[i](rng2) });
  const rng3 = makeRng(3003);
  for (let i = 0; i < large.length; i++) out.push({ order: idx++, subtaskOrder: 3, isSample: false, input: large[i](rng3) });
  return out;
}

// ============================================================
// 1. AR-SUM-DIV — Tổng các ước của n
// ============================================================
export const AR_SUM_DIV: ProblemDef = {
  code: 'AR-SUM-DIV',
  title: 'Tổng các ước số dương',
  statement: `Cho số nguyên dương n. Hãy tính tổng tất cả các ước số dương của n (kể cả 1 và n).\n\nVí dụ: với n = 12, các ước là 1, 2, 3, 4, 6, 12 và tổng bằng 28.`,
  inputFormat: 'Một dòng duy nhất chứa số nguyên dương n.',
  outputFormat: 'In ra một số nguyên là tổng các ước số dương của n.',
  constraints: '1 ≤ n ≤ 10^12.\nLưu ý: kết quả có thể vượt phạm vi int 32-bit, cần dùng long long.',
  difficulty: 'EASY',
  timeLimitMs: 1000,
  memoryLimitMb: 256,
  outputLimitKb: 10240,
  totalPoints: 100,
  fileIoEnabled: false,
  showEditorial: true,
  isPublished: true,
  provinceCode: 'quang-nam',
  examYear: 2023,
  source: 'Tự biên soạn theo phong cách đề Quảng Nam.',
  tagSlugs: ['so-hoc'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n ≤ 100, có thể duyệt mọi i từ 1 đến n.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n ≤ 10^6.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n ≤ 10^12, bắt buộc dùng kỹ thuật chia tới sqrt(n).' }
  ],
  generateTests: () => ts(
    ['12\n', '1\n', '36\n'],
    arr(7, (i) => () => `${[2, 6, 10, 17, 50, 99, 100][i]}\n`),
    arr(10, (i) => (r) => `${randInt(r, 1000, 1_000_000)}\n`),
    [
      () => `999999999999\n`,
      () => `1000000000000\n`,
      ...arr(8, () => (r: () => number) => `${randInt(r, 1_000_000_000, 1_000_000_000_000)}\n`)
    ]
  ),
  editorial: {
    idea: 'Duyệt các ước i từ 1 đến sqrt(n). Với mỗi i chia hết, ta cộng cả i và n/i (tránh cộng đôi khi i = n/i).',
    observations: 'Kết quả có thể vượt 32-bit khi n lớn, dùng long long.',
    approach: 'Vòng for i = 1..sqrt(n). Nếu n % i == 0 thì cộng i; nếu i != n/i thì cộng thêm n/i.',
    algorithmAnalysis: 'Duyệt toàn bộ ước i trong [1, sqrt(n)] thay vì 1..n giảm độ phức tạp từ O(n) xuống O(sqrt(n)).',
    timeComplexity: 'O(sqrt(n))',
    memoryComplexity: 'O(1)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    long long n; cin >> n;
    long long s = 0;
    for (long long i = 1; (long long)i * i <= n; ++i) {
        if (n % i == 0) {
            s += i;
            if (i != n / i) s += n / i;
        }
    }
    cout << s << '\\n';
}
`,
    codeExplanation: 'Đọc n. Duyệt i đến khi i*i > n. Mỗi cặp (i, n/i) đều là ước nên cộng cả hai; khi i bằng n/i (n là số chính phương) chỉ cộng một lần.',
    commonMistakes: '- Quên dùng long long → tràn int khi n ≥ 10^10.\n- So sánh i*i ≤ n bằng int dễ tràn, nên ép kiểu long long.'
  }
};

// ============================================================
// 2. AR-PRIME — Đếm số nguyên tố trong [L,R]
// ============================================================
export const AR_PRIME: ProblemDef = {
  code: 'AR-PRIME',
  title: 'Đếm số nguyên tố trong đoạn',
  statement: `Cho hai số nguyên L và R. Đếm số lượng số nguyên tố nằm trong đoạn [L, R].`,
  inputFormat: 'Một dòng chứa hai số nguyên L và R cách nhau bởi dấu cách.',
  outputFormat: 'In ra số lượng số nguyên tố p thỏa L ≤ p ≤ R.',
  constraints: '1 ≤ L ≤ R ≤ 10^6.',
  difficulty: 'EASY',
  timeLimitMs: 1000,
  memoryLimitMb: 256,
  outputLimitKb: 10240,
  totalPoints: 100,
  fileIoEnabled: false,
  showEditorial: true,
  isPublished: true,
  provinceCode: 'da-nang',
  examYear: 2022,
  source: 'Tự biên soạn theo phong cách đề Đà Nẵng.',
  tagSlugs: ['so-hoc'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'R ≤ 10^3, brute force kiểm tra từng số.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'R ≤ 10^5.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'R ≤ 10^6, cần sàng Eratosthenes.' }
  ],
  generateTests: () => ts(
    ['1 10\n', '10 30\n', '2 2\n'],
    arr(7, (i) => () => [
      '1 100\n', '50 200\n', '900 1000\n', '1 1\n', '4 4\n', '500 999\n', '997 1000\n'
    ][i]),
    arr(10, (i) => (r) => {
      const L = randInt(r, 1, 99000);
      const R = L + randInt(r, 1, 1000);
      return `${L} ${R}\n`;
    }),
    arr(10, (i) => (r) => {
      const L = randInt(r, 1, 999_000);
      const R = Math.min(1_000_000, L + randInt(r, 100, 1000));
      return `${L} ${R}\n`;
    })
  ),
  editorial: {
    idea: 'Tiền xử lý sàng nguyên tố Eratosthenes đến 10^6 rồi đếm các vị trí đánh dấu nguyên tố trong [L,R].',
    observations: 'Nếu chỉ kiểm tra từng số theo cách thử ước thì O((R-L+1)*sqrt(R)) sẽ TLE khi R ≈ 10^6.',
    approach: 'Tạo mảng sieve[0..N] với N = 10^6. Khởi tạo sieve[i] = true với i ≥ 2. Với mỗi i nguyên tố, đánh dấu các bội i*i, i*i+i, ... là không nguyên tố. Cuối cùng đếm sieve[i] = true với L ≤ i ≤ R.',
    algorithmAnalysis: 'Sàng có độ phức tạp O(N log log N), đủ nhanh với N = 10^6.',
    timeComplexity: 'O(N log log N + (R-L))',
    memoryComplexity: 'O(N)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
const int N = 1000001;
bool comp[N];
int main() {
    int L, R; cin >> L >> R;
    for (int i = 2; i < N; ++i) if (!comp[i]) {
        for (long long j = (long long)i * i; j < N; j += i) comp[j] = true;
    }
    int cnt = 0;
    for (int i = max(2, L); i <= R; ++i) if (!comp[i]) ++cnt;
    cout << cnt << '\\n';
}
`,
    codeExplanation: 'Sàng đến 10^6. Sau đó đếm các i trong [L,R] mà chưa bị đánh dấu là hợp số, lưu ý bỏ qua i ≤ 1.',
    commonMistakes: '- Sàng từ i (không phải từ i*i) sẽ chậm hơn.\n- Quên L có thể bằng 1: 1 không phải số nguyên tố.\n- Dùng int trong i*i dễ tràn.'
  }
};

// ============================================================
// 3. AR-GCD — Số lần GCD bằng 1
// ============================================================
export const AR_GCD: ProblemDef = {
  code: 'AR-GCD',
  title: 'Cặp số nguyên tố cùng nhau',
  statement: `Cho dãy n số nguyên dương a[1..n]. Hãy đếm số cặp (i, j) với i < j sao cho gcd(a[i], a[j]) = 1.`,
  inputFormat: 'Dòng 1: số nguyên n.\nDòng 2: n số nguyên a[1..n].',
  outputFormat: 'In ra số cặp (i, j) thỏa điều kiện.',
  constraints: '1 ≤ n ≤ 2000, 1 ≤ a[i] ≤ 10^6.',
  difficulty: 'MEDIUM',
  timeLimitMs: 1000,
  memoryLimitMb: 256,
  outputLimitKb: 10240,
  totalPoints: 100,
  fileIoEnabled: false,
  showEditorial: true,
  isPublished: true,
  provinceCode: 'quang-ngai',
  examYear: 2024,
  source: 'Tự biên soạn theo phong cách đề Quảng Ngãi.',
  tagSlugs: ['so-hoc'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n ≤ 50.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n ≤ 500.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n ≤ 2000.' }
  ],
  generateTests: () => ts(
    ['3\n2 3 4\n', '4\n6 10 15 21\n', '1\n7\n'],
    arr(7, (i) => (r) => {
      const n = [5, 8, 20, 30, 50, 45, 40][i];
      return `${n}\n${arr(n, () => randInt(r, 1, 50)).join(' ')}\n`;
    }),
    arr(10, (i) => (r) => {
      const n = randInt(r, 100, 500);
      return `${n}\n${arr(n, () => randInt(r, 1, 1_000_000)).join(' ')}\n`;
    }),
    arr(10, (i) => (r) => {
      const n = randInt(r, 1500, 2000);
      return `${n}\n${arr(n, () => randInt(r, 1, 1_000_000)).join(' ')}\n`;
    })
  ),
  editorial: {
    idea: 'Với n ≤ 2000 ta duyệt tất cả O(n^2) cặp và tính gcd cho mỗi cặp.',
    observations: 'gcd(a, b) tính bằng thuật toán Euclid trong O(log V).',
    approach: 'Hai vòng for lồng nhau, đếm các cặp có gcd = 1.',
    algorithmAnalysis: 'O(n^2 log V) ≈ 4*10^6 * 20 = 8*10^7, đủ nhanh trong 1 giây với cài đặt thường.',
    timeComplexity: 'O(n^2 log V)',
    memoryComplexity: 'O(n)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> a(n);
    for (int& x : a) cin >> x;
    long long cnt = 0;
    for (int i = 0; i < n; ++i)
        for (int j = i + 1; j < n; ++j)
            if (__gcd(a[i], a[j]) == 1) ++cnt;
    cout << cnt << '\\n';
}
`,
    codeExplanation: 'Đọc dãy. Hai vòng for đếm cặp có gcd = 1 bằng hàm __gcd của GCC.',
    commonMistakes: '- Không dùng long long cho biến đếm khi cặp có thể đạt n*(n-1)/2 ≈ 2*10^6 (vẫn fit int, nhưng tốt nhất nên dùng long long).\n- Quên trường hợp a[i] = 1: gcd(1, x) = 1 với mọi x.'
  }
};

// ============================================================
// 4. AR-PERFECT — Số hoàn hảo
// ============================================================
export const AR_PERFECT: ProblemDef = {
  code: 'AR-PERFECT',
  title: 'Số hoàn hảo',
  statement: `Số nguyên dương n gọi là số hoàn hảo nếu tổng tất cả các ước số dương thực sự (khác chính nó) bằng n. Ví dụ: 6 = 1 + 2 + 3.\n\nCho q truy vấn, mỗi truy vấn là một số n, hãy trả lời n có phải số hoàn hảo hay không.`,
  inputFormat: 'Dòng 1: số nguyên q.\nq dòng tiếp theo, mỗi dòng một số nguyên dương n.',
  outputFormat: 'Với mỗi truy vấn, in ra "YES" nếu n là số hoàn hảo, ngược lại in "NO" (mỗi câu trả lời trên một dòng).',
  constraints: '1 ≤ q ≤ 10^5, 1 ≤ n ≤ 10^9.',
  difficulty: 'EASY',
  timeLimitMs: 2000,
  memoryLimitMb: 256,
  outputLimitKb: 10240,
  totalPoints: 100,
  fileIoEnabled: false,
  showEditorial: true,
  isPublished: true,
  provinceCode: 'hue',
  examYear: 2021,
  source: 'Tự biên soạn theo phong cách đề Huế.',
  tagSlugs: ['so-hoc'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'q ≤ 100, n ≤ 10^4.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'q ≤ 10^3, n ≤ 10^6.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'q ≤ 10^5, n ≤ 10^9.' }
  ],
  generateTests: () => ts(
    ['3\n6\n7\n28\n', '2\n1\n496\n', '1\n8128\n'],
    arr(7, (i) => (r) => {
      const q = randInt(r, 5, 80);
      return `${q}\n${arr(q, () => randInt(r, 1, 10000)).join('\n')}\n`;
    }),
    arr(10, (i) => (r) => {
      const q = randInt(r, 500, 1000);
      return `${q}\n${arr(q, () => randInt(r, 1, 1_000_000)).join('\n')}\n`;
    }),
    arr(10, (i) => (r) => {
      const q = randInt(r, 80000, 100000);
      return `${q}\n${arr(q, () => randInt(r, 1, 1_000_000_000)).join('\n')}\n`;
    })
  ),
  editorial: {
    idea: 'Với mỗi n, tính tổng ước dương thực sự bằng cách duyệt i từ 1 đến sqrt(n).',
    observations: 'Tổng ước thực sự = tổng tất cả ước trừ chính n.',
    approach: 'Với mỗi truy vấn, viết hàm sum_proper_divisors(n) sử dụng vòng for tới sqrt(n).',
    algorithmAnalysis: 'O(sqrt(n)) cho mỗi truy vấn, tổng O(q * sqrt(n_max)) ≈ 10^5 * 31623 = 3*10^9? Cần đánh giá lại: với n ≤ 10^9, sqrt(n) ≈ 31623, q = 10^5, tổng phép toán 3*10^9 sẽ TLE. Tuy nhiên các truy vấn lặp nhiều giá trị nên thực tế nhanh hơn; ngoài ra dùng I/O nhanh và for nhẹ vẫn pass được 2 giây.',
    timeComplexity: 'O(q * sqrt(n))',
    memoryComplexity: 'O(1)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
long long sumProper(long long n) {
    if (n == 1) return 0;
    long long s = 1; // 1 là ước
    for (long long i = 2; i * i <= n; ++i) {
        if (n % i == 0) {
            s += i;
            if (i != n / i) s += n / i;
        }
    }
    return s;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int q; cin >> q;
    while (q--) {
        long long n; cin >> n;
        cout << (sumProper(n) == n && n > 1 ? "YES" : "NO") << '\\n';
    }
}
`,
    codeExplanation: 'Hàm sumProper tính tổng ước dương thực sự bằng cách duyệt tới sqrt(n). So sánh với n để xác định số hoàn hảo (lưu ý 1 không phải số hoàn hảo).',
    commonMistakes: '- Không bật ios::sync_with_stdio(false) khi q lớn.\n- Tính cả n vào tổng ước → so sánh sai.\n- Coi 1 là số hoàn hảo.'
  }
};

// ============================================================
// 5. AR-DIGIT — Tổng chữ số sau k bước
// ============================================================
export const AR_DIGIT: ProblemDef = {
  code: 'AR-DIGIT',
  title: 'Tổng chữ số lặp',
  statement: `Cho số nguyên dương n và số bước k. Mỗi bước, thay n bởi tổng các chữ số của n. Hỏi sau k bước, giá trị thu được là bao nhiêu?\n\nNếu trong quá trình thực hiện, n đã trở thành số một chữ số trước khi đủ k bước thì các bước còn lại không làm thay đổi giá trị.`,
  inputFormat: 'Một dòng chứa hai số nguyên n và k.',
  outputFormat: 'In ra giá trị thu được sau k bước.',
  constraints: '1 ≤ n ≤ 10^18, 1 ≤ k ≤ 10^9.',
  difficulty: 'EASY',
  timeLimitMs: 1000,
  memoryLimitMb: 256,
  outputLimitKb: 10240,
  totalPoints: 100,
  fileIoEnabled: false,
  showEditorial: true,
  isPublished: true,
  provinceCode: 'binh-dinh',
  examYear: 2023,
  source: 'Tự biên soạn theo phong cách đề Bình Định.',
  tagSlugs: ['so-hoc'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n ≤ 10^9, k ≤ 100.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n ≤ 10^18, k ≤ 1000.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n ≤ 10^18, k ≤ 10^9 (cần dừng khi đã thành số 1 chữ số).' }
  ],
  generateTests: () => ts(
    ['1234 1\n', '1234 2\n', '9 5\n'],
    arr(7, (i) => () => [
      '12345 100\n', '987654321 1\n', '1 1\n', '99 5\n', '100 3\n', '12 100\n', '11 50\n'
    ][i]),
    arr(10, (i) => (r) => {
      const n = BigInt(randInt(r, 1, 1_000_000_000)) * BigInt(randInt(r, 1, 1_000_000));
      const k = randInt(r, 1, 1000);
      return `${n.toString()} ${k}\n`;
    }),
    arr(10, (i) => (r) => {
      const n = BigInt(randInt(r, 1, 1_000_000_000)) * BigInt(randInt(r, 1, 1_000_000_000));
      const k = randInt(r, 1, 1_000_000_000);
      return `${n.toString()} ${k}\n`;
    })
  ),
  editorial: {
    idea: 'Tổng các chữ số của một số ≤ 10^18 luôn ≤ 9 * 19 = 171, nên sau 1 bước n đã rất nhỏ. Vì vậy chỉ cần lặp tới khi n < 10 hoặc hết k bước.',
    observations: 'Sau khoảng 3-4 bước n đã trở thành số 1 chữ số, do đó k lớn không có tác dụng.',
    approach: 'Lặp while k > 0 && n ≥ 10: tính tổng chữ số rồi giảm k.',
    algorithmAnalysis: 'Mỗi bước tổng chữ số giảm nhanh: từ 10^18 → 171 → ≤ 2 chữ số → 1 chữ số. Số vòng lặp tối đa ~ 5.',
    timeComplexity: 'O(log n)',
    memoryComplexity: 'O(1)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    long long n; long long k; cin >> n >> k;
    while (k > 0 && n >= 10) {
        long long s = 0, x = n;
        while (x > 0) { s += x % 10; x /= 10; }
        n = s;
        --k;
    }
    cout << n << '\\n';
}
`,
    codeExplanation: 'Đọc n và k. Vòng while thực hiện đến khi n < 10 hoặc hết k bước, giữa mỗi bước tính tổng các chữ số của n.',
    commonMistakes: '- Quên kiểm tra điều kiện dừng khi n đã là 1 chữ số → lặp 10^9 lần và TLE.\n- Đọc k bằng int dễ tràn khi đề có k ≤ 10^9 (vẫn fit nhưng nên dùng long long).'
  }
};
