import AsyncStorage from '@react-native-async-storage/async-storage';

import { getNotificationPrefs, updateNotificationPrefs } from '@/services/notification-prefs/notification-prefs.api';
import {
  toAppPrefs,
  toPrefsPatch,
  type AppNotificationPrefs,
} from '@/services/notification-prefs/notification-prefs.services';

/**
 * Notification preferences: the server (`/me/notification-prefs`) is the
 * source of truth, so they follow the student across devices; AsyncStorage is
 * the offline cache. Scheduling runs outside React and must work offline, so
 * every read falls back to the cache and every write lands in the cache first.
 */

const DAILY_ROUTINE_KEY = 'lokkhyo.pref.dailyRoutineNotifications';
const ASSESSMENT_REMINDERS_KEY = 'lokkhyo.pref.assessmentReminderNotifications';
const REMINDER_HOUR_KEY = 'lokkhyo.pref.reminderHour';
const REMINDER_MINUTE_KEY = 'lokkhyo.pref.reminderMinute';

export const DEFAULT_REMINDER_HOUR = 7;
export const DEFAULT_REMINDER_MINUTE = 0;

export type NotificationPreferences = AppNotificationPrefs;

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

async function readCache(): Promise<NotificationPreferences> {
  const [dailyRoutineEnabled, assessmentRemindersEnabled, reminderHour, reminderMinute] = await Promise.all([
    readBoolPref(DAILY_ROUTINE_KEY, true),
    readBoolPref(ASSESSMENT_REMINDERS_KEY, true),
    readNumberPref(REMINDER_HOUR_KEY, DEFAULT_REMINDER_HOUR),
    readNumberPref(REMINDER_MINUTE_KEY, DEFAULT_REMINDER_MINUTE),
  ]);
  return { dailyRoutineEnabled, assessmentRemindersEnabled, reminderHour, reminderMinute };
}

async function writeCache(prefs: Partial<NotificationPreferences>): Promise<void> {
  const entries: [string, string][] = [];
  if (prefs.dailyRoutineEnabled !== undefined) entries.push([DAILY_ROUTINE_KEY, String(prefs.dailyRoutineEnabled)]);
  if (prefs.assessmentRemindersEnabled !== undefined)
    entries.push([ASSESSMENT_REMINDERS_KEY, String(prefs.assessmentRemindersEnabled)]);
  if (prefs.reminderHour !== undefined) entries.push([REMINDER_HOUR_KEY, String(prefs.reminderHour)]);
  if (prefs.reminderMinute !== undefined) entries.push([REMINDER_MINUTE_KEY, String(prefs.reminderMinute)]);
  try {
    await AsyncStorage.multiSet(entries);
  } catch {
    // The cache is best-effort; the server copy is authoritative.
  }
}

/** Server first (refreshing the cache); the cache when offline or signed out. */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const prefs = toAppPrefs(await getNotificationPrefs());
    await writeCache(prefs);
    return prefs;
  } catch {
    return readCache();
  }
}

/**
 * Cache first, so the scheduling that follows a toggle sees it immediately;
 * then the server. A failed server write is not fatal — the device keeps the
 * choice until the next successful read, which takes the server's value.
 */
async function savePreferences(patch: Partial<NotificationPreferences>): Promise<void> {
  await writeCache(patch);
  try {
    await updateNotificationPrefs(toPrefsPatch(patch));
  } catch (error) {
    console.warn('[notificationPreferences] Server save failed, kept locally:', error);
  }
}

export async function setDailyRoutineEnabled(enabled: boolean): Promise<void> {
  await savePreferences({ dailyRoutineEnabled: enabled });
}

export async function setAssessmentRemindersEnabled(enabled: boolean): Promise<void> {
  await savePreferences({ assessmentRemindersEnabled: enabled });
}

export async function setReminderTime(hour: number, minute: number): Promise<void> {
  await savePreferences({ reminderHour: hour, reminderMinute: minute });
}
