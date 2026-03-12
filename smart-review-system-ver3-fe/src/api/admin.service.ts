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
  SchedulingResult,
  Student,
  Group
} from '@/types/entities'

// Semesters
export const semesterService = {
  getAll: () => apiClient.get<ApiResponse<Semester[]>>('/Semesters'),
  getById: (id: number) => apiClient.get<ApiResponse<Semester>>(`/Semesters/${id}`),
  getActive: () => apiClient.get<ApiResponse<Semester>>('/Semesters/active'),
  create: (data: { code: string; name: string; startDate: string; endDate: string; }) =>
    apiClient.post<ApiResponse<Semester>>('/Semesters', data),
  update: (id: number, data: { code: string; name: string; startDate: string; endDate: string; }) =>
    apiClient.put<ApiResponse<Semester>>(`/Semesters/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/Semesters/${id}`),
  activate: (id: number) => apiClient.post<ApiResponse<Semester>>(`/Semesters/${id}/activate`),
}

// Review Periods
export const reviewPeriodService = {
  getAll: (semesterId?: number) =>
    apiClient.get<ApiResponse<ReviewPeriod[]>>('/ReviewPeriods', { params: { semesterId } }),
  getById: (id: number) => apiClient.get<ApiResponse<ReviewPeriod>>(`/ReviewPeriods/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse<ReviewPeriod>>('/ReviewPeriods', data),
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<ReviewPeriod>>(`/ReviewPeriods/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/ReviewPeriods/${id}`),
  open: (id: number) => apiClient.post<ApiResponse<ReviewPeriod>>(`/ReviewPeriods/${id}/open`),
  close: (id: number) => apiClient.post<ApiResponse<ReviewPeriod>>(`/ReviewPeriods/${id}/close`),
}

// Review Slots
export const reviewSlotService = {
  getAll: (reviewPeriodId?: number) =>
    apiClient.get<ApiResponse<ReviewSlot[]>>('/ReviewSlots', { params: { reviewPeriodId } }),
  getById: (id: number) => apiClient.get<ApiResponse<ReviewSlot>>(`/ReviewSlots/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse<ReviewSlot>>('/ReviewSlots', data),
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<ReviewSlot>>(`/ReviewSlots/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/ReviewSlots/${id}`),
  cancel: (id: number) => apiClient.post<ApiResponse<ReviewSlot>>(`/ReviewSlots/${id}/cancel`),
}

// Topics
export const topicService = {
  getAll: (level?: number, isActive?: boolean) =>
    apiClient.get<ApiResponse<Topic[]>>('/Topics', { params: { level, isActive } }),
  getById: (id: number) => apiClient.get<ApiResponse<Topic>>(`/Topics/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse<Topic>>('/Topics', data),
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<Topic>>(`/Topics/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/Topics/${id}`),
  assignTags: (id: number, keywords: string[]) =>
    apiClient.put<ApiResponse<Topic>>(`/Topics/${id}/expertises`, { keywords }),
}

// Groups
export const groupService = {
  getAll: () => apiClient.get<ApiResponse<Group[]>>('/Groups'),
  getById: (id: number) => apiClient.get<ApiResponse<Group>>(`/Groups/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse<Group>>('/Groups', data),
  update: (id: number, data: Record<string, unknown>) => apiClient.put<ApiResponse<Group>>(`/Groups/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/Groups/${id}`)
}

// Tags - Still maintaining for backwards compat if needed, map to /Tags
export const tagService = {
  getAll: (isActive?: boolean) => apiClient.get<ApiResponse<Tag[]>>('/Tags', { params: { isActive } }),
  getById: (id: number) => apiClient.get<ApiResponse<Tag>>(`/Tags/${id}`),
  create: (data: { name: string; description?: string }) => apiClient.post<ApiResponse<Tag>>('/Tags', data),
  update: (id: number, data: { id: number; name: string; description?: string }) =>
    apiClient.put<ApiResponse<Tag>>(`/Tags/${id}`, { ...data, id }),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/Tags/${id}`),
}

// Lecturers
export const lecturerService = {
  getAll: (search?: string, department?: string, page = 1, pageSize = 20) =>
    apiClient.get<ApiResponse<any>>('/Lecturers', { params: { search, department, page, pageSize } }),
  getById: (id: number) => apiClient.get<ApiResponse<Lecturer>>(`/Lecturers/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse<Lecturer>>('/Lecturers', data),
  update: (id: number, data: Record<string, unknown>) => apiClient.put<ApiResponse<Lecturer>>(`/Lecturers/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/Lecturers/${id}`),
  upsertExpertise: (id: number, keywords: string[]) =>
    apiClient.put<ApiResponse<Lecturer>>(`/Lecturers/${id}/expertises`, { keywords }),
  batchUpdateWorkload: (lecturerIds: number[], minTopics: number, maxTopics: number) =>
    apiClient.put<ApiResponse<any>>(`/Lecturers/batch-workload`, { lecturerIds, minTopics, maxTopics }),
  getSemesterLoads: (semesterId: number, onlyOverloaded?: boolean) =>
    apiClient.get<ApiResponse<LecturerSemesterLoad[]>>('/Lecturers/semester-loads', {
      params: { semesterId, onlyOverloaded },
    }),
  getCompatibilities: (type?: number) =>
    apiClient.get<ApiResponse<LecturerCompatibility[]>>('/Lecturers/compatibilities', { params: { type } }),
  createCompatibility: (data: { lecturerAId: number; lecturerBId: number; level: string }) =>
    apiClient.put<ApiResponse<LecturerCompatibility>>('/Lecturers/compatibility', data),
  deleteCompatibility: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/Lecturers/compatibilities/${id}`),
  import: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<ApiResponse<any>>('/Lecturers/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// Students
export const studentService = {
  getAll: (search?: string, page = 1, pageSize = 20) =>
    apiClient.get<ApiResponse<any>>('/Students', { params: { search, page, pageSize } }),
  getById: (id: number) => apiClient.get<ApiResponse<Student>>(`/Students/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse<Student>>('/Students', data),
  update: (id: number, data: Record<string, unknown>) => apiClient.put<ApiResponse<Student>>(`/Students/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/Students/${id}`),
  import: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<ApiResponse<any>>('/Students/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}


// Review Sessions
export const reviewSessionService = {
  getAll: (params?: { reviewPeriodId?: number; groupId?: number; slotId?: number; registrationStatus?: number }) =>
    apiClient.get<ApiResponse<ReviewSession[]>>('/ReviewSessions', { params }),
  getById: (id: number) => apiClient.get<ApiResponse<ReviewSession>>(`/ReviewSessions/${id}`),
  getScheduled: (reviewPeriodId: number) =>
    apiClient.get<ApiResponse<ReviewSession[]>>(`/ReviewSessions/scheduled/${reviewPeriodId}`),
  approve: (id: number) => apiClient.post<ApiResponse<ReviewSession>>(`/ReviewSessions/${id}/approve`),
  reject: (id: number, reason: string) =>
    apiClient.post<ApiResponse<ReviewSession>>(`/ReviewSessions/${id}/reject`, { id, reason }),
  lock: (id: number) => apiClient.post<ApiResponse<ReviewSession>>(`/ReviewSessions/${id}/lock`),
  updateStatus: (id: number, status: number) =>
    apiClient.put<ApiResponse<ReviewSession>>(`/ReviewSessions/${id}/status`, { id, status }),
}

// Scheduling
export const schedulingService = {
  run: (reviewPeriodId: number) =>
    apiClient.post<ApiResponse<SchedulingResult>>(`/Scheduling/run/${reviewPeriodId}`),
  getResult: (reviewPeriodId: number) =>
    apiClient.get<ApiResponse<SchedulingResult>>(`/Scheduling/result/${reviewPeriodId}`),
  updateWeights: (data: { w1: number, w2: number, w3: number, w4: number, w5: number, w6: number }) =>
    apiClient.put<ApiResponse<null>>('/Scheduling/weights', data),
  manualOverride: (data: { reviewSlotId: number, removeLecturerId?: number, addLecturerId?: number, swapFromLecturerId?: number, swapToLecturerId?: number }) =>
    apiClient.post<ApiResponse<null>>('/Scheduling/manual-override', data)
}

// Dashboard
export const dashboardService = {
  getAdminDashboard: () => apiClient.get<ApiResponse<any>>('/Dashboard/admin'),
}
