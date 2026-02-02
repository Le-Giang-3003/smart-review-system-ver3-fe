export const STORAGE_KEYS = {
  TOKEN: 'smart_review_token',
  USER: 'smart_review_user',
} as const

export const ROUTES = {
  LOGIN: '/login',
  ADMIN: '/admin',
  LECTURER: '/lecturer',
  STUDENT: '/student',
} as const

export const SEMESTER_STATUS_LABELS: Record<number, string> = {
  0: 'Sắp tới',
  1: 'Đang hoạt động',
  2: 'Đã hoàn thành',
}

export const PERIOD_STATUS_LABELS: Record<number, string> = {
  0: 'Nháp',
  1: 'Mở',
  2: 'Đang lên lịch',
  3: 'Đang tiến hành',
  4: 'Đã hoàn thành',
}

export const REVIEW_ROUND_LABELS: Record<number, string> = {
  1: 'Vòng 1',
  2: 'Vòng 2',
  3: 'Vòng 3',
}

export const TOPIC_LEVEL_LABELS: Record<number, string> = {
  0: 'Cơ bản',
  1: 'Trung cấp',
  2: 'Nâng cao',
}

export const COMPATIBILITY_TYPE_LABELS: Record<number, string> = {
  0: 'Trung lập',
  1: 'Whitelist',
  2: 'Blacklist',
}
