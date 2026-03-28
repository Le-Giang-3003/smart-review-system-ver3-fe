export interface ApiResponse<T> {
  data: T | null
  isSuccess?: boolean
  statusCode: number
  message: string
  errors?: string[]
}

/** Chuẩn hóa mã trạng thái từ BE (camelCase/PascalCase, số hoặc chuỗi). */
function normalizeApiStatusCode(res: unknown): number | undefined {
  if (res == null || typeof res !== 'object') return undefined
  const o = res as Record<string, unknown>
  const v = o.statusCode ?? o.StatusCode
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string') {
    const n = parseInt(v, 10)
    return Number.isNaN(n) ? undefined : n
  }
  return undefined
}

/**
 * Kết quả mutation khi `mutationFn` trả về `axios` thường là `AxiosResponse`;
 * `data` thực tế của ApiResponse nằm ở `.data`.
 */
export function getApiEnvelopeFromMutationResult<T>(mutationResult: unknown): ApiResponse<T> | null {
  if (mutationResult == null || typeof mutationResult !== 'object') return null
  const r = mutationResult as Record<string, unknown>
  const inner = r.data
  if (inner != null && typeof inner === 'object' && normalizeApiStatusCode(inner) != null) {
    return inner as unknown as ApiResponse<T>
  }
  if (normalizeApiStatusCode(r) != null) {
    return r as unknown as ApiResponse<T>
  }
  return null
}

export function isApiSuccess<T>(res: ApiResponse<T> | null | undefined): boolean {
  if (res == null) return false
  if (typeof res.isSuccess === 'boolean') return res.isSuccess
  const code = normalizeApiStatusCode(res)
  if (code == null) return false
  return code >= 1000 && code < 2000
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
