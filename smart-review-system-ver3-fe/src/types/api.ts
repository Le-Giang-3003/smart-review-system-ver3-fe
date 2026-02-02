export interface ApiResponse<T> {
  data: T | null
  isSuccess: boolean
  statusCode: number
  message: string
  errors?: string[]
  timestamp: string
}

export interface UserInfo {
  id: number
  email: string
  fullName: string
  role: string
  studentCode?: string
  lecturerCode?: string
}

export interface LoginResponse {
  token: string
  expiresAt: string
  user: UserInfo
}
