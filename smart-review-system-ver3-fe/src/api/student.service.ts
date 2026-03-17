import { apiClient } from './client'
import type { ApiResponse } from '@/types/api'
import type {
  StudentDashboardDto,
  Group,
  Topic,
  ReviewSlot,
} from '@/types/entities'

export const studentApiService = {
  getDashboard: () =>
    apiClient.get<ApiResponse<StudentDashboardDto>>('/Dashboard/student'),

  // Groups
  getMyGroup: () =>
    apiClient.get<ApiResponse<Group[]>>('/Groups'),

  createGroup: (groupName: string) =>
    apiClient.post<ApiResponse<Group>>('/Groups', { groupName }),

  inviteStudent: (groupId: number, studentId: number) =>
    apiClient.post<ApiResponse<null>>(`/Groups/${groupId}/invite`, { studentId }),

  respondToInvitation: (invitationId: number, accept: boolean) =>
    apiClient.post<ApiResponse<null>>(`/Groups/invitations/${invitationId}/respond`, {
      accept,
    }),

  markGroupReady: (groupId: number) =>
    apiClient.post<ApiResponse<null>>(`/Groups/${groupId}/ready`),

  // Topics
  getTopics: (search?: string) =>
    apiClient.get<ApiResponse<Topic[]>>('/Topics', { params: { search } }),

  registerTopicForGroup: (data: {
    groupId: number
    title: string
    description?: string
    supervisorId: number
  }) => apiClient.post<ApiResponse<null>>('/Topics/register-for-group', data),

  registerExistingTopicForGroup: (topicId: number, groupId: number) =>
    apiClient.post<ApiResponse<null>>(`/Topics/${topicId}/register-group`, { groupId }),

  // Review Slots
  getAvailableSlots: (reviewPeriodId: number) =>
    apiClient.get<ApiResponse<ReviewSlot[]>>('/ReviewSlots', {
      params: { reviewPeriodId },
    }),

  registerForSlot: (slotId: number) =>
    apiClient.post<ApiResponse<null>>(`/ReviewSlots/${slotId}/register-group`),

  unregisterFromSlot: (slotId: number) =>
    apiClient.delete<ApiResponse<null>>(`/ReviewSlots/${slotId}/unregister-group`),
}
