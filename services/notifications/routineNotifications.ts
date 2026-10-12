import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  cancelNotificationsByPrefix,
  ensureNotificationChannels,
  NOTIFICATION_TYPE_DAILY_ROUTINE,
  ROUTINE_CHANNEL_ID,
  ROUTINE_NOTIFICATION_PREFIX,
  setGlobalNotificationHandler,
} from '@/services/notifications/notificationsCore';
import { fetchWeekRoutine } from '@/services/routine/routine.services';
import { getMe } from '@/services/profile/profile.api';
import { buildDailyRoutineNotificationContent, getTodayOfWeek, groupRoutineByDay, toExpoWeekday } from '@/lib/routine';
import { getNotificationPreferences } from '@/lib/notificationPreferences';
import type { RoutineSlot } from '@/lib/types';

const ROUTINE_DAY_KEYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

/**
 * Schedules one weekly notification per weekday at 07:00 AM (device-local).
 * Empty days get a "no classes" message.
 */
async function scheduleNotifications(
  grouped: Record<number, RoutineSlot[]>,
  hour: number,
  minute: number,
  studentName?: string,
): Promise<void> {
  for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
    const daySlots = grouped[dayOfWeek] ?? [];
    const content = buildDailyRoutineNotificationContent(daySlots, studentName);
    const expoWeekday = toExpoWeekday(dayOfWeek);
    const identifier = `${ROUTINE_NOTIFICATION_PREFIX}${ROUTINE_DAY_KEYS[dayOfWeek]}`;

    const trigger: Notifications.WeeklyTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: expoWeekday,
      hour,
      minute,
      ...(Platform.OS === 'android' ? { channelId: ROUTINE_CHANNEL_ID } : {}),
    };

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: content.title,
        body: content.body,
        data: { type: NOTIFICATION_TYPE_DAILY_ROUTINE, dayOfWeek },
      },
      trigger,
    });

    const now = new Date();
    const nextFire = new Date(now);
    nextFire.setHours(hour, minute, 0, 0);
    const daysAhead = (dayOfWeek - getTodayOfWeek() + 7) % 7;
    nextFire.setDate(now.getDate() + daysAhead);
    if (nextFire <= now) nextFire.setDate(nextFire.getDate() + 7);

    console.log(`[routineNotifications] Scheduled ${identifier} → ${nextFire.toString()}`);
  }
}

/**
 * iOS: fetches the user's routine from the API, then cancels and reschedules
 * all daily routine notifications. Idempotent: repeated calls yield exactly 7
 * notifications. Android: the server pushes it, so this only clears local ones.
 */
export async function syncRoutineNotifications(userId: string): Promise<void> {
  try {
    setGlobalNotificationHandler();
    await ensureNotificationChannels();

    // On Android the server sends the morning routine as a push, built from the
    // timetable as it stands that morning and controlled by the same settings
    // (`/me/notification-prefs`). Scheduling it locally too would notify twice,
    // so any local schedules are cleared — including ones from before this
    // release. iOS has no server push yet and keeps the local version.
    if (Platform.OS === 'android') {
      await cancelNotificationsByPrefix(ROUTINE_NOTIFICATION_PREFIX);
      return;
    }

    const prefs = await getNotificationPreferences();
    if (!prefs.dailyRoutineEnabled) {
      await cancelNotificationsByPrefix(ROUTINE_NOTIFICATION_PREFIX);
      return;
    }

    let slots: RoutineSlot[] = [];
    try {
      slots = await fetchWeekRoutine();
    } catch (e) {
      console.warn('[routineNotifications] Routine fetch failed, keeping existing schedules:', e);
      return;
    }

    let studentName: string | undefined;
    try {
      // The profile lives on the API now, so this stays in step when the
      // student edits their name. Failures are non-fatal: the greeting falls
      // back to a generic title.
      studentName = (await getMe()).name ?? undefined;
    } catch (e) {
      console.warn('[routineNotifications] Profile fetch failed, falling back to generic title:', e);
    }

    await cancelNotificationsByPrefix(ROUTINE_NOTIFICATION_PREFIX);

    const { morningHour, morningMinute } = await getNotificationPreferences();
    const grouped = groupRoutineByDay(slots);
    await scheduleNotifications(grouped, morningHour, morningMinute, studentName);
  } catch (e) {
    console.warn('[routineNotifications] Sync failed:', e);
  }
}

/**
 * Cancels all daily routine notifications.
 */
export async function cancelRoutineNotifications(): Promise<void> {
  try {
    await cancelNotificationsByPrefix(ROUTINE_NOTIFICATION_PREFIX);
  } catch (e) {
    console.warn('[routineNotifications] Cancel failed:', e);
  }
}

/**
 * Returns all currently scheduled daily routine notifications (for dev/debug).
 */
export async function getScheduledRoutineNotifications() {
  try {
    const { getScheduledNotificationsByPrefix } = await import('@/services/notifications/notificationsCore');
    return getScheduledNotificationsByPrefix(ROUTINE_NOTIFICATION_PREFIX);
  } catch (e) {
    console.warn('[routineNotifications] getScheduled failed:', e);
    return [];
  }
}
