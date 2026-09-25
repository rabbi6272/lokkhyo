import type { Timestamp } from '@react-native-firebase/firestore';

export type SemesterStatus = 'active' | 'archived';

export interface UserProfile {
  fullName: string;
  university: string;
  department: string;
  currentSemesterId: string;
  targetCgpa: number;
  createdAt: Timestamp | null;
}

export interface Semester {
  id: string;
  name: string;
  status: SemesterStatus;
  targetGpa: number;
  startDate: string;
  totalWeeks: number;
  createdAt: Timestamp | null;
}

export interface Course {
  id: string;
  semesterId: string;
  code: string;
  title: string;
  credits: number;
  passMarks: number;
  ctWeight: number;
  isLab: boolean;
  courseTeachers?: string[];
  createdAt: Timestamp | null;
}

export type AssessmentType = 'ct' | 'quiz' | 'assignment' | 'labFinal';

export interface Assessment {
  id: string;
  type: AssessmentType;
  name: string;
  marksObtained: number;
  maxMarks: number;
  weight: number;
  date: string;
  teacherName?: string;
  createdAt: Timestamp | null;
}

export type AttendanceStatus = 'present' | 'absent' | 'cancelled';

export interface AttendanceRecord {
  id: string;
  date: string;
  slotId: string;
  status: AttendanceStatus;
  createdAt: Timestamp | null;
}

export interface RoutineSlot {
  id: string;
  courseId: string;
  courseLabel: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  createdAt: Timestamp | null;
}

export type TargetType = 'gpa' | 'cgpa' | 'attendance' | 'custom';

export interface AcademicTarget {
  id: string;
  type: TargetType;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: string;
  createdAt: Timestamp | null;
}
