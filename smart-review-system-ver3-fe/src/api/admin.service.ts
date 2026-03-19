import { apiClient } from './client'
import type { ApiResponse, ImportResultDto } from '@/types/api'
import type {
  Semester,
  ReviewPeriod,
  ReviewSlot,
  Topic,
  Lecturer,
  LecturerSemesterLoad,
  Student,
  Group,
  UserDetail,
  SchedulingResult,
  CouncilDetail,
  Tag,
  ReviewSession,
} from '@/types/entities'

export const semesterService = {
  getAll: () => apiClient.get<ApiResponse<Semester[]>>('/Semesters'),
  getById: (id: number) => apiClient.get<ApiResponse<Semester>>(`/Semesters/${id}`),
  getActive: () => apiClient.get<ApiResponse<Semester>>('/Semesters/active'),
  create: (data: { code: string; name: string; startDate: string; endDate: string }) =>
    apiClient.post<ApiResponse<Semester>>('/Semesters', data),
  update: (id: number, data: { code: string; name: string; startDate: string; endDate: string }) =>
    apiClient.put<ApiResponse<Semester>>(`/Semesters/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/Semesters/${id}`),
  activate: (id: number, activate = true) =>
    apiClient.patch<ApiResponse<null>>(`/Semesters/${id}/activate`, null, {
      params: { activate },
    }),
}

export const reviewPeriodService = {
  getAll: (semesterId?: number) =>
    apiClient.get<ApiResponse<ReviewPeriod[]>>('/ReviewPeriods', { params: { semesterId } }),
  getById: (id: number) => apiClient.get<ApiResponse<ReviewPeriod>>(`/ReviewPeriods/${id}`),
  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse<ReviewPeriod>>('/ReviewPeriods', data),
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<ReviewPeriod>>(`/ReviewPeriods/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/ReviewPeriods/${id}`),
  transitionStatus: (id: number, targetStatus: number) =>
    apiClient.patch<ApiResponse<ReviewPeriod>>(`/ReviewPeriods/${id}/transition`, {
      targetStatus,
    }),
}

export const reviewSlotService = {
  getAll: (reviewPeriodId?: number) =>
    apiClient.get<ApiResponse<ReviewSlot[]>>('/ReviewSlots', { params: { reviewPeriodId } }),
  getById: (id: number) => apiClient.get<ApiResponse<ReviewSlot>>(`/ReviewSlots/${id}`),
  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse<ReviewSlot>>('/ReviewSlots', data),
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<ReviewSlot>>(`/ReviewSlots/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/ReviewSlots/${id}`),
  cancel: (id: number) => apiClient.post<ApiResponse<ReviewSlot>>(`/ReviewSlots/${id}/cancel`),
}

export const topicService = {
  getAll: (search?: string) =>
    apiClient.get<ApiResponse<Topic[]>>('/Topics', { params: { search } }),
  getById: (id: number) => apiClient.get<ApiResponse<Topic>>(`/Topics/${id}`),
  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse<Topic>>('/Topics', data),
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<Topic>>(`/Topics/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/Topics/${id}`),
  updateKeywords: (id: number, keywords: string[]) =>
    apiClient.put<ApiResponse<null>>(`/Topics/${id}/keywords`, { keywords }),
  assignTags: (id: number, keywords: string[]) =>
    apiClient.put<ApiResponse<null>>(`/Topics/${id}/keywords`, { keywords }),
}

