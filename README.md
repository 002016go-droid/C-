# ChuyenTinOJ

Nền tảng luyện thi Online Judge dành cho học sinh thi chuyên Tin vào lớp 10 tại Việt Nam, đặc biệt theo phong cách đề các tỉnh miền Trung (Quảng Nam, Đà Nẵng, Quảng Ngãi, Huế, Bình Định, Phú Yên, Khánh Hòa).

> Lưu ý: Các bài tập trong seed là **tự biên soạn** theo phong cách đề chuyên Tin lớp 10 — không sao chép nguyên văn đề thi thật. Nếu bổ sung đề chính thức, vui lòng kiểm tra bản quyền và ghi rõ nguồn.

## Tính năng chính

- Đăng ký, đăng nhập, hồ sơ cá nhân, lịch sử nộp bài.
- Danh sách bài luyện với bộ lọc tỉnh, năm đề, chủ đề, độ khó (admin), độ khó thực tế (heuristic theo tỉ lệ AC), trạng thái cá nhân (chưa làm/đã thử/đã AC), rating.
- Trang chi tiết bài: statement tiếng Việt, input/output format, constraints, subtask, ví dụ, ghi chú, rating sao 1-5, bình luận, báo lỗi.
- Nộp bài C++ trực tiếp; chấm tự động theo subtask, hiển thị verdict & điểm; không lộ test ẩn.
- Editorial đầy đủ ý tưởng, phân tích, code C++17 mẫu, lỗi thường gặp.
- Đề thi mô phỏng (contest): 4 bài / 150 phút / 10 điểm, bảng xếp hạng.
- Dashboard học sinh: tổng quan, chủ đề mạnh/yếu, bài làm gần đây, gợi ý bài tiếp theo.
- Trang lộ trình ôn thi chuyên Tin vào 10 chia 8 giai đoạn.
- Trang admin: quản lý bài/test/editorial/contest/user/comment/report, thống kê.

## Công nghệ

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (mặc định cho MVP) — schema Prisma tương thích PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth (Credentials), phân quyền USER/ADMIN
- **Judge**: Local C++ executor (g++ -O2 -std=c++17). Kiến trúc executor pluggable đã sẵn sàng để thay bằng Docker sandbox sau.

## Cài đặt

Yêu cầu: Node.js ≥ 18, npm, g++ (đã có `gnu++17`).

```bash
npm install
```

## Cấu hình .env

Tạo file `.env` ở thư mục gốc (đã có sẵn `.env` mẫu):

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="please-change-this-to-a-long-random-string"

JUDGE_MODE="local"              # mock | local | sandboxed | docker (chọn executor; "sandboxed" cần bubblewrap+prlimit, "docker" reserved)
JUDGE_CPP_COMPILER="g++"
JUDGE_TIMEOUT_MS="5000"
```

Để dùng PostgreSQL trên production: đổi provider trong `prisma/schema.prisma` thành `postgresql` và `DATABASE_URL` thành chuỗi kết nối Postgres, sau đó chạy lại migration.

## Migrate database

```bash
npm run prisma:migrate -- --name init
```

Lệnh trên áp dụng migration đầu tiên cho SQLite (file `dev.db` được tạo trong `prisma/`).

## Seed 30 bài

```bash
npm run db:seed
```

Script seed:

1. Tạo tỉnh/thành (Quảng Nam, Đà Nẵng, ...), năm đề (2018-2024), tags.
2. Tạo 2 tài khoản mẫu: `admin@chuyentinoj.vn / admin123` (ADMIN) và `user@chuyentinoj.vn / user1234` (USER).
3. Với mỗi trong 30 bài: biên dịch code mẫu C++ bằng g++, sinh 30 test (3 sample + 27 ẩn) phân bổ theo 2-3 subtask, chạy code mẫu để tạo expected output đảm bảo đúng đắn.
4. Tạo 3 đề thi mô phỏng (4 bài × 3 đề).

Tổng cộng: 30 bài × 30 test = **900 test case**, 90 subtask, 30 editorial, 3 contest.

## Chạy ứng dụng

```bash
npm run dev
```

Mở `http://localhost:3000`.

## Chạy judge worker

