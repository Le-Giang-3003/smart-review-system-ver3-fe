// Enums matching backend
export enum SemesterStatus {
  Upcoming = 0,
  Active = 1,
  Completed = 2,
}

export enum PeriodStatus {
  Draft = 0,
  Open = 1,
  Scheduling = 2,
  InProgress = 3,
  Completed = 4,
}

export enum ReviewRoundType {
  Round1 = 1,
  Round2 = 2,
  Round3 = 3,
}

export enum TopicLevel {
  Basic = 0,
  Intermediate = 1,
  Advanced = 2,
}

export enum LecturerCompatibilityType {
  Neutral = 0,
  Whitelist = 1,
  Blacklist = 2,
}

export enum RegistrationStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export enum SessionStatus {
  Scheduled = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3,
}

export enum CouncilRole {
  Chair = 0,
  Member = 1,
}

// Entities
export interface Semester {
  id: number
  name: string
  academicYear: string
  semesterNumber: number
  startDate: string
  endDate: string
  status: SemesterStatus
  description?: string
  createdAt: string
  updatedAt: string
}

export interface ReviewPeriod {
  id: number
  semesterId: number
  semesterName: string
  name: string
  reviewRound: ReviewRoundType
  startDate: string
  endDate: string
  status: PeriodStatus
  description?: string
  maxSlotsPerDay: number
  maxGroupsPerSlot: number
  reviewDurationMinutes: number
  minLecturersPerSlot: number
  maxLecturersPerSlot: number
  councilSize: number
  lecturerRegistrationDeadline?: string
  studentRegistrationDeadline?: string
  weightJaccard: number
  weightPreference: number
  weightInstructorPresence: number
  weightReviewInheritance: number
  weightHistoryDiff: number
  weightLoadImbalance: number
  createdAt: string
  updatedAt: string
}

export interface ReviewSlot {
  id: number
  reviewPeriodId: number
  reviewPeriodName: string
  slotDate: string
  slotNumber: number
  startTime: string
  endTime: string
  location?: string
  notes?: string
  isCancelled: boolean
  registeredLecturersCount: number
  scheduledSessionsCount: number
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: number
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Topic {
  id: number
  title: string
  description?: string
  level: TopicLevel
  isActive: boolean
  maxGroups?: number
  requiredSkills?: string
  expectedOutcomes?: string
  tags: Tag[]
  registeredGroupsCount: number
  createdAt: string
  updatedAt: string
}

export interface LecturerTag {
  tagId: number
  tagName: string
}

export interface Lecturer {
  id: number
  email: string
  fullName: string
  lecturerCode?: string
  phoneNumber?: string
  minTopicsPerSemester?: number
  maxTopicsPerSemester?: number
  isActive: boolean
  tags: LecturerTag[]
}

export interface CouncilMember {
  lecturerId: number
  lecturerName: string
  role: CouncilRole
  isInstructor: boolean
  inheritedFromRound?: ReviewRoundType
}

export interface ScheduledSession {
  sessionId: number
  groupId: number
  groupName: string
  slotId: number
  slotDate: string
  startTime: string
  endTime: string
  councilMembers: CouncilMember[]
  algorithmScore: number
}

export interface ScheduleWarning {
  type: string
  message: string
  sessionId?: number
  groupId?: number
}

export interface ScheduleResult {
  reviewPeriodId: number
  totalSlots: number
  scheduledGroups: number
  unscheduledGroups: number
  scheduledSessions: ScheduledSession[]
  warnings: ScheduleWarning[]
  errors: string[]
  isSuccess: boolean
  generatedAt: string
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
  registrationStatus: RegistrationStatus
  status: SessionStatus
  orderInSlot?: number
  councilMembers?: CouncilMember[]
  algorithmScore?: number
  finalScore?: number
  overallComments?: string
  result?: string
  createdAt: string
  updatedAt: string
}

export interface LecturerCompatibility {
  id: number
  lecturerAId: number
  lecturerAName: string
  lecturerBId: number
  lecturerBName: string
  compatibilityType: LecturerCompatibilityType
  reason?: string
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
