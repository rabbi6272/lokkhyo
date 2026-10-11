/** Wire types — mirror `notificationPrefsSchema` in `lokkhyo_server/schemas/user.ts`. */

export type NotificationCategoryDto = 'ROUTINE' | 'ATTENDANCE' | 'ATTENDANCE_RISK' | 'DEADLINE' | 'GRADE';

export interface NotificationPrefsDto {
  timezone: string;
  /** `HH:mm`. */
  morningRoutineTime: string;
  eveningAttendanceTime: string;
  categoriesEnabled: Record<NotificationCategoryDto, boolean>;
  attendanceCutoffHour: number;
}

export interface UpdateNotificationPrefsDto {
  timezone?: string;
  morningRoutineTime?: string;
  eveningAttendanceTime?: string;
  categoriesEnabled?: Partial<Record<NotificationCategoryDto, boolean>>;
  attendanceCutoffHour?: number;
}
