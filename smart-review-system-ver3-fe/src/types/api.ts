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
  page: number
  pageSize: number
  totalPages: number
}

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

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  accessTokenExpiry: string
  user: UserInfo
}

export interface ImportResultDto {
  successCount: number
  errorCount: number
  errors: string[]
}
