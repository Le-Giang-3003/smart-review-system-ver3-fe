import { apiClient } from './client'
import type { ApiResponse, LoginResponse, UserInfo } from '@/types/api'

export interface LoginRequest {
  email: string
  password: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

/** Chỉ các endpoint có trên BE (`AuthController`). */
export const authService = {
  login: async (data: LoginRequest) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data)
    return response.data
  },

  getMe: async () => {
    const response = await apiClient.get<ApiResponse<UserInfo>>('/auth/me')
    return response.data
  },

  changePassword: async (data: ChangePasswordRequest) => {
    const response = await apiClient.post<ApiResponse<null>>('/auth/change-password', data)
    return response.data
  },

  /** BE chưa có endpoint — trả lỗi rõ ràng cho UI */
  requestPasswordReset: async (_data: { email: string }): Promise<ApiResponse<null>> => ({
    data: null,
    statusCode: 4000,
    message: 'Backend chưa hỗ trợ đặt lại mật khẩu qua email.',
  }),
}
