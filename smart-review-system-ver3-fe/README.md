# Smart Review System - Frontend

React TypeScript frontend cho Smart Review System - ứng dụng quản lý lịch review học thuật.

## Tech Stack

- **Core**: React 18+ với TypeScript, Vite
- **Routing**: React Router v6
- **State**: TanStack Query (React Query) + Zustand
- **UI**: Ant Design (antd)
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios với interceptors
- **Date**: date-fns, dayjs

## Cài đặt

```bash
npm install
```

## Chạy development

```bash
npm run dev
```

Ứng dụng chạy tại http://localhost:5173

## Build production

```bash
npm run build
```

## Cấu hình

Tạo file `.env` hoặc `.env.development`:

```
VITE_API_BASE_URL=https://localhost:7061/api
```

**Lưu ý**: Đảm bảo backend chạy tại https://localhost:7061 (hoặc cập nhật URL cho phù hợp).

## Đăng nhập demo

- **Admin**: admin@test.com / 123456

## Cấu trúc dự án

```
src/
├── api/                    # API client & services
│   ├── client.ts           # Axios instance với interceptors
│   ├── auth.service.ts
│   └── admin.service.ts
├── components/
│   ├── common/             # ProtectedRoute, etc.
│   └── layout/             # MainLayout
├── pages/
│   ├── auth/               # Login
│   ├── admin/              # Admin portal
│   ├── lecturer/           # Lecturer portal
│   └── student/            # Student portal
├── hooks/                  # useAuth
├── stores/                 # Zustand (authStore)
├── types/                  # TypeScript types
├── utils/                  # formatDate, etc.
└── constants/              # ROUTES, labels
```

## Tính năng Admin

- Quản lý học kỳ (CRUD)
- Quản lý đợt review với cấu hình trọng số
- Quản lý slot review
- Quản lý đề tài và tags
- Quản lý giảng viên, ma trận tương thích
- Phiên review
- Thuật toán lên lịch (2-Tier algorithm)

## Lecturer & Student Portal

UI đã được tạo sẵn, chờ kết nối API khi backend triển khai các endpoint tương ứng.
