import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  ASSESSMENT_CHANNEL_ID,
  ASSESSMENT_NOTIFICATION_PREFIX,
  cancelNotificationsByPrefix,
  ensureNotificationChannels,
  NOTIFICATION_TYPE_ASSESSMENT_REMINDER,
  setGlobalNotificationHandler,
} from '@/services/notifications/notificationsCore';
import { listCourses } from '@/services/Courses';
import { listAssessments } from '@/services/Assessments';
import { getUpcomingAssessmentReminders, buildAssessmentReminderContent } from '@/lib/reminders';
import { getNotificationPreferences } from '@/lib/notificationPreferences';
import type { Assessment } from '@/lib/types';

/**
 * Fetches all courses and their assessments for a user,
 * then computes which ones have upcoming reminders.
 */
export async function getUpcomingAssessmentRemindersForUser(userId: string) {
  const courses = await listCourses(userId);
  const courseMap = new Map(courses.map((c) => [c.id, c.code]));

  const assessmentLists = await Promise.allSettled(
    courses.map((course) =>
      listAssessments(userId, course.id).then((assessments) =>
        assessments.map((a) => ({ ...a, courseId: course.id })),
      ),
    ),
  );

  const allAssessments = assessmentLists
    .filter((r): r is PromiseFulfilledResult<(Assessment & { courseId: string })[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  const { reminderHour, reminderMinute } = await getNotificationPreferences();
  const upcoming = getUpcomingAssessmentReminders(allAssessments, new Date(), reminderHour, reminderMinute);

  return { upcoming, courseMap };
}

/**
 * Schedules one-off DATE notification for each upcoming assessment.
 */
async function scheduleReminders(
  upcoming: ReturnType<typeof getUpcomingAssessmentReminders>,
  courseMap: Map<string, string>,
): Promise<void> {
  for (const reminder of upcoming) {
    const identifier = `${ASSESSMENT_NOTIFICATION_PREFIX}${reminder.assessmentId}`;
    const courseCode = courseMap.get(reminder.courseId);
    const content = buildAssessmentReminderContent(
      { type: reminder.type, name: reminder.name, date: reminder.date },
      courseCode,
    );

    const trigger: Notifications.DateTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminder.triggerDate,
      ...(Platform.OS === 'android' ? { channelId: ASSESSMENT_CHANNEL_ID } : {}),
    };

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: content.title,
        body: content.body,
        data: { type: NOTIFICATION_TYPE_ASSESSMENT_REMINDER, courseId: reminder.courseId },
      },
      trigger,
    });
  }
}

/**
 * Fetches upcoming assessments from Firestore and schedules reminders.
 * Idempotent: cancel all previous assessment reminders, then reschedule.
 */
export async function syncAssessmentReminders(userId: string): Promise<void> {
  try {
    setGlobalNotificationHandler();
    await ensureNotificationChannels();

    let upcoming: ReturnType<typeof getUpcomingAssessmentReminders>;
    let courseMap: Map<string, string>;
    try {
      ({ upcoming, courseMap } = await getUpcomingAssessmentRemindersForUser(userId));
    } catch (e) {
      console.warn('[assessmentReminders] Firestore fetch failed, keeping existing schedules:', e);
      return;
    }

    await cancelNotificationsByPrefix(ASSESSMENT_NOTIFICATION_PREFIX);
    await scheduleReminders(upcoming, courseMap);
  } catch (e) {
    console.warn('[assessmentReminders] Sync failed:', e);
  }
}

/**
 * Cancels all assessment reminder notifications.
 */
export async function cancelAssessmentReminders(): Promise<void> {
  try {
    await cancelNotificationsByPrefix(ASSESSMENT_NOTIFICATION_PREFIX);
  } catch (e) {
    console.warn('[assessmentReminders] Cancel failed:', e);
  }
}

/**
 * Returns all currently scheduled assessment reminders (for dev/debug).
 */
export async function getScheduledAssessmentReminders() {
  try {
    const { getScheduledNotificationsByPrefix } = await import('@/services/notifications/notificationsCore');
    return getScheduledNotificationsByPrefix(ASSESSMENT_NOTIFICATION_PREFIX);
  } catch (e) {
    console.warn('[assessmentReminders] getScheduled failed:', e);
    return [];
  }
}
