import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_ROUTINE_KEY = 'lokkhyo.pref.dailyRoutineNotifications';
const ASSESSMENT_REMINDERS_KEY = 'lokkhyo.pref.assessmentReminderNotifications';
const REMINDER_HOUR_KEY = 'lokkhyo.pref.reminderHour';
const REMINDER_MINUTE_KEY = 'lokkhyo.pref.reminderMinute';

export const DEFAULT_REMINDER_HOUR = 7;
export const DEFAULT_REMINDER_MINUTE = 0;

export interface NotificationPreferences {
  dailyRoutineEnabled: boolean;
  assessmentRemindersEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
}

async function readBoolPref(key: string, fallback: boolean): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (stored === null) return fallback;
    return stored === 'true';
  } catch {
    return fallback;
  }
}

async function readNumberPref(key: string, fallback: number): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (stored === null) return fallback;
    const parsed = Number(stored);
    return Number.isFinite(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const [dailyRoutineEnabled, assessmentRemindersEnabled, reminderHour, reminderMinute] = await Promise.all([
    readBoolPref(DAILY_ROUTINE_KEY, true),
    readBoolPref(ASSESSMENT_REMINDERS_KEY, true),
    readNumberPref(REMINDER_HOUR_KEY, DEFAULT_REMINDER_HOUR),
    readNumberPref(REMINDER_MINUTE_KEY, DEFAULT_REMINDER_MINUTE),
  ]);
  return { dailyRoutineEnabled, assessmentRemindersEnabled, reminderHour, reminderMinute };
}

export async function setDailyRoutineEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(DAILY_ROUTINE_KEY, String(enabled));
}

export async function setAssessmentRemindersEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(ASSESSMENT_REMINDERS_KEY, String(enabled));
}

export async function setReminderTime(hour: number, minute: number): Promise<void> {
  await AsyncStorage.setItem(REMINDER_HOUR_KEY, String(hour));
  await AsyncStorage.setItem(REMINDER_MINUTE_KEY, String(minute));
}
