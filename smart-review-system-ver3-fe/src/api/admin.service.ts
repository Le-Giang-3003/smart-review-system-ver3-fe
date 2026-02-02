import { apiClient } from './client'
import type { ApiResponse } from '@/types/api'
import type {
  Semester,
  ReviewPeriod,
  ReviewSlot,
  Topic,
  Tag,
  Lecturer,
  LecturerCompatibility,
  LecturerSemesterLoad,
  ReviewSession,
  ScheduleResult,
} from '@/types/entities'

// Semesters
export const semesterService = {
  getAll: () => apiClient.get<ApiResponse<Semester[]>>('/semesters'),
  getById: (id: number) => apiClient.get<ApiResponse<Semester>>(`/semesters/${id}`),
  getActive: () => apiClient.get<ApiResponse<Semester>>('/semesters/active'),
  create: (data: { name: string; academicYear: string; semesterNumber: number; startDate: string; endDate: string; description?: string }) =>
    apiClient.post<ApiResponse<Semester>>('/semesters', data),
  update: (id: number, data: { id: number; name: string; academicYear: string; semesterNumber: number; startDate: string; endDate: string; description?: string }) =>
    apiClient.put<ApiResponse<Semester>>(`/semesters/${id}`, { ...data, id }),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/semesters/${id}`),
  activate: (id: number) => apiClient.post<ApiResponse<Semester>>(`/semesters/${id}/activate`),
}

// Review Periods
export const reviewPeriodService = {
  getAll: (semesterId?: number) =>
    apiClient.get<ApiResponse<ReviewPeriod[]>>('/review-periods', { params: { semesterId } }),
  getById: (id: number) => apiClient.get<ApiResponse<ReviewPeriod>>(`/review-periods/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse<ReviewPeriod>>('/review-periods', data),
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<ReviewPeriod>>(`/review-periods/${id}`, { ...data, id }),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/review-periods/${id}`),
  open: (id: number) => apiClient.post<ApiResponse<ReviewPeriod>>(`/review-periods/${id}/open`),
  close: (id: number) => apiClient.post<ApiResponse<ReviewPeriod>>(`/review-periods/${id}/close`),
}

// Review Slots
export const reviewSlotService = {
  getAll: (reviewPeriodId?: number) =>
    apiClient.get<ApiResponse<ReviewSlot[]>>('/review-slots', { params: { reviewPeriodId } }),
  getById: (id: number) => apiClient.get<ApiResponse<ReviewSlot>>(`/review-slots/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse<ReviewSlot>>('/review-slots', data),
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<ReviewSlot>>(`/review-slots/${id}`, { ...data, id }),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/review-slots/${id}`),
  cancel: (id: number) => apiClient.post<ApiResponse<ReviewSlot>>(`/review-slots/${id}/cancel`),
}

// Topics
export const topicService = {
  getAll: (level?: number, isActive?: boolean) =>
    apiClient.get<ApiResponse<Topic[]>>('/topics', { params: { level, isActive } }),
  getById: (id: number) => apiClient.get<ApiResponse<Topic>>(`/topics/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse<Topic>>('/topics', data),
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<Topic>>(`/topics/${id}`, { ...data, id }),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/topics/${id}`),
  assignTags: (id: number, tagIds: number[]) =>
    apiClient.post<ApiResponse<Topic>>(`/topics/${id}/assign-tags`, { topicId: id, tagIds }),
}

// Tags
export const tagService = {
  getAll: (isActive?: boolean) => apiClient.get<ApiResponse<Tag[]>>('/tags', { params: { isActive } }),
  getById: (id: number) => apiClient.get<ApiResponse<Tag>>(`/tags/${id}`),
  create: (data: { name: string; description?: string }) => apiClient.post<ApiResponse<Tag>>('/tags', data),
  update: (id: number, data: { id: number; name: string; description?: string }) =>
    apiClient.put<ApiResponse<Tag>>(`/tags/${id}`, { ...data, id }),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/tags/${id}`),
}

