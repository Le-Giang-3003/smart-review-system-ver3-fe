import { apiClient } from './client'
import type { ApiResponse, PagedResult } from '@/types/api'
import type {
  StudentDashboardDto,
  TopicListItem,
  ReviewSlot,
  MyGroupScheduleDto,
  SlotPreferenceItem,
} from '@/types/entities'

export const studentApiService = {
  getDashboard: () =>
    apiClient.get<ApiResponse<StudentDashboardDto>>('/dashboard/student'),

  getTopics: (params?: { search?: string; pageNumber?: number; pageSize?: number }) =>
    apiClient.get<ApiResponse<PagedResult<TopicListItem>>>('/topics', { params }),

  getSlotsForPeriod: (reviewPeriodId: number, params?: { pageNumber?: number; pageSize?: number }) =>
    apiClient.get<ApiResponse<PagedResult<ReviewSlot>>>(
      `/review-slots/by-period/${reviewPeriodId}`,
      { params: { ...params, pageSize: params?.pageSize ?? 100 } }
    ),

  getMyGroupSchedule: (reviewPeriodId: number) =>
    apiClient.get<ApiResponse<MyGroupScheduleDto>>(
      `/review-periods/${reviewPeriodId}/my-group-schedule`
    ),

  getMyGroupPreferences: (reviewPeriodId: number) =>
    apiClient.get<ApiResponse<unknown>>(`/review-periods/${reviewPeriodId}/group-preferences/my-group`),

  registerGroupPreferences: (reviewPeriodId: number, preferences: SlotPreferenceItem[]) =>
    apiClient.post<ApiResponse<null>>(`/review-periods/${reviewPeriodId}/group-preferences`, {
      preferences,
    }),

  updateGroupPreferences: (reviewPeriodId: number, preferences: SlotPreferenceItem[]) =>
    apiClient.put<ApiResponse<null>>(`/review-periods/${reviewPeriodId}/group-preferences`, {
      preferences,
    }),
}
