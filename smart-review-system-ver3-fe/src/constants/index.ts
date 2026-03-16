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

export const PERIOD_STATUS_LABELS: Record<number, string> = {
  0: 'Nháp',
  1: 'Mở đăng ký',
  2: 'Đang lên lịch',
  3: 'Đang tiến hành',
  4: 'Đã hoàn thành',
}

export const PERIOD_STATUS_COLORS: Record<number, string> = {
  0: 'default',
  1: 'processing',
  2: 'warning',
  3: 'success',
  4: 'default',
}

export const REVIEW_ROUND_LABELS: Record<number, string> = {
  1: 'Vòng 1',
  2: 'Vòng 2',
  3: 'Vòng 3',
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
  Normal: 'Trung lập',
  Preferred: 'Ưu tiên',
  StrongIncompatible: 'Không tương thích',
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