// Lecturers
export const lecturerService = {
  getAll: (isActive?: boolean) =>
    apiClient.get<ApiResponse<Lecturer[]>>('/lecturers', { params: { isActive } }),
  getById: (id: number) => apiClient.get<ApiResponse<Lecturer>>(`/lecturers/${id}`),
  assignTag: (id: number, tagId: number) =>
    apiClient.post<ApiResponse<Lecturer>>(`/lecturers/${id}/tags`, { lecturerId: id, tagId }),
  removeTag: (lecturerId: number, tagId: number) =>
    apiClient.delete<ApiResponse<null>>(`/lecturers/${lecturerId}/tags/${tagId}`),
  updateLoad: (id: number, data: { lecturerId: number; semesterId: number; maxLoad: number }) =>
    apiClient.put<ApiResponse<Lecturer>>(`/lecturers/${id}/load`, { ...data, lecturerId: id }),
  getSemesterLoads: (semesterId: number, onlyOverloaded?: boolean) =>
    apiClient.get<ApiResponse<LecturerSemesterLoad[]>>('/lecturers/semester-loads', {
      params: { semesterId, onlyOverloaded },
    }),
  getCompatibilities: (type?: number) =>
    apiClient.get<ApiResponse<LecturerCompatibility[]>>('/lecturers/compatibilities', { params: { type } }),
  createCompatibility: (data: { lecturerAId: number; lecturerBId: number; compatibilityType: number; reason?: string }) =>
    apiClient.post<ApiResponse<LecturerCompatibility>>('/lecturers/compatibilities', data),
  updateCompatibility: (id: number, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<LecturerCompatibility>>(`/lecturers/compatibilities/${id}`, { ...data, id }),
  deleteCompatibility: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/lecturers/compatibilities/${id}`),
}

// Review Sessions
export const reviewSessionService = {
  getAll: (params?: { reviewPeriodId?: number; groupId?: number; slotId?: number; registrationStatus?: number }) =>
    apiClient.get<ApiResponse<ReviewSession[]>>('/review-sessions', { params }),
  getById: (id: number) => apiClient.get<ApiResponse<ReviewSession>>(`/review-sessions/${id}`),
  getScheduled: (reviewPeriodId: number) =>
    apiClient.get<ApiResponse<ReviewSession[]>>(`/review-sessions/scheduled/${reviewPeriodId}`),
  approve: (id: number) => apiClient.post<ApiResponse<ReviewSession>>(`/review-sessions/${id}/approve`),
  reject: (id: number, reason: string) =>
    apiClient.post<ApiResponse<ReviewSession>>(`/review-sessions/${id}/reject`, { id, reason }),
  lock: (id: number) => apiClient.post<ApiResponse<ReviewSession>>(`/review-sessions/${id}/lock`),
  updateStatus: (id: number, status: number) =>
    apiClient.put<ApiResponse<ReviewSession>>(`/review-sessions/${id}/status`, { id, status }),
}

// Scheduling
export const schedulingService = {
  generate: (reviewPeriodId: number, forceRegenerate = false) =>
    apiClient.post<ApiResponse<ScheduleResult>>('/scheduling/generate', { reviewPeriodId, forceRegenerate }),
  approve: (reviewPeriodId: number) =>
    apiClient.post<ApiResponse<null>>(`/scheduling/${reviewPeriodId}/approve`),
  reject: (reviewPeriodId: number, reason: string) =>
    apiClient.post<ApiResponse<null>>(`/scheduling/${reviewPeriodId}/reject`, { reason }),
  regenerateSlot: (slotId: number, reason?: string) =>
    apiClient.post<ApiResponse<ScheduleResult>>(`/scheduling/slots/${slotId}/regenerate`, { slotId, reason }),
  regenerateGroup: (groupId: number, reason?: string) =>
    apiClient.post<ApiResponse<ScheduleResult>>(`/scheduling/groups/${groupId}/regenerate`, { groupId, reason }),
}
