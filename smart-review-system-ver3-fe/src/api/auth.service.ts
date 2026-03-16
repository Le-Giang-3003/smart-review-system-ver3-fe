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

export interface ResetPasswordRequest {
  email: string
}

export interface ResetPasswordConfirmRequest {
  token: string
  newPassword: string
}

export interface CreateAccountRequest {
  email: string
  role: 'Admin' | 'Lecturer' | 'Student'
  lecturerId?: number
  studentId?: number
}

export interface LockUnlockAccountRequest {
  userId: number
  isLocked: boolean
}

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data)
    return response.data
  },

  logout: async (refreshToken: string) => {
    const response = await apiClient.post<ApiResponse<null>>('/auth/logout', { refreshToken })
    return response.data
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/refresh-token', {
      refreshToken,
    })
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

  requestPasswordReset: async (data: ResetPasswordRequest) => {
    const response = await apiClient.post<ApiResponse<null>>('/auth/request-password-reset', data)
    return response.data
  },

  confirmPasswordReset: async (data: ResetPasswordConfirmRequest) => {
    const response = await apiClient.post<ApiResponse<null>>('/auth/confirm-password-reset', data)
    return response.data
  },

  createAccount: async (data: CreateAccountRequest) => {
    const response = await apiClient.post<ApiResponse<null>>('/auth/create-account', data)
    return response.data
  },

  lockUnlockAccount: async (data: LockUnlockAccountRequest) => {
    const response = await apiClient.post<ApiResponse<null>>('/auth/lock-unlock', data)
    return response.data
  },
}
