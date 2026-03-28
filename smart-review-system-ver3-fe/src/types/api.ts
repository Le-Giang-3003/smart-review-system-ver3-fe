export interface ApiResponse<T> {
  data: T | null
  isSuccess?: boolean
  statusCode: number
  message: string
  errors?: string[]
}

export function isApiSuccess<T>(res: ApiResponse<T>): boolean {
  if (typeof res.isSuccess === 'boolean') return res.isSuccess
  return res.statusCode >= 1000 && res.statusCode < 2000
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
}

/** Alias khớp `PagedResult<T>` từ BE */
export type PagedResult<T> = PaginatedResponse<T>

export interface UserInfo {
  id: number
  email: string
  fullName?: string
  role: 'Admin' | 'Lecturer' | 'Student'
  forceChangePassword?: boolean
  studentId?: number
  lecturerId?: number
  studentCode?: string
  lecturerCode?: string
}

/** Khớp `LoginResponse` từ BE — không có refresh token */
export interface LoginResponse {
  accessToken: string
  accessTokenExpiry: string
  user: UserInfo
}

/** Import GV/SV từ Excel (Lecturers/Students controller) */
export interface LecturerStudentImportResultDto {
  created: number
  updated: number
  errors: string[]
}

/** Import capstone / tổng hợp — các handler BE có thể khác nhau */
export interface ImportResultDto {
  totalFiles?: number
  lecturersCreated?: number
  studentsCreated?: number
  groupsCreated?: number
  topicsCreated?: number
  errors: string[]
}