Backend đã chấm bài inline khi user submit (gọi runner trong cùng process). Nếu muốn tách worker chạy nền:

```bash
npm run judge:worker
```

Worker poll bảng `Submission` mỗi 500 ms và chấm bài PENDING tuần tự.

## Tài khoản mẫu

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | `admin@chuyentinoj.vn` | `admin123` |
| User  | `user@chuyentinoj.vn`  | `user1234` |

## Cấu trúc thư mục

```
.
├── app/                       # Next.js App Router
│   ├── (public)/              # Trang public (bài tập, đề thi, dashboard, ...)
│   ├── admin/                 # Trang admin
│   └── api/                   # Tất cả API routes
├── components/                # React components dùng chung
├── data/
│   ├── helpers.ts             # Random helpers cho seed
│   ├── types.ts               # Kiểu định nghĩa bài
│   └── problems/              # 30 bài luyện (chia theo chủ đề)
├── lib/                       # Tiện ích: prisma client, auth, session, judge utils
├── prisma/
│   ├── schema.prisma          # Schema DB (User, Problem, Subtask, TestCase, ...)
│   ├── migrations/            # SQL migration
│   └── seed.ts                # Seed 30 bài
├── server/
│   └── judge/                 # runner, executor (local C++), queue, worker
└── README.md
```

## Kiến trúc judge

- `server/judge/runner.ts`: chấm 1 submission. Lấy code, biên dịch, chạy từng test, so sánh output, tính điểm theo subtask.
- `server/judge/cppExecutor.ts`: local g++ executor (MVP). Trong tương lai có thể thay bằng Docker executor (interface `JudgeExecutor`).
- `server/judge/queue.ts`: `enqueueSubmissionInline()` lập lịch chấm ngay sau khi submit (fire-and-forget).
- `server/judge/worker.ts`: worker đứng riêng poll DB.

So sánh output: chế độ `normalized` — bỏ khoảng trắng cuối dòng và dòng trống cuối file.

Tính điểm subtask: chỉ nhận điểm subtask nếu **toàn bộ test trong subtask** đều ACCEPTED. Một subtask fail không ảnh hưởng tới subtask khác.

## API chính

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| POST | `/api/register` | Đăng ký user |
| POST | `/api/auth/[...nextauth]` | NextAuth credentials |
| GET  | `/api/problems` | Danh sách bài có filter |
| GET  | `/api/problems/[code]` | Chi tiết bài |
| POST | `/api/submissions` | Nộp bài (yêu cầu đăng nhập) |
| GET  | `/api/submissions` | Lịch sử submission cá nhân |
| GET  | `/api/submissions/[id]` | Chi tiết 1 submission |
| POST | `/api/ratings` | Đánh giá sao (1-5) |
| GET/POST | `/api/comments` | Lấy/đăng bình luận |
| POST | `/api/comments/report` | Báo cáo bình luận |
| POST | `/api/reports` | Báo lỗi bài |
| GET  | `/api/contests` | Danh sách contest |
| GET  | `/api/contests/[code]` | Chi tiết + ranking |
| GET  | `/api/dashboard` | Dashboard cá nhân |
| GET/POST | `/api/admin/problems` | Quản lý bài |
| POST | `/api/admin/subtasks` | Cập nhật subtask |
| POST | `/api/admin/testcases` | Cập nhật test |
| POST | `/api/admin/editorials` | Cập nhật editorial |
| GET/POST | `/api/admin/contests` | Quản lý đề thi |
| GET/PATCH | `/api/admin/users` | Quản lý user |
| GET/PATCH | `/api/admin/reports` | Quản lý báo lỗi |
| GET/PATCH | `/api/admin/comments` | Quản lý bình luận |
| GET | `/api/admin/stats` | Thống kê |

Tất cả API admin yêu cầu user có `role = ADMIN`.

## Phân loại 30 bài seed

Theo yêu cầu phân bổ:

