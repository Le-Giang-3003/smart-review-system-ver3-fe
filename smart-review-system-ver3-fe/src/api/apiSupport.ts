/**
 * Bảng đối chiếu endpoint FE vs BE (Smart Review System v3).
 */
export const API_SUPPORT = {
  auth: {
    login: true,
    getMe: true,
    changePassword: true,
    requestPasswordReset: false,
  },

  semesters: {
    getAll: true,
    getById: true,
    getActive: true,
    create: true,
    update: true,
    delete: true,
    activate: true,
    importLecturers: true,
    importCapstone: true,
    exportExcel: true,
  },

  reviewPeriods: {
    getBySemester: true,
    getById: true,
    create: true,
    update: true,
    transitionStatus: true,
  },

  reviewSlots: {
    getByPeriod: true,
    getById: true,
    create: true,
    createBatch: true,
    update: true,
    delete: true,
  },

  topics: {
    getAll: true,
    getById: true,
  },

  groups: {
    getAll: true,
    getById: true,
  },

  lecturers: {
    getAll: true,
    getById: true,
    create: true,
    update: true,
    delete: true,
    batchUpdateWorkload: true,
    getSemesterLoads: true,
    import: true,
  },

  students: {
    getAll: true,
    getById: true,
    create: true,
    update: true,
    delete: true,
    import: true,
  },

  users: {
    getAll: true,
    getById: true,
  },

  councils: {
    getForReviewPeriod: true,
    getDetail: true,
  },

  scheduling: {
    run: true,
    getResult: true,
  },

  dashboard: {
    getAdminDashboard: true,
  },

  reviewAssignments: {
    getById: true,
    updateComment: true,
    getByCouncil: true,
  },

  slotPreferences: {
    lecturerRegister: true,
    lecturerUpdate: true,
    groupRegister: true,
    groupUpdate: true,
  },

  checklists: {
    any: false,
  },

  tags: {
    any: false,
  },

  reviewSessions: {
    any: false,
  },

  studentApi: {
    getDashboard: true,
    getTopics: true,
    getSlotsForPeriod: true,
    getMyGroupSchedule: true,
    registerGroupPreferences: true,
  },

  lecturerApi: {
    getDashboard: true,
    getMySchedule: true,
    getSlotsForPeriod: true,
    registerLecturerPreferences: true,
  },

  feedbacks: {
    /** Thay bằng review-assignments + comment */
    legacy: false,
  },
} as const

export const UNSUPPORTED_KEYS = ['topics.create', 'groups.create', 'auth.refresh'] as const

export function isEndpointSupported(
  service: keyof typeof API_SUPPORT,
  method: string
): boolean {
  const svc = API_SUPPORT[service] as Record<string, boolean> | undefined
  if (!svc) return false
  return svc[method] === true
}
