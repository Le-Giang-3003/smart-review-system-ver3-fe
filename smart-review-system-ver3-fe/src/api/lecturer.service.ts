import { apiClient } from './client'
import type { ApiResponse, PagedResult } from '@/types/api'
import type { LecturerDashboardDto, ReviewSlot, MyLecturerScheduleDto, SlotPreferenceItem } from '@/types/entities'

export const lecturerApiService = {
  getDashboard: () =>
    apiClient.get<ApiResponse<LecturerDashboardDto>>('/dashboard/lecturer'),

  getMySchedule: (reviewPeriodId: number) =>
    apiClient.get<ApiResponse<MyLecturerScheduleDto>>(`/review-periods/${reviewPeriodId}/my-schedule`),

  getSlotsForPeriod: (reviewPeriodId: number, params?: { pageNumber?: number; pageSize?: number }) =>
    apiClient.get<ApiResponse<PagedResult<ReviewSlot>>>(
      `/review-slots/by-period/${reviewPeriodId}`,
      { params: { ...params, pageSize: params?.pageSize ?? 100 } }
    ),

  getMyLecturerPreferences: (reviewPeriodId: number) =>
    apiClient.get<ApiResponse<unknown>>(`/review-periods/${reviewPeriodId}/lecturer-preferences/me`),

  registerLecturerPreferences: (reviewPeriodId: number, preferences: SlotPreferenceItem[]) =>
    apiClient.post<ApiResponse<null>>(`/review-periods/${reviewPeriodId}/lecturer-preferences`, {
      preferences,
    }),

  updateLecturerPreferences: (reviewPeriodId: number, preferences: SlotPreferenceItem[]) =>
    apiClient.put<ApiResponse<null>>(`/review-periods/${reviewPeriodId}/lecturer-preferences`, {
      preferences,
    }),
}

export { reviewAssignmentService } from './admin.service'
