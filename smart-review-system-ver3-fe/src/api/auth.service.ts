import { apiClient } from './client'
import type { ApiResponse } from '@/types/api'
import type { LoginResponse } from '@/types/api'

export interface LoginRequest {
  email: string
  password: string
}

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('api/auth/login', data)
    return response.data
  },

  getMe: async () => {
    const response = await apiClient.get<ApiResponse<{ id: string; email: string; fullName: string; role: string }>>('/auth/me')
    return response.data
  },
}