- 5 bài số học: `AR-SUM-DIV`, `AR-PRIME`, `AR-GCD`, `AR-PERFECT`, `AR-DIGIT`.
- 5 bài mảng: `AR-MAX2`, `AR-FREQ`, `AR-SHIFT`, `AR-INVERSE`, `AR-SECOND-MIN`.
- 4 bài xâu: `ST-COUNT-VOWEL`, `ST-PALIN`, `ST-ANAGRAM`, `ST-COMPRESS`.
- 3 bài sắp xếp/tìm kiếm: `SS-KTH`, `SS-MERGE`, `SS-BINSEARCH`.
- 3 bài prefix sum: `PS-RANGE`, `PS-COUNTEQ`, `PS-DIFF`.
- 3 bài hai con trỏ: `TP-SUMK`, `TP-LONGEST`, `TP-DISTINCT`.
- 3 bài tham lam: `GR-ACTIVITY`, `GR-COIN`, `GR-MEETING`.
- 2 bài quy hoạch động: `DP-LIS`, `DP-COIN`.
- 1 bài quay lui: `BT-SUBSET`.
- 1 bài BFS/DFS: `BFS-GRID`.

Mỗi bài có 2-3 subtask (tổng điểm = 100) và 30 test case (3 sample + 27 test ẩn).

## Bảo mật

- API admin yêu cầu role ADMIN; user thường không truy cập được.
- Test ẩn không trả về frontend (chỉ trả input/output của test mẫu).
- File I/O (Themis style) có thể cấu hình mỗi bài (`fileIoEnabled`, `fileInputName`, `fileOutputName`) — MVP vẫn dùng stdin/stdout, trường này dùng cho hiển thị.
- Source code submission được giới hạn 200 KB; output mỗi test giới hạn theo `outputLimitKb` (mặc định 10 MB).
- Local executor (`JUDGE_MODE=local`) chưa cách ly hệ thống. Để host preview/production có submission từ người dùng không tin tưởng, **dùng `JUDGE_MODE=sandboxed`** (bubblewrap + prlimit) — chặn `/etc`, `/home`, network, giới hạn memory/CPU. `JUDGE_MODE=docker` reserved cho bản containerized đầy đủ.

## Deploy

- Tạo PostgreSQL, đổi `DATABASE_URL`, chạy `npm run prisma:migrate` và `npm run db:seed`.
- Đặt biến `NEXTAUTH_URL`, `NEXTAUTH_SECRET` thật.
- Build & start: `npm run build && npm run start`.
- Triển khai judge worker dưới dạng dịch vụ riêng (`npm run judge:worker`) chạy trong container có sandbox.

## Giới hạn MVP

- Hai chế độ executor: `local` (chạy g++ thẳng trên host — chỉ dev nội bộ) và `sandboxed` (bubblewrap + prlimit — phù hợp shared preview). Tất cả đều **chưa phải Docker** (xem Roadmap).
- Đo memory chính xác chỉ ở `sandboxed` (qua `prlimit --as`); ở `local` chưa tích hợp `cgroups`/`getrusage`.
- Chưa hỗ trợ ngôn ngữ ngoài C++17 (đã có cấu trúc để mở rộng Python/Pascal).
- Bộ filter trang bài tập đang phía client (đủ với 30 bài; mở rộng quy mô cần phân trang server-side).
- Trang admin tập trung vào quản lý chính; UI form chi tiết subtask/test tách rời nên với khối lượng test lớn nên dùng API trực tiếp hoặc script seed.

## Roadmap

1. Docker sandbox cho judge worker: network off, cgroup memory/cpu, seccomp.
2. Hỗ trợ Python 3 và Pascal.
3. Job queue thực thụ (BullMQ + Redis) thay thế in-memory.
4. So sánh output theo nhiều mode: `strict`, `normalized`, `tokenized`, special judge (checker).
5. Trang admin nâng cao: trình soạn statement Markdown, upload zip test.
6. Bổ sung đề chính thức (đã xác minh bản quyền) cho Quảng Nam, Đà Nẵng, Quảng Ngãi.
7. Bài khó hơn dạng segment tree, KMP, Z-function cho học sinh mục tiêu điểm cao (vẫn trong phạm vi chuyên Tin vào 10).
8. Đo thời gian phòng thi & lưu trạng thái contest cá nhân.

## License

Dự án phục vụ học tập. Đề bài, editorial và code mẫu trong `data/problems/` tự biên soạn; vui lòng kiểm tra bản quyền nếu chèn thêm đề chính thức.
