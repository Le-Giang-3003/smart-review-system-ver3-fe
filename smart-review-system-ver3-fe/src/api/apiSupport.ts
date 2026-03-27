/**
 * Bảng đối chiếu endpoint FE vs BE.
 * Dùng để khóa UI/action tương ứng khi BE chưa hỗ trợ.
 *
 * Cập nhật: Rà soát theo BE trong smart-review-system-ver3-be
 */
export const API_SUPPORT = {
  // ── auth.service ──
  auth: {
    login: true,
    logout: true,
    refreshToken: true,
    getMe: true,
    changePassword: true,
    requestPasswordReset: true,
    confirmPasswordReset: true,
    createAccount: true,
    lockUnlockAccount: true,
  },

  // ── admin.service: semesterService ──
  semesters: {
    getAll: true,
    getById: true,
    getActive: true,
    create: true,
    update: true,
    delete: true,
    activate: true,
  },

  // ── admin.service: reviewPeriodService ──
  reviewPeriods: {
    getAll: true,
    getById: true,
    create: true,
    update: true,
    delete: true,
    transitionStatus: true,
  },

  // ── admin.service: reviewSlotService ──
  reviewSlots: {
    getAll: true,
    getById: true,
    create: true,
    update: true,
    delete: true,
    cancel: true,
  },

  // ── admin.service: topicService ──
  topics: {
    getAll: true,
    getById: true,
    create: true,
    update: true,
    delete: true,
    updateKeywords: true,
    assignTags: true, // trỏ cùng endpoint updateKeywords
  },

  // ── admin.service: groupService ──
  groups: {
    getAll: true,
    getById: true,
    create: true,
    /** BE không có PUT /Groups/{id} */
    update: false,
    /** BE không có DELETE /Groups/{id} */
    delete: false,
  },

  // ── admin.service: lecturerService ──
  lecturers: {
    getAll: true,
    getById: true,
    create: true,
    update: true,
    delete: true,
    upsertExpertise: true,
    updateExpertises: true,
    batchUpdateWorkload: true,
    getSemesterLoads: true,
    import: true,
    upsertCompatibility: true,
  },

  // ── admin.service: checklistService ──
  checklists: {
    getByPeriod: true,
    create: true,
    addItem: true,
    updateItem: true,
    deleteItem: true,
  },

  // ── admin.service: studentService ──
  students: {
    getAll: true,
    getById: true,
    create: true,
    update: true,
    delete: true,
    import: true,
  },

  // ── admin.service: userService ──
  users: {
    getAll: true,
    getById: true,
  },

  // ── admin.service: councilService ──
  councils: {
    getBySlot: true,
    assignChairman: true,
  },

  // ── admin.service: schedulingService ──
  scheduling: {
    run: true,
    getResult: true,
    updateWeights: true,
    manualOverride: true,
    reset: true,
  },

  // ── admin.service: dashboardService ──
  dashboard: {
    getAdminDashboard: true,
  },

  // ── admin.service: tagService ──
  tags: {
    getAll: true,
    getById: true,
    create: true,
    update: true,
    delete: true,
  },

  // ── admin.service: reviewSessionService ──
  reviewSessions: {
    getAll: true,
    getById: true,
    getScheduled: true,
    approve: true,
    reject: true,
    lock: true,
    updateStatus: true,
  },

  // ── student.service ──
  studentApi: {
    getDashboard: true,
    getMyGroup: true,
    createGroup: true,
    inviteStudent: true,
    respondToInvitation: true,
    markGroupReady: true,
    getTopics: true,
    registerTopicForGroup: true,
    registerExistingTopicForGroup: true,
    getAvailableSlots: true,
    registerForSlot: true,
    unregisterFromSlot: true,
  },

  // ── lecturer.service ──
  lecturerApi: {
    getDashboard: true,
    getAvailableSlots: true,
    registerForSlot: true,
    unregisterFromSlot: true,
  },

  // ── lecturer.service: feedbackService ──
  feedbacks: {
    getMySessions: true,
    create: true,
    getById: true,
    updateDetails: true,
    updateComment: true,
    submit: true,
    getBySession: true,
    getGroupHistory: true,
  },
} as const

/** Endpoint BE chưa hỗ trợ – dùng để khóa UI */
export const UNSUPPORTED_KEYS = [
  'groups.update',
  'groups.delete',
] as const

export function isEndpointSupported(
  service: keyof typeof API_SUPPORT,
  method: string
): boolean {
  const svc = API_SUPPORT[service] as Record<string, boolean> | undefined
  if (!svc) return false
  return svc[method] === true
}
