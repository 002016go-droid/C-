import { ProblemDef, TestSpec } from '../types';
import { makeRng, randInt, arr } from '../helpers';

function ts(samples: string[], small: ((r: () => number) => string)[], medium: ((r: () => number) => string)[], large: ((r: () => number) => string)[]): TestSpec[] {
  const out: TestSpec[] = [];
  let idx = 1;
  samples.forEach((s) => out.push({ order: idx++, subtaskOrder: 1, isSample: true, input: s }));
  const r1 = makeRng(111); for (const g of small) out.push({ order: idx++, subtaskOrder: 1, isSample: false, input: g(r1) });
  const r2 = makeRng(222); for (const g of medium) out.push({ order: idx++, subtaskOrder: 2, isSample: false, input: g(r2) });
  const r3 = makeRng(333); for (const g of large) out.push({ order: idx++, subtaskOrder: 3, isSample: false, input: g(r3) });
  return out;
}

function randStr(r: () => number, len: number, alphabet = 'abcdefghijklmnopqrstuvwxyz'): string {
  let out = '';
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(r() * alphabet.length)];
  return out;
}

// 1. ST-COUNT-VOWEL
export const ST_COUNT_VOWEL: ProblemDef = {
  code: 'ST-COUNT-VOWEL',
  title: 'Đếm nguyên âm',
  statement: `Cho xâu s gồm các chữ cái tiếng Anh (in thường). Hãy đếm số nguyên âm trong s (a, e, i, o, u).`,
  inputFormat: 'Một dòng chứa xâu s.',
  outputFormat: 'In ra số nguyên âm xuất hiện trong s.',
  constraints: '1 ≤ |s| ≤ 10^5.',
  difficulty: 'EASY',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'quang-nam', examYear: 2020, source: 'Tự biên soạn theo phong cách đề Quảng Nam.',
  tagSlugs: ['xau'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: '|s| ≤ 100.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: '|s| ≤ 10^4.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: '|s| ≤ 10^5.' }
  ],
  generateTests: () => ts(
    ['hello\n', 'abcde\n', 'xyz\n'],
    arr(7, () => (r) => randStr(r, randInt(r, 5, 100)) + '\n'),
    arr(10, () => (r) => randStr(r, randInt(r, 1000, 10000)) + '\n'),
    arr(10, () => (r) => randStr(r, randInt(r, 90000, 100000)) + '\n')
  ),
  editorial: {
    idea: 'Duyệt từng ký tự và đếm.',
    observations: 'Nguyên âm: a, e, i, o, u.',
    approach: 'Vòng for cộng vào biến đếm khi ký tự là nguyên âm.',
    algorithmAnalysis: 'O(|s|).',
    timeComplexity: 'O(|s|)',
    memoryComplexity: 'O(1)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    string s; cin >> s;
    int cnt = 0;
    for (char c : s) if (c=='a'||c=='e'||c=='i'||c=='o'||c=='u') ++cnt;
    cout << cnt << '\\n';
}
`,
    codeExplanation: 'Đọc xâu rồi đếm các ký tự thuộc tập nguyên âm.',
    commonMistakes: '- Quên trường hợp xâu rỗng (đề đảm bảo |s| ≥ 1).\n- Đọc bằng getline khi xâu không chứa khoảng trắng là không cần thiết.'
  }
};

// 2. ST-PALIN — Kiểm tra palindrome trong xâu cha
export const ST_PALIN: ProblemDef = {
  code: 'ST-PALIN',
  title: 'Kiểm tra xâu đối xứng',
  statement: `Cho xâu s. Hãy kiểm tra s có là xâu đối xứng (palindrome) hay không. In "YES" hoặc "NO".`,
  inputFormat: 'Một dòng chứa s (chỉ chứa chữ thường a-z).',
  outputFormat: '"YES" nếu s là palindrome, ngược lại "NO".',
  constraints: '1 ≤ |s| ≤ 10^5.',
  difficulty: 'EASY',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'hue', examYear: 2019, source: 'Tự biên soạn theo phong cách đề Huế.',
  tagSlugs: ['xau'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: '|s| ≤ 100.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: '|s| ≤ 10^4.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: '|s| ≤ 10^5.' }
  ],
  generateTests: () => ts(
    ['aba\n', 'abc\n', 'a\n'],
    arr(7, () => (r) => {
      const half = randStr(r, randInt(r, 1, 50));
      const palin = half + (r() < 0.5 ? half.split('').reverse().join('') : half.slice(0, -1).split('').reverse().join(''));
      return (r() < 0.5 ? palin : randStr(r, palin.length)) + '\n';
    }),
    arr(10, () => (r) => {
      const half = randStr(r, randInt(r, 2000, 5000));
      const palin = half + half.split('').reverse().join('');
      return (r() < 0.5 ? palin : randStr(r, palin.length)) + '\n';
    }),
    arr(10, () => (r) => {
      const half = randStr(r, randInt(r, 40000, 50000));
      const palin = half + half.split('').reverse().join('');
      return (r() < 0.5 ? palin : randStr(r, palin.length)) + '\n';
    })
  ),
  editorial: {
    idea: 'So sánh ký tự đối xứng với hai chỉ số chạy từ đầu và cuối về giữa.',
    observations: 'Nếu phát hiện cặp khác, kết luận NO ngay.',
    approach: 'Vòng for i = 0 → |s|/2, nếu s[i] != s[|s|-1-i] thì NO.',
    algorithmAnalysis: 'O(|s|).',
    timeComplexity: 'O(|s|)',
    memoryComplexity: 'O(1)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    string s; cin >> s;
    bool ok = true;
    for (int i = 0, j = (int)s.size() - 1; i < j; ++i, --j) if (s[i] != s[j]) { ok = false; break; }
    cout << (ok ? "YES" : "NO") << '\\n';
}
`,
    codeExplanation: 'Hai con trỏ i từ đầu và j từ cuối, so sánh ký tự, dừng khi gặp khác.',
    commonMistakes: '- Quên kiểu int khi |s| lớn (vẫn fit).\n- Reverse và so sánh bằng == cũng đúng nhưng tốn bộ nhớ hơn.'
  }
};

