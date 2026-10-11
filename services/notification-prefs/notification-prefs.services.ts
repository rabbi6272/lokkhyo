import type { NotificationPrefsDto, UpdateNotificationPrefsDto } from './notification-prefs.types';

/**
 * The app's two toggles and one time, as the server stores them:
 * the daily routine notification is the `ROUTINE` category, assessment
 * reminders are `DEADLINE`, and the shared reminder time is the morning
 * routine time.
 */
export interface AppNotificationPrefs {
  dailyRoutineEnabled: boolean;
  assessmentRemindersEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
}

export function toAppPrefs(dto: NotificationPrefsDto): AppNotificationPrefs {
  const [hour, minute] = dto.morningRoutineTime.split(':').map(Number);
  return {
    dailyRoutineEnabled: dto.categoriesEnabled.ROUTINE,
    assessmentRemindersEnabled: dto.categoriesEnabled.DEADLINE,
    reminderHour: Number.isFinite(hour) ? hour : 7,
    reminderMinute: Number.isFinite(minute) ? minute : 0,
  };
}

const pad = (value: number) => String(value).padStart(2, '0');

export function toPrefsPatch(patch: Partial<AppNotificationPrefs>): UpdateNotificationPrefsDto {
  const input: UpdateNotificationPrefsDto = {};
  const categories: UpdateNotificationPrefsDto['categoriesEnabled'] = {};
  if (patch.dailyRoutineEnabled !== undefined) categories.ROUTINE = patch.dailyRoutineEnabled;
  if (patch.assessmentRemindersEnabled !== undefined) categories.DEADLINE = patch.assessmentRemindersEnabled;
  if (Object.keys(categories).length > 0) input.categoriesEnabled = categories;
  if (patch.reminderHour !== undefined && patch.reminderMinute !== undefined) {
    input.morningRoutineTime = `${pad(patch.reminderHour)}:${pad(patch.reminderMinute)}`;
  }
  return input;
}