export const groupService = {
  getAll: (search?: string) =>
    apiClient.get<ApiResponse<Group[]>>('/Groups', { params: { search } }),
  getById: (id: number) => apiClient.get<ApiResponse<Group>>(`/Groups/${id}`),
  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse<Group>>('/Groups', data),
  /** @deprecated BE chưa hỗ trợ - xem API_SUPPORT.groups.update */
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<Group>>(`/Groups/${id}`, data),
  /** @deprecated BE chưa hỗ trợ - xem API_SUPPORT.groups.delete */
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/Groups/${id}`),
}

export const lecturerService = {
  getAll: (search?: string, department?: string, page = 1, pageSize = 20) =>
    apiClient.get<ApiResponse<any>>('/Lecturers', {
      params: { search, department, page, pageSize },
    }),
  getById: (id: number) => apiClient.get<ApiResponse<Lecturer>>(`/Lecturers/${id}`),
  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse<Lecturer>>('/Lecturers', data),
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<Lecturer>>(`/Lecturers/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/Lecturers/${id}`),
  upsertExpertise: (id: number, keywords: string[]) =>
    apiClient.put<ApiResponse<null>>(`/Lecturers/${id}/expertises`, { keywords }),
  updateExpertises: (id: number, keywords: string[]) =>
    apiClient.put<ApiResponse<null>>(`/Lecturers/${id}/expertises`, { keywords }),
  batchUpdateWorkload: (lecturerIds: number[], minTopics: number, maxTopics: number) =>
    apiClient.put<ApiResponse<any>>('/Lecturers/batch-workload', {
      lecturerIds,
      minTopics,
      maxTopics,
    }),
  getSemesterLoads: (semesterId: number, onlyOverloaded?: boolean) =>
    apiClient.get<ApiResponse<LecturerSemesterLoad[]>>('/Lecturers/semester-loads', {
      params: { semesterId, onlyOverloaded },
    }),
  import: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<ApiResponse<ImportResultDto>>('/Lecturers/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const studentService = {
  getAll: (search?: string, page = 1, pageSize = 20) =>
    apiClient.get<ApiResponse<any>>('/Students', {
      params: { search, page, pageSize },
    }),
  getById: (id: number) => apiClient.get<ApiResponse<Student>>(`/Students/${id}`),
  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse<Student>>('/Students', data),
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<Student>>(`/Students/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/Students/${id}`),
  import: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<ApiResponse<ImportResultDto>>('/Students/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const userService = {
  getAll: (params?: {
    search?: string
    role?: string
    isLocked?: boolean
    sortBy?: string
    sortDesc?: boolean
    page?: number
    pageSize?: number
  }) =>
    apiClient.get<ApiResponse<any>>('/Users', { params }),
  getById: (id: number) => apiClient.get<ApiResponse<UserDetail>>(`/Users/${id}`),
}

export const councilService = {
  getBySlot: (reviewSlotId: number) =>
    apiClient.get<ApiResponse<CouncilDetail>>(`/Councils/by-slot/${reviewSlotId}`),
  assignChairman: (councilId: number, lecturerId: number) =>
    apiClient.post<ApiResponse<null>>(`/Councils/${councilId}/assign-chairman`, { lecturerId }),
}

export const schedulingService = {
  run: (reviewPeriodId: number) =>
    apiClient.post<ApiResponse<SchedulingResult>>(`/Scheduling/run/${reviewPeriodId}`),
  getResult: (reviewPeriodId: number) =>
    apiClient.get<ApiResponse<SchedulingResult>>(`/Scheduling/result/${reviewPeriodId}`),
  updateWeights: (data: {
    w1: number
    w2: number
    w3: number
    w4: number
    w5: number
    w6: number
  }) => apiClient.put<ApiResponse<null>>('/Scheduling/weights', data),
  manualOverride: (data: {
    reviewSlotId: number
    removeLecturerId?: number
    addLecturerId?: number
    swapFromLecturerId?: number
    swapToLecturerId?: number
  }) => apiClient.post<ApiResponse<null>>('/Scheduling/manual-override', data),
}

export const dashboardService = {
  getAdminDashboard: () => apiClient.get<ApiResponse<any>>('/Dashboard/admin'),
}

export const tagService = {
  getAll: (isActive?: boolean) =>
    apiClient.get<ApiResponse<Tag[]>>('/Tags', { params: { isActive } }),
  getById: (id: number) => apiClient.get<ApiResponse<Tag>>(`/Tags/${id}`),
  create: (data: { name: string; description?: string }) =>
    apiClient.post<ApiResponse<Tag>>('/Tags', data),
  update: (id: number, data: { id: number; name: string; description?: string }) =>
    apiClient.put<ApiResponse<Tag>>(`/Tags/${id}`, { ...data, id }),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/Tags/${id}`),
}

export const reviewSessionService = {
  getAll: (params?: {
    reviewPeriodId?: number
    groupId?: number
    slotId?: number
    registrationStatus?: number
  }) => apiClient.get<ApiResponse<ReviewSession[]>>('/ReviewSessions', { params }),
  getById: (id: number) => apiClient.get<ApiResponse<ReviewSession>>(`/ReviewSessions/${id}`),
  getScheduled: (reviewPeriodId: number) =>
    apiClient.get<ApiResponse<ReviewSession[]>>(
      `/ReviewSessions/scheduled/${reviewPeriodId}`
    ),
  approve: (id: number) =>
    apiClient.post<ApiResponse<ReviewSession>>(`/ReviewSessions/${id}/approve`),
  reject: (id: number, reason: string) =>
    apiClient.post<ApiResponse<ReviewSession>>(`/ReviewSessions/${id}/reject`, { id, reason }),
  lock: (id: number) =>
    apiClient.post<ApiResponse<ReviewSession>>(`/ReviewSessions/${id}/lock`),
  updateStatus: (id: number, status: number) =>
    apiClient.put<ApiResponse<ReviewSession>>(`/ReviewSessions/${id}/status`, { id, status }),
}
