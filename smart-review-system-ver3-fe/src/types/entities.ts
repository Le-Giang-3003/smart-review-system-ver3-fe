export enum CompatibilityLevel {
  Normal = 'Normal',
  Preferred = 'Preferred',
  StrongIncompatible = 'StrongIncompatible',
}

export enum GroupStatus {
  Forming = 'Forming',
  Ready = 'Ready',
  Registered = 'Registered',
  InReview = 'InReview',
  Completed = 'Completed',
}

export enum InvitationStatus {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
}

export enum ReviewPeriodStatus {
  Draft = 0,
  Open = 1,
  Scheduling = 2,
  Scheduled = 3,
  InProgress = 4,
  Closed = 5,
}

export interface Semester {
  id: number
  code: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface Lecturer {
  id: number
  fullName: string
  email: string
  phoneNumber?: string
  lecturerCode: string
  department?: string
  minTopics: number
  maxTopics: number
  expertises: string[]
  createdAt: string
  updatedAt?: string
}

export interface LecturerCompatibility {
  id: number
  lecturerAId: number
  lecturerAName?: string
  lecturerBId: number
  lecturerBName?: string
  level: CompatibilityLevel
  createdAt?: string
}

export interface Student {
  id: number
  fullName: string
  email: string
  studentCode: string
  groupId?: number
  groupName?: string
  createdAt: string
  updatedAt?: string
}

export interface GroupMember {
  studentId: number
  fullName: string
  studentCode: string
}

export interface GroupInvitation {
  id: number
  groupId: number
  groupName?: string
  invitedStudentId: number
  invitedStudentName?: string
  status: InvitationStatus | string
  createdAt: string
  respondedAt?: string
}

export interface Group {
  id: number
  groupName: string
  status: GroupStatus | string
  topicId?: number
  leaderId: number
  leaderName?: string
  topicTitle?: string
  members: GroupMember[]
  invitations?: GroupInvitation[]
  createdAt: string
  updatedAt?: string
}

export interface TopicKeyword {
  id: number
  topicId: number
  keyword: string
}

export interface Topic {
  id: number
  title: string
  description?: string
  supervisorId: number
  supervisorName?: string
  keywords: string[]
  groupId?: number
  groupName?: string
  createdAt: string
  updatedAt?: string
}

export interface ReviewPeriod {
  id: number
  name: string
  semesterId: number
  semesterCode?: string
  semesterName?: string
  /** BE có thể trả số (POST) hoặc chuỗi như "Round1" (GET) */
  round: number | string
  status: ReviewPeriodStatus | number | string
  startDate: string
  endDate: string
  slotCount?: number
  createdAt: string
  updatedAt?: string
}

export interface ReviewSlot {
  id: number
  reviewPeriodId: number
  date: string
  startTime: string
  endTime: string
  room?: string
  maxGroups: number
  registeredLecturers?: number
  registeredGroups?: number
  isCurrentUserRegistered?: boolean
  isCurrentUserGroupRegistered?: boolean
  lecturerRegistrations?: LecturerSlotRegistration[]
  groupRegistrations?: GroupSlotRegistration[]
  createdAt: string
  updatedAt?: string
}

export interface LecturerSlotRegistration {
  id: number
  lecturerId: number
  lecturerName?: string
  reviewSlotId: number
  registeredAt: string
}

export interface GroupSlotRegistration {
  id: number
  groupId: number
  groupName?: string
  reviewSlotId: number
  registeredAt: string
}

export interface CouncilMemberDetail {
  lecturerId: number
  fullName: string
  lecturerCode: string
  isChairman: boolean
  expertises?: string[]
  /** Một số endpoint cũ có thể dùng tên này */
  lecturerName?: string
}

export interface CouncilGroupDetail {
  groupId: number
  groupName: string
  topicTitle?: string
  topicKeywords?: string[]
  jaccardScore?: number
}

export interface CouncilDetail {
  councilId: number
  reviewSlotId: number
  date: string
  startTime: string
  endTime: string
  room?: string
  members: CouncilMemberDetail[]
  groups: CouncilGroupDetail[]
}

export interface SchedulingAssignment extends CouncilDetail {
  /** Điểm thuật toán theo tài liệu BE */
  score?: number
}

export interface SchedulingResult {
  totalSlots: number
  scheduledSlots: number
  unschedulableSlots: number
  assignments: SchedulingAssignment[]
  unschedulableReasons: string[]
}

export interface ScheduleResult extends SchedulingResult {}

export interface UserListItem {
  id: number
  email: string
  /** BE UserListDto: 0 Admin, 1 Lecturer, 2 Student — có thể là chuỗi trên bản cũ */
  role: number | string
  linkedName?: string | null
  linkedCode?: string | null
  isLocked: boolean
  forceChangePassword?: boolean
  lastLoginAt?: string | null
  createdAt: string
  lecturerId?: number
  lecturerName?: string
  studentId?: number
  studentName?: string
}

export interface UserDetail {
  id: number
  email: string
  role: number | string
  lecturerId?: number | null
  lecturerFullName?: string | null
  lecturerCode?: string | null
  department?: string | null
  lecturerPhone?: string | null
  studentId?: number | null
  studentFullName?: string | null
  studentCode?: string | null
  groupId?: number | null
  groupName?: string | null
  isLocked: boolean
  failedLoginCount: number
  lockoutEnd?: string | null
  forceChangePassword: boolean
  lastLoginAt?: string | null
  createdAt: string
  updatedAt?: string | null
}

export interface AdminDashboardWorkloadDistribution {
  lecturersAtMin: number
  lecturersBetween: number
  lecturersNearMax: number
  lecturersOverMax: number
}

/** Tóm tắt đợt review trên dashboard admin (BE) */
export interface AdminDashboardReviewPeriod {
  id: number
  name: string
  round: string | number
  status: string | number
  slotCount: number
}

export interface AdminDashboardDto {
  totalLecturers: number
  totalStudents: number
  totalGroups: number
  totalTopics: number
  activeSemester?: Pick<Semester, 'id' | 'code' | 'name' | 'isActive'>
  reviewPeriods: AdminDashboardReviewPeriod[]
  workloadDistribution?: AdminDashboardWorkloadDistribution
  slotFillRate?: number
}

export interface LecturerDashboardDto {
  lecturerInfo: Lecturer
  /** Một số bản BE cũ có thể còn trường này */
  upcomingSlots?: ReviewSlot[]
  registeredSlots: ReviewSlot[]
  councilAssignments: CouncilDetail[]
  totalAssignedGroups: number
  totalRegisteredSlots: number
}

export interface StudentDashboardGroupSummary {
  id: number
  groupName: string
  status: string
  memberNames: string[]
}

export interface StudentDashboardTopicSummary {
  title: string
  supervisorName: string
}

export interface StudentDashboardReviewSchedule {
  date: string
  startTime: string
  endTime: string
  room?: string
  councilMembers: string[]
}

export interface StudentDashboardPendingInvitation {
  invitationId: number
  groupName: string
  createdAt: string
}

export interface StudentDashboardDto {
  group?: StudentDashboardGroupSummary | Group | null
  topic?: StudentDashboardTopicSummary | Topic | null
  reviewSchedule?: StudentDashboardReviewSchedule | null
  pendingInvitations?: StudentDashboardPendingInvitation[]
  /** Tương thích bản BE cũ */
  studentInfo?: Student
  upcomingReviews?: ReviewSlot[]
}

export interface Tag {
  id: number
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LecturerSemesterLoad {
  lecturerId: number
  lecturerName: string
  semesterId: number
  currentLoad: number
  maxLoad: number
  isOverloaded: boolean
}

export interface ReviewSession {
  id: number
  reviewPeriodId: number
  reviewPeriodName: string
  reviewSlotId: number
  slotDate: string
  startTime: string
  endTime: string
  groupId: number
  groupName: string
  topicTitle?: string
  registrationStatus: string | number
  status: string | number
  orderInSlot?: number
  councilMembers?: Array<
    CouncilMemberDetail & { lecturerName?: string; fullName?: string }
  >
  algorithmScore?: number
  finalScore?: number
  overallComments?: string
  result?: string
  createdAt: string
  updatedAt?: string | null
}

export interface ChecklistItem {
  id: number
  orderNo: number
  title: string
  description?: string
  maxScore?: number
}

export interface Checklist {
  id: number
  reviewPeriodId: number
  name: string
  items: ChecklistItem[]
  createdAt: string
}

export enum FeedbackStatus {
  Draft = 0,
  Submitted = 1,
}

export enum ReviewSuggestion {
  Pass = 0,
  Revise = 1,
  Fail = 2,
}

export interface MyReviewSession {
  reviewSessionId: number
  reviewPeriodId: number
  reviewPeriodName: string
  round: number
  slotId: number
  date: string
  startTime: string
  endTime: string
  room?: string
  groupId: number
  groupName: string
  topicTitle?: string
  supervisorName?: string
  isChairman: boolean
  feedbackId?: number
  feedbackStatus?: number
}

export interface FeedbackDetail {
  id: number
  checklistItemId: number
  orderNo: number
  itemTitle: string
  maxScore?: number
  score?: number
  comment?: string
  isPassed?: boolean
}

export interface Feedback {
  id: number
  reviewSessionId: number
  groupId: number
  groupName: string
  lecturerId: number
  lecturerName: string
  overallComment?: string
  suggestion?: number
  status: number
  createdAt: string
  submittedAt?: string
  details: FeedbackDetail[]
}

export interface UpdateDetailItem {
  checklistItemId: number
  score?: number
  comment?: string
  isPassed?: boolean
}

export interface ReviewerFeedbackSummary {
  feedbackId: number
  reviewerName: string
  isChairman: boolean
  overallComment?: string
  suggestion?: number
  status: number
  submittedAt?: string
}

export interface RoundFeedback {
  round: number
  reviewPeriodName: string
  feedbacks: ReviewerFeedbackSummary[]
}

export interface GroupFeedbackHistory {
  groupId: number
  groupName: string
  topicTitle?: string
  rounds: RoundFeedback[]
}

export interface MyReviewSessionDto extends MyReviewSession {}
export interface FeedbackDetailDto extends FeedbackDetail {}
export interface FeedbackDto extends Feedback {}
export interface ReviewerFeedbackSummaryDto extends ReviewerFeedbackSummary {}
export interface RoundFeedbackDto extends RoundFeedback {}
export interface GroupFeedbackHistoryDto extends GroupFeedbackHistory {}
