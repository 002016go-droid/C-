import { ProblemDef, TestSpec } from '../types';
import { makeRng, randInt, arr } from '../helpers';

function ts(samples: string[], small: ((r: () => number) => string)[], medium: ((r: () => number) => string)[], large: ((r: () => number) => string)[]): TestSpec[] {
  const out: TestSpec[] = [];
  let idx = 1;
  samples.forEach((s) => out.push({ order: idx++, subtaskOrder: 1, isSample: true, input: s }));
  const r1 = makeRng(1011); for (const g of small) out.push({ order: idx++, subtaskOrder: 1, isSample: false, input: g(r1) });
  const r2 = makeRng(1022); for (const g of medium) out.push({ order: idx++, subtaskOrder: 2, isSample: false, input: g(r2) });
  const r3 = makeRng(1033); for (const g of large) out.push({ order: idx++, subtaskOrder: 3, isSample: false, input: g(r3) });
  return out;
}

// BFS-GRID — Khoảng cách ngắn nhất trên lưới 0/1
export const BFS_GRID: ProblemDef = {
  code: 'BFS-GRID',
  title: 'Đường đi ngắn nhất trên lưới',
  statement: `Cho lưới n x m, ô có giá trị 0 là ô đi được, 1 là ô tường. Bạn đứng ở ô (1,1), muốn đến (n,m). Mỗi bước có thể đi sang 4 ô kề cạnh nếu ô đó là 0. Hỏi số bước ít nhất; nếu không thể, in -1.`,
  inputFormat: 'Dòng 1: n và m.\nn dòng tiếp theo, mỗi dòng m số 0/1 cách nhau bởi dấu cách.',
  outputFormat: 'Số bước ít nhất hoặc -1.',
  constraints: '1 ≤ n, m ≤ 1000, n*m ≤ 10^6. Đề bảo đảm ô (1,1) và (n,m) đều là 0.',
  difficulty: 'VERY_HARD',
  timeLimitMs: 2000, memoryLimitMb: 256, outputLimitKb: 10240, totalPoints: 100,
  fileIoEnabled: false, showEditorial: true, isPublished: true,
  provinceCode: 'quang-nam', examYear: 2024, source: 'Tự biên soạn theo phong cách đề Quảng Nam.',
  tagSlugs: ['bfs-dfs'],
  subtasks: [
    { name: 'Subtask 1', points: 30, order: 1, constraints: 'n, m ≤ 30.' },
    { name: 'Subtask 2', points: 30, order: 2, constraints: 'n, m ≤ 200.' },
    { name: 'Subtask 3', points: 40, order: 3, constraints: 'n*m ≤ 10^6.' }
  ],
  generateTests: () => {
    function gen(r: () => number, n: number, m: number, wallP: number) {
      const rows: string[] = [];
      for (let i = 0; i < n; i++) {
        const row: number[] = [];
        for (let j = 0; j < m; j++) {
          if ((i === 0 && j === 0) || (i === n - 1 && j === m - 1)) row.push(0);
          else row.push(r() < wallP ? 1 : 0);
        }
        rows.push(row.join(' '));
      }
      return `${n} ${m}\n${rows.join('\n')}\n`;
    }
    return ts(
      ['2 2\n0 0\n0 0\n', '3 3\n0 1 0\n0 1 0\n0 0 0\n', '2 2\n0 1\n1 0\n'],
      arr(7, () => (r) => gen(r, randInt(r, 5, 30), randInt(r, 5, 30), 0.2)),
      arr(10, () => (r) => gen(r, randInt(r, 100, 200), randInt(r, 100, 200), 0.25)),
      arr(10, () => (r) => { const n = randInt(r, 800, 1000); const m = Math.min(1000, Math.floor(1_000_000 / n)); return gen(r, n, m, 0.25); })
    );
  },
  editorial: {
    idea: 'BFS từ (1,1) trên đồ thị lưới. Mức của đỉnh đích là số bước ít nhất.',
    observations: 'Mỗi cạnh trọng số 1 nên BFS đủ.',
    approach: 'Mảng dist khởi tạo -1. Queue chứa (0,0); duyệt 4 hướng, cập nhật dist khi chưa thăm và ô là 0.',
    algorithmAnalysis: 'O(n*m).',
    timeComplexity: 'O(n*m)',
    memoryComplexity: 'O(n*m)',
    cppCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m; cin >> n >> m;
    vector<vector<int>> g(n, vector<int>(m));
    for (auto& row : g) for (auto& x : row) cin >> x;
    if (g[0][0] || g[n-1][m-1]) { cout << -1 << '\\n'; return 0; }
    vector<vector<int>> d(n, vector<int>(m, -1));
    queue<pair<int,int>> q;
    q.push({0, 0}); d[0][0] = 0;
    int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (int k = 0; k < 4; ++k) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
            if (g[nr][nc] || d[nr][nc] != -1) continue;
            d[nr][nc] = d[r][c] + 1;
            q.push({nr, nc});
        }
    }
    cout << d[n-1][m-1] << '\\n';
}
`,
    codeExplanation: 'BFS chuẩn trên lưới, dist 4 hướng.',
    commonMistakes: '- Dùng DFS đệ quy có thể stack overflow với n*m = 10^6.\n- Quên xử lý trường hợp đường đi không tồn tại.'
  }
};
