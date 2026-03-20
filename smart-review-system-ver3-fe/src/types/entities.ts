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
  round: number
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

export interface SchedulingResult {
  totalSlots: number
  scheduledSlots: number
  unschedulableSlots: number
  assignments: CouncilDetail[]
  unschedulableReasons: string[]
}

export interface ScheduleResult extends SchedulingResult {}

export interface UserListItem {
  id: number
  email: string
  role: string
  isLocked: boolean
  lastLoginAt?: string
  lecturerId?: number
  lecturerName?: string
  studentId?: number
  studentName?: string
  createdAt: string
}

export interface UserDetail extends UserListItem {
  failedLoginCount: number
  lockoutEnd?: string
  forceChangePassword: boolean
  updatedAt?: string
}

export interface AdminDashboardDto {
  totalLecturers: number
  totalStudents: number
  totalGroups: number
  totalTopics: number
  activeSemester?: Semester
  reviewPeriods: ReviewPeriod[]
}

export interface LecturerDashboardDto {
  lecturerInfo: Lecturer
  upcomingSlots: ReviewSlot[]
  registeredSlots: ReviewSlot[]
  councilAssignments: CouncilDetail[]
  totalAssignedGroups: number
  totalRegisteredSlots: number
}

export interface StudentDashboardDto {
  studentInfo: Student
  group?: Group
  topic?: Topic
  upcomingReviews: ReviewSlot[]
  pendingInvitations: GroupInvitation[]
  reviewSchedule: CouncilDetail[]
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
  councilMembers?: CouncilMemberDetail[]
  algorithmScore?: number
  finalScore?: number
  overallComments?: string
  result?: string
  createdAt: string
  updatedAt: string
}
