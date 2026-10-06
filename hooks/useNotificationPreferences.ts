import { useEffect, useState } from 'react';

import {
  DEFAULT_REMINDER_HOUR,
  DEFAULT_REMINDER_MINUTE,
  getNotificationPreferences,
  type NotificationPreferences,
} from '@/lib/notificationPreferences';

const DEFAULT_PREFS: NotificationPreferences = {
  dailyRoutineEnabled: true,
  assessmentRemindersEnabled: true,
  reminderHour: DEFAULT_REMINDER_HOUR,
  reminderMinute: DEFAULT_REMINDER_MINUTE,
};

/**
 * Loads notification preferences from AsyncStorage once on mount.
 * Settings screen manages its own state; this hook is for read-only surfaces
 * that need to know whether reminders are on and at what time.
 */
export function useNotificationPreferences(): NotificationPreferences {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);

  useEffect(() => {
    let cancelled = false;
    getNotificationPreferences().then((p) => {
      if (!cancelled) setPrefs(p);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return prefs;
}
