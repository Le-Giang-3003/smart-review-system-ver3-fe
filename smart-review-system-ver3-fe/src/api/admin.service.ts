import { apiClient } from './client'
import type { ApiResponse, ImportResultDto, LecturerStudentImportResultDto, PagedResult } from '@/types/api'
import type {
  Semester,
  ReviewPeriod,
  ReviewPeriodDetailDto,
  ReviewSlot,
  TopicListItem,
  Lecturer,
  LecturerSemesterLoad,
  Student,
  UserDetail,
  AdminDashboardDto,
  CouncilListItem,
  SchedulingResultDto,
  ResetSchedulingResultDto,
  ReviewAssignmentDto,
  GroupListItem,
  GroupDetail,
} from '@/types/entities'

export const semesterService = {
  getAll: () => apiClient.get<ApiResponse<Semester[]>>('/semesters'),
  getById: (id: number) => apiClient.get<ApiResponse<Semester>>(`/semesters/${id}`),
  getActive: () => apiClient.get<ApiResponse<Semester>>('/semesters/active'),
  create: (data: { code: string; name: string; startDate: string; endDate: string }) =>
    apiClient.post<ApiResponse<Semester>>('/semesters', data),
  update: (id: number, data: { code: string; name: string; startDate: string; endDate: string }) =>
    apiClient.put<ApiResponse<Semester>>(`/semesters/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/semesters/${id}`),
  activate: (id: number, activate = true) =>
    apiClient.patch<ApiResponse<null>>(`/semesters/${id}/activate`, null, {
      params: { activate },
    }),
  importLecturers: (semesterId: number, file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return apiClient.post<ApiResponse<ImportResultDto>>(`/semesters/${semesterId}/import-lecturers`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  importCapstone: (semesterId: number, file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return apiClient.post<ApiResponse<ImportResultDto>>(`/semesters/${semesterId}/import`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  exportExcel: (semesterId: number) =>
    apiClient.get<Blob>(`/semesters/${semesterId}/export`, { responseType: 'blob' }),
}

export const reviewPeriodService = {
  getBySemester: (
    semesterId: number,
    params?: { search?: string; pageNumber?: number; pageSize?: number }
  ) => apiClient.get<ApiResponse<PagedResult<ReviewPeriod>>>(`/review-periods/by-semester/${semesterId}`, { params }),
  getById: (id: number) =>
    apiClient.get<ApiResponse<ReviewPeriodDetailDto>>(`/review-periods/${id}`),
  create: (data: {
    semesterId: number
    name: string
    order: number
    startDate: string
    endDate: string
  }) => apiClient.post<ApiResponse<ReviewPeriod>>('/review-periods', data),
  update: (id: number, data: { id: number; name: string; startDate: string; endDate: string }) =>
    apiClient.put<ApiResponse<ReviewPeriod>>(`/review-periods/${id}`, data),
  transitionStatus: (id: number, targetStatus: string) =>
    apiClient.patch<ApiResponse<null>>(`/review-periods/${id}/status`, { targetStatus }),
}

export const reviewSlotService = {
  getByPeriod: (
    reviewPeriodId: number,
    params?: {
      filterDate?: string
      sortBy?: string
      sortOrder?: string
      pageNumber?: number
      pageSize?: number
    }
  ) =>
    apiClient.get<ApiResponse<PagedResult<ReviewSlot>>>(`/review-slots/by-period/${reviewPeriodId}`, { params }),
  getById: (id: number) => apiClient.get<ApiResponse<ReviewSlot>>(`/review-slots/${id}`),
  create: (data: {
    reviewPeriodId: number
    date: string
    startTime: string
    endTime: string
    room?: string
    maxGroups?: number
  }) => apiClient.post<ApiResponse<ReviewSlot>>('/review-slots', data),
  createBatch: (data: { reviewPeriodId: number; slots: Array<Record<string, unknown>> }) =>
    apiClient.post<ApiResponse<unknown>>('/review-slots/batch', data),
  update: (
    id: number,
    data: { id: number; date: string; startTime: string; endTime: string; room?: string; maxGroups: number }
  ) => apiClient.put<ApiResponse<ReviewSlot>>(`/review-slots/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/review-slots/${id}`),
}

export const topicService = {
  getAll: (params?: {
    search?: string
    sortBy?: string
    sortOrder?: string
    pageNumber?: number
    pageSize?: number
  }) => apiClient.get<ApiResponse<PagedResult<TopicListItem>>>('/topics', { params }),
  getById: (id: number) => apiClient.get<ApiResponse<unknown>>(`/topics/${id}`),
}

export const groupService = {
  getAll: (params?: {
    search?: string
    semesterId?: number
    sortBy?: string
    sortOrder?: string
    pageNumber?: number
    pageSize?: number
  }) => apiClient.get<ApiResponse<PagedResult<GroupListItem>>>('/groups', { params }),
  getById: (id: number) => apiClient.get<ApiResponse<GroupDetail>>(`/groups/${id}`),
}

export const lecturerService = {
  getAll: (search?: string, department?: string, page = 1, pageSize = 20) =>
    apiClient.get<ApiResponse<PagedResult<Lecturer>>>('/lecturers', {
      params: { search, department, page, pageSize },
    }),
  getById: (id: number) => apiClient.get<ApiResponse<Lecturer>>(`/lecturers/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse<Lecturer>>('/lecturers', data),
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<Lecturer>>(`/lecturers/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/lecturers/${id}`),
  batchUpdateWorkload: (lecturerIds: number[], minTopics: number, maxTopics: number) =>
    apiClient.put<ApiResponse<unknown>>('/lecturers/batch-workload', {
      lecturerIds,
      minTopics,
      maxTopics,
    }),
  getSemesterLoads: (semesterId: number, onlyOverloaded?: boolean) =>
    apiClient.get<ApiResponse<LecturerSemesterLoad[]>>('/lecturers/semester-loads', {
      params: { semesterId, onlyOverloaded },
    }),
  import: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<ApiResponse<LecturerStudentImportResultDto>>('/lecturers/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const studentService = {
  getAll: (search?: string, page = 1, pageSize = 20) =>
    apiClient.get<ApiResponse<PagedResult<Student>>>('/students', {
      params: { search, page, pageSize },
    }),
  getById: (id: number) => apiClient.get<ApiResponse<Student>>(`/students/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse<Student>>('/students', data),
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<Student>>(`/students/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/students/${id}`),
  import: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<ApiResponse<LecturerStudentImportResultDto>>('/students/import', formData, {
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
  }) => apiClient.get<ApiResponse<unknown>>('/users', { params }),
  getById: (id: number) => apiClient.get<ApiResponse<UserDetail>>(`/users/${id}`),
}

export const councilService = {
  getForReviewPeriod: (
    reviewPeriodId: number,
    params?: { filterDate?: string; pageNumber?: number; pageSize?: number }
  ) =>
    apiClient.get<ApiResponse<PagedResult<CouncilListItem>>>(`/review-periods/${reviewPeriodId}/councils`, {
      params,
    }),
  getDetail: (councilId: number) =>
    apiClient.get<ApiResponse<unknown>>(`/councils/${councilId}`),
}

export const schedulingService = {
  run: (reviewPeriodId: number) =>
    apiClient.post<ApiResponse<unknown>>(`/scheduling/review-periods/${reviewPeriodId}/run`),
  getResult: (reviewPeriodId: number) =>
    apiClient.get<ApiResponse<SchedulingResultDto>>(`/scheduling/review-periods/${reviewPeriodId}/result`),
  reset: (reviewPeriodId: number) =>
    apiClient.post<ApiResponse<ResetSchedulingResultDto>>(
      `/scheduling/review-periods/${reviewPeriodId}/reset`
    ),
}

export const dashboardService = {
  getAdminDashboard: () => apiClient.get<ApiResponse<AdminDashboardDto>>('/dashboard/admin'),
}

export const reviewAssignmentService = {
  getById: (id: number) =>
    apiClient.get<ApiResponse<ReviewAssignmentDto>>(`/review-assignments/${id}`),
  updateComment: (id: number, comment: string) =>
    apiClient.put<ApiResponse<null>>(`/review-assignments/${id}/comment`, { comment }),
  getByCouncil: (councilId: number) =>
    apiClient.get<ApiResponse<ReviewAssignmentDto[]>>(`/councils/${councilId}/assignments`),
}
