export type SemesterStatus = 'active' | 'archived';

export interface UserProfile {
  fullName: string;
  university: string;
  department: string;
  currentSemesterId: string;
  targetCgpa: number;
  createdAt?: number;
}

export interface Semester {
  id: string;
  name: string;
  status: SemesterStatus;
  targetGpa: number;
  startDate: string;
  totalWeeks: number;
  createdAt: number;
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
  createdAt: number;
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
  createdAt: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'cancelled';

export interface AttendanceRecord {
  id: string;
  date: string;
  slotId: string;
  status: AttendanceStatus;
  createdAt: number;
}

export interface RoutineSlot {
  id: string;
  courseId: string;
  courseLabel: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  createdAt: number;
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
  createdAt: number;
}
