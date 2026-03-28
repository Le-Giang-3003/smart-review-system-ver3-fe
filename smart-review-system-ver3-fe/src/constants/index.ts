import type { TablePaginationConfig } from 'antd/es/table/interface'

/** Lấy đủ bản ghi một lần; bảng phân trang phía client (giống trang Nhóm). */
export const ADMIN_LIST_API_PAGE_SIZE = 500

/** Phân trang bảng danh sách admin: số trang + ellipsis + chọn số dòng/trang (locale vi_VN). */
export const ADMIN_LIST_TABLE_PAGINATION: TablePaginationConfig = {
  pageSize: 12,
  showSizeChanger: true,
  pageSizeOptions: ['12', '24', '48', '96'],
}

export const STORAGE_KEYS = {
  TOKEN: 'smart_review_token',
  REFRESH_TOKEN: 'smart_review_refresh_token',
  USER: 'smart_review_user',
} as const

export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  ADMIN: '/admin',
  LECTURER: '/lecturer',
  STUDENT: '/student',
  PROFILE: '/profile',
} as const

export const SEMESTER_STATUS_LABELS: Record<number, string> = {
  0: 'Sắp tới',
  1: 'Đang hoạt động',
  2: 'Đã hoàn thành',
}

/** ReviewPeriodStatus: Draft(0), Open(1), Scheduling(2), Scheduled(3), InProgress(4), Closed(5) */
export const PERIOD_STATUS_LABELS: Record<number, string> = {
  0: 'Nháp',
  1: 'Mở đăng ký',
  2: 'Đang lên lịch',
  3: 'Đã xếp lịch',
  4: 'Đang diễn ra',
  5: 'Đã đóng',
}

export const PERIOD_STATUS_COLORS: Record<number, string> = {
  0: 'default',
  1: 'processing',
  2: 'warning',
  3: 'cyan',
  4: 'success',
  5: 'default',
}

/** BE trả status dạng string trên một số endpoint */
export const PERIOD_STATUS_STRING_LABELS: Record<string, string> = {
  Draft: 'Nháp',
  Open: 'Mở đăng ký',
  Scheduling: 'Đang lên lịch',
  Scheduled: 'Đã xếp lịch',
  InProgress: 'Đang diễn ra',
  Closed: 'Đã đóng',
}

export const PERIOD_STATUS_STRING_COLORS: Record<string, string> = {
  Draft: 'default',
  Open: 'processing',
  Scheduling: 'warning',
  Scheduled: 'cyan',
  InProgress: 'success',
  Closed: 'default',
}

export const REVIEW_ROUND_LABELS: Record<number, string> = {
  1: 'Vòng 1',
  2: 'Vòng 2',
  3: 'Vòng 3',
}

/** BE có thể trả round dạng "Round1" | 1 */
export const REVIEW_ROUND_STRING_LABELS: Record<string, string> = {
  Round1: 'Vòng 1',
  Round2: 'Vòng 2',
  Round3: 'Vòng 3',
}

export const GROUP_STATUS_LABELS: Record<string, string> = {
  Forming: 'Đang tập hợp',
  Ready: 'Sẵn sàng',
  Registered: 'Đã đăng ký',
  InReview: 'Đang review',
  Completed: 'Hoàn thành',
}

export const GROUP_STATUS_COLORS: Record<string, string> = {
  Forming: 'default',
  Ready: 'processing',
  Registered: 'warning',
  InReview: 'success',
  Completed: 'default',
}

export const INVITATION_STATUS_LABELS: Record<string, string> = {
  Pending: 'Chờ phản hồi',
  Accepted: 'Đã chấp nhận',
  Rejected: 'Đã từ chối',
}

export const INVITATION_STATUS_COLORS: Record<string, string> = {
  Pending: 'warning',
  Accepted: 'success',
  Rejected: 'error',
}

export const COMPATIBILITY_TYPE_LABELS: Record<string, string> = {
  Normal: 'Bình thường',
  Preferred: 'Ưu tiên',
  StrongIncompatible: 'Không tương thích',
}

export const FEEDBACK_STATUS_LABELS: Record<number, string> = {
  0: 'Nháp',
  1: 'Đã nộp',
}

export const SUGGESTION_LABELS: Record<number, string> = {
  0: 'Đạt',
  1: 'Chỉnh sửa lại',
  2: 'Không đạt',
}

export const ROLE_LABELS: Record<string, string> = {
  Admin: 'Quản trị viên',
  Lecturer: 'Giảng viên',
  Student: 'Sinh viên',
}

export const ROLE_COLORS: Record<string, string> = {
  Admin: 'volcano',
  Lecturer: 'blue',
  Student: 'green',
}

/** Role enum từ BE (UserListDto) */
export const ROLE_VALUE_LABELS: Record<number, string> = {
  0: 'Quản trị viên',
  1: 'Giảng viên',
  2: 'Sinh viên',
}

export const ROLE_VALUE_COLORS: Record<number, string> = {
  0: 'volcano',
  1: 'blue',
  2: 'green',
}
