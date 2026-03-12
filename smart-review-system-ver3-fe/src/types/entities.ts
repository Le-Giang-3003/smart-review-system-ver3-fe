// Enums for standard static values across the application
export enum LecturerCompatibilityType {
  Neutral = 0,
  Whitelist = 1,
  Blacklist = 2,
}

// Semesters
export interface Semester {
  id: number;
  code: string;
  name: string;
  startDate: string; // From DateOnly
  endDate: string; // From DateOnly
  isActive: boolean;
  reviewPeriodCount: number;
  createdAt: string;
}

// Lecturers
export interface Lecturer {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  lecturerCode: string;
  department?: string;
  minTopics: number;
  maxTopics: number;
  expertises: string[];
  createdAt: string;
}

export interface LecturerCompatibility {
  id: number;
  lecturerAId: number;
  lecturerAName: string;
  lecturerBId: number;
  lecturerBName: string;
  compatibilityType: LecturerCompatibilityType;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LecturerSemesterLoad {
  lecturerId: number;
  lecturerName: string;
  semesterId: number;
  currentLoad: number;
  maxLoad: number;
  isOverloaded: boolean;
}

// Students
export interface Student {
  id: number;
  fullName: string;
  email: string;
  studentCode: string;
  groupId?: number;
  groupName?: string;
  createdAt: string;
}

// Groups
export interface GroupMember {
  studentId: number;
  fullName: string;
  studentCode: string;
}

export interface Group {
  id: number;
  groupName: string;
  status: string;
  leaderId: number;
  leaderName: string;
  topicTitle?: string;
  members: GroupMember[];
  createdAt: string;
}

export interface GroupInvitation {
  id: number;
  groupId: number;
  groupName: string;
  invitedStudentId: number;
  invitedStudentName: string;
  status: string;
  createdAt: string;
}

// Topics
export interface Topic {
  id: number;
  title: string;
  description?: string;
  supervisorId: number;
  supervisorName: string;
  keywords: string[];
  groupId?: number;
  groupName?: string;
  createdAt: string;
}

// Tags / Expertises (If standalone model is still needed)
export interface Tag {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Review Periods
export interface ReviewPeriod {
  id: number;
  name: string;
  semesterId: number;
  semesterCode: string;
  round: string;
  status: string;
  startDate: string; // From DateTime
  endDate: string; // From DateTime
  slotCount: number;
  createdAt: string;
}

// Review Slots
export interface ReviewSlot {
  id: number;
  reviewPeriodId: number;
  date: string; // From DateOnly
  startTime: string; // From TimeOnly
  endTime: string; // From TimeOnly
  room?: string;
  maxGroups: number;
  registeredLecturers: number;
  registeredGroups: number;
  createdAt: string;
}

// Scheduling & Councils
export interface CouncilMemberDetail {
  lecturerId: number;
  fullName: string;
  lecturerCode: string;
  isChairman: boolean;
  expertises: string[];
}

export interface CouncilGroupDetail {
  groupId: number;
  groupName: string;
  topicTitle: string;
  topicKeywords: string[];
  jaccardScore: number;
}

export interface CouncilDetail {
  councilId: number;
  reviewSlotId: number;
  date: string;
  startTime: string;
  endTime: string;
  room?: string;
  members: CouncilMemberDetail[];
  groups: CouncilGroupDetail[];
}

export interface SchedulingWarnings {
  type: string;
  message: string;
  sessionId?: number;
  groupId?: number;
}

export interface SchedulingResult {
  totalSlots: number;
  scheduledSlots: number;
  unschedulableSlots: number;
  assignments: CouncilDetail[]; // Using CouncilDetail which matches structure
  unschedulableReasons: string[];
}

export interface ReviewSession {
  id: number;
  reviewPeriodId: number;
  reviewPeriodName: string;
  reviewSlotId: number;
  slotDate: string;
  startTime: string;
  endTime: string;
  groupId: number;
  groupName: string;
  topicTitle?: string;
  registrationStatus: string | number;
  status: string | number;
  orderInSlot?: number;
  councilMembers?: CouncilMemberDetail[];
  algorithmScore?: number;
  finalScore?: number;
  overallComments?: string;
  result?: string;
  createdAt: string;
  updatedAt: string;
}
