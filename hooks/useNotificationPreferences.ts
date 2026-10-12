import { useEffect, useState } from 'react';

import {
  DEFAULT_ASSESSMENT_HOUR,
  DEFAULT_ASSESSMENT_MINUTE,
  DEFAULT_EVENING_HOUR,
  DEFAULT_EVENING_MINUTE,
  DEFAULT_MORNING_HOUR,
  DEFAULT_MORNING_MINUTE,
  getNotificationPreferences,
  type NotificationPreferences,
} from '@/lib/notificationPreferences';

const DEFAULT_PREFS: NotificationPreferences = {
  dailyRoutineEnabled: true,
  attendanceDigestEnabled: true,
  attendanceRiskEnabled: true,
  assessmentRemindersEnabled: true,
  morningHour: DEFAULT_MORNING_HOUR,
  morningMinute: DEFAULT_MORNING_MINUTE,
  eveningHour: DEFAULT_EVENING_HOUR,
  eveningMinute: DEFAULT_EVENING_MINUTE,
  assessmentHour: DEFAULT_ASSESSMENT_HOUR,
  assessmentMinute: DEFAULT_ASSESSMENT_MINUTE,
};

/**
 * Loads notification preferences once on mount. Settings manages its own
 * state; this hook is for read-only surfaces that need to know whether
 * reminders are on and at what time.
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
