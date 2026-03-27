import { apiClient } from './client'
import type { ApiResponse } from '@/types/api'
import type {
  LecturerDashboardDto,
  ReviewSlot,
  MyReviewSessionDto,
  FeedbackDto,
  UpdateDetailItem,
  GroupFeedbackHistoryDto,
} from '@/types/entities'

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

export const feedbackService = {
  getMySessions: () =>
    apiClient.get<ApiResponse<MyReviewSessionDto[]>>('/review-feedbacks/my-sessions'),
  create: (reviewSessionId: number) =>
    apiClient.post<ApiResponse<FeedbackDto>>('/review-feedbacks', { reviewSessionId }),
  getById: (id: number) =>
    apiClient.get<ApiResponse<FeedbackDto>>(`/review-feedbacks/${id}`),
  updateDetails: (id: number, details: UpdateDetailItem[]) =>
    apiClient.put<ApiResponse<unknown>>(`/review-feedbacks/${id}/details`, { details }),
  updateComment: (id: number, data: { overallComment?: string; suggestion?: number }) =>
    apiClient.put<ApiResponse<unknown>>(`/review-feedbacks/${id}/comment`, data),
  submit: (id: number) =>
    apiClient.post<ApiResponse<unknown>>(`/review-feedbacks/${id}/submit`),
  getBySession: (sessionId: number) =>
    apiClient.get<ApiResponse<FeedbackDto[]>>(`/review-feedbacks/by-session/${sessionId}`),
  getGroupHistory: (groupId: number) =>
    apiClient.get<ApiResponse<GroupFeedbackHistoryDto>>(
      `/review-feedbacks/group-history/${groupId}`
    ),
}
