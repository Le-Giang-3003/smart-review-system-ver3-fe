import { apiClient } from './client'
import type { ApiResponse } from '@/types/api'
import type { LecturerDashboardDto, ReviewSlot } from '@/types/entities'

export const lecturerApiService = {
  getDashboard: () =>
    apiClient.get<ApiResponse<LecturerDashboardDto>>('/Dashboard/lecturer'),

  getAvailableSlots: (reviewPeriodId: number) =>
    apiClient.get<ApiResponse<ReviewSlot[]>>('/ReviewSlots', {
      params: { reviewPeriodId },
    }),

  registerForSlot: (slotId: number) =>
    apiClient.post<ApiResponse<null>>(`/ReviewSlots/${slotId}/register-lecturer`),

  unregisterFromSlot: (slotId: number) =>
    apiClient.delete<ApiResponse<null>>(`/ReviewSlots/${slotId}/unregister-lecturer`),
}
