import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

import { useAuth } from '@/providers/auth-provider';
import { useRoutines } from '@/hooks/useRoutines';
import {
  NOTIFICATION_TYPE_ASSESSMENT_REMINDER,
  NOTIFICATION_TYPE_DAILY_ROUTINE,
} from '@/services/notifications/notificationsCore';
import { syncRoutineNotifications, cancelRoutineNotifications } from '@/services/notifications/routineNotifications';
import { syncAssessmentReminders, cancelAssessmentReminders } from '@/services/notifications/assessmentReminders';

/**
 * Orchestrates all notification lifecycle:
 * - Auth state: sync on login, cancel on logout
 * - Routine slot changes: re-sync
 * - AppState foreground: refresh
 * - Notification taps: navigate to routine or course screen
 */
export function useScheduledNotifications() {
  const { user } = useAuth();
  const { slots } = useRoutines();
  const router = useRouter();

  const lastUidRef = useRef<string | null>(null);
  const appState = useRef(AppState.currentState);
  const lastSyncRef = useRef(0);

  const syncAll = useCallback(async (uid: string) => {
    const token = uid;
    lastUidRef.current = token;
    lastSyncRef.current = Date.now();

    await Promise.allSettled([
      syncRoutineNotifications(uid),
      syncAssessmentReminders(uid),
    ]);

    if (lastUidRef.current !== token) return;
  }, []);

  const cancelAll = useCallback(async () => {
    await Promise.allSettled([
      cancelRoutineNotifications(),
      cancelAssessmentReminders(),
    ]);
  }, []);

  useEffect(() => {
    if (!user) {
      void cancelAll();
      return;
    }
    void syncAll(user.uid);
  }, [user?.uid, syncAll, cancelAll]);

  useEffect(() => {
    if (!user) return;
    const now = Date.now();
    if (now - lastSyncRef.current < 30_000) return;
    void syncAll(user.uid);
  }, [slots, user?.uid, syncAll]);

  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        appState.current = nextState;
        if (user) {
          const now = Date.now();
          if (now - lastSyncRef.current > 30_000) {
            void syncAll(user.uid);
          }
        }
      } else {
        appState.current = nextState;
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [user?.uid, syncAll]);

  // Handle notification taps
  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (
      lastNotificationResponse?.notification &&
      lastNotificationResponse.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      const data = lastNotificationResponse.notification.request.content.data as Record<string, unknown> | undefined;
      if (data?.type === NOTIFICATION_TYPE_DAILY_ROUTINE) {
        router.push('/routine');
      } else if (data?.type === NOTIFICATION_TYPE_ASSESSMENT_REMINDER && typeof data.courseId === 'string') {
        router.push({ pathname: '/course/[id]', params: { id: data.courseId } });
      }
    }
  }, [lastNotificationResponse, router]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      if (response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
        const data = response.notification.request.content.data as Record<string, unknown> | undefined;
        if (data?.type === NOTIFICATION_TYPE_DAILY_ROUTINE) {
          router.push('/routine');
        } else if (data?.type === NOTIFICATION_TYPE_ASSESSMENT_REMINDER && typeof data.courseId === 'string') {
          router.push({ pathname: '/course/[id]', params: { id: data.courseId } });
        }
      }
    });

    return () => subscription.remove();
  }, [router]);
}