// 3. ST-ANAGRAM — Đếm cặp anagram trong danh sách
export const ST_ANAGRAM: ProblemDef = {
  code: 'ST-ANAGRAM',
  title: 'Cặp anagram',
  statement: `Cho n xâu chỉ chứa chữ thường a-z. Hãy đếm số cặp (i, j) với i < j sao cho hai xâu s[i], s[j] là anagram của nhau (tức cùng tập ký tự với cùng số lần xuất hiện).`,
  inputFormat: 'Dòng 1: n.\n n dòng tiếp theo, mỗi dòng một xâu.',
  outputFormat: 'In ra số cặp anagram.',
  constraints: '1 ≤ n ≤ 10^5, tổng độ dài các xâu ≤ 10^6.',
  difficulty: 'MEDIUM',
  timeLimitMs: 2000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'da-nang', examYear: 2023, source: 'Tự biên soạn theo phong cách đề Đà Nẵng.',
  tagSlugs: ['xau', 'stack-queue'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n ≤ 100, |s| ≤ 20.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n ≤ 5000.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n ≤ 10^5.' }
  ],
  generateTests: () => ts(
    ['3\nabc\nbca\ncab\n', '4\nab\nba\ncd\ndc\n', '1\nhello\n'],
    arr(7, () => (r) => { const n = randInt(r, 5, 100); return `${n}\n${arr(n, () => randStr(r, randInt(r, 2, 20))).join('\n')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 1000, 5000); return `${n}\n${arr(n, () => randStr(r, randInt(r, 2, 30))).join('\n')}\n`; }),
    arr(10, () => (r) => { const n = randInt(r, 80000, 100000); return `${n}\n${arr(n, () => randStr(r, randInt(r, 2, 10))).join('\n')}\n`; })
  ),
  editorial: {
    idea: 'Sắp xếp các ký tự của mỗi xâu thành dạng chuẩn, sau đó đếm tần suất các dạng chuẩn.',
    observations: 'Số cặp anagram của một nhóm có cùng dạng chuẩn k phần tử là k*(k-1)/2.',
    approach: 'Với mỗi xâu, sort ký tự. Đếm tần suất bằng unordered_map<string,int>. Tổng số cặp = Σ c*(c-1)/2.',
    algorithmAnalysis: 'O(Σ|s| log |s|) cho sort; map O(Σ|s|) cho hashing.',
    timeComplexity: 'O(Σ|s| log |s|)',
    memoryComplexity: 'O(Σ|s|)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin >> n;
    unordered_map<string,long long> cnt;
    while (n--) {
        string s; cin >> s;
        sort(s.begin(), s.end());
        ++cnt[s];
    }
    long long ans = 0;
    for (auto& kv : cnt) ans += kv.second * (kv.second - 1) / 2;
    cout << ans << '\\n';
}
`,
    codeExplanation: 'Sort xâu rồi đếm tần suất; cộng combinations C(k,2) cho mỗi nhóm.',
    commonMistakes: '- Dùng int cho biến đếm cặp dễ tràn khi n = 10^5.\n- Quên sort khi đặt key.\n- Dùng map<string,int> chậm hơn nhưng vẫn pass.'
  }
};

// 4. ST-COMPRESS — Nén chạy ký tự
export const ST_COMPRESS: ProblemDef = {
  code: 'ST-COMPRESS',
  title: 'Nén chuỗi ký tự',
  statement: `Cho xâu s chỉ gồm chữ thường a-z. Hãy thực hiện nén "run-length": với mỗi đoạn liên tiếp gồm c lần ký tự x, in ra "xc". Ví dụ aaabbc → "a3b2c1".`,
  inputFormat: 'Một dòng chứa xâu s.',
  outputFormat: 'In ra xâu sau khi nén.',
  constraints: '1 ≤ |s| ≤ 10^5.',
  difficulty: 'EASY',
  timeLimitMs: 1000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'quang-ngai', examYear: 2021, source: 'Tự biên soạn theo phong cách đề Quảng Ngãi.',
  tagSlugs: ['xau'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: '|s| ≤ 100.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: '|s| ≤ 10^4.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: '|s| ≤ 10^5.' }
  ],
  generateTests: () => ts(
    ['aaabbc\n', 'abc\n', 'aaaaaa\n'],
    arr(7, () => (r) => randStr(r, randInt(r, 5, 100), 'abc') + '\n'),
    arr(10, () => (r) => randStr(r, randInt(r, 1000, 10000), 'abcd') + '\n'),
    arr(10, () => (r) => randStr(r, randInt(r, 90000, 100000), 'abcdefg') + '\n')
  ),
  editorial: {
    idea: 'Duyệt xâu theo các đoạn ký tự liên tiếp giống nhau.',
    observations: 'Cần in cả ký tự và đếm.',
    approach: 'Dùng biến cnt đếm số ký tự cùng loại; khi gặp ký tự khác thì in cặp (char, cnt) rồi reset.',
    algorithmAnalysis: 'O(|s|).',
    timeComplexity: 'O(|s|)',
    memoryComplexity: 'O(|s|) cho output',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    string s; cin >> s;
    string out;
    for (int i = 0; i < (int)s.size(); ) {
        int j = i;
        while (j < (int)s.size() && s[j] == s[i]) ++j;
        out += s[i];
        out += to_string(j - i);
        i = j;
    }
    cout << out << '\\n';
}
`,
    codeExplanation: 'Hai con trỏ i, j tìm đoạn ký tự giống nhau và in.',
    commonMistakes: '- Quên reset cnt khi đổi ký tự.\n- Đọc bằng cin >> s sai khi xâu chứa space (đề không có space).'
  }
};
