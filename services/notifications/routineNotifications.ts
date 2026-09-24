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
import { listRoutine } from '@/services/Routines';
import { getProfile } from '@/services/Profile';
import { buildDailyRoutineNotificationContent, groupRoutineByDay, toExpoWeekday } from '@/lib/routine';
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
    const daysAhead = (dayOfWeek - now.getDay() + 7) % 7;
    nextFire.setDate(now.getDate() + daysAhead);
    if (nextFire <= now) nextFire.setDate(nextFire.getDate() + 7);

    console.log(`[routineNotifications] Scheduled ${identifier} → ${nextFire.toString()}`);
  }
}

/**
 * Fetches the user's routine from Firestore, then cancels and reschedules
 * all daily routine notifications.
 * Idempotent: repeated calls yield exactly 7 notifications.
 */
export async function syncRoutineNotifications(userId: string): Promise<void> {
  try {
    setGlobalNotificationHandler();
    await ensureNotificationChannels();

    let slots: RoutineSlot[] = [];
    try {
      slots = await listRoutine(userId);
    } catch (e) {
      console.warn('[routineNotifications] Firestore fetch failed, keeping existing schedules:', e);
      return;
    }

    let studentName: string | undefined;
    try {
      const profile = await getProfile(userId);
      studentName = profile?.fullName;
    } catch (e) {
      console.warn('[routineNotifications] Profile fetch failed, falling back to generic title:', e);
    }

    await cancelNotificationsByPrefix(ROUTINE_NOTIFICATION_PREFIX);

    const { reminderHour, reminderMinute } = await getNotificationPreferences();
    const grouped = groupRoutineByDay(slots);
    await scheduleNotifications(grouped, reminderHour, reminderMinute, studentName);
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
