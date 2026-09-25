import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { BackStep } from '@/components/ui/BackStep';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ThemedText } from '@/components/ThemedText';
import { Wrapper } from '@/components/ui/Wrapper';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';
import { useProfile } from '@/hooks/useUserProfile';
import { deleteAccount, signOut } from '@/services/Auth';
import {
  DEFAULT_REMINDER_HOUR,
  DEFAULT_REMINDER_MINUTE,
  getNotificationPreferences,
  setAssessmentRemindersEnabled,
  setDailyRoutineEnabled,
  setReminderTime,
} from '@/lib/notificationPreferences';
import { formatTime12h } from '@/lib/routine';
import { cancelRoutineNotifications, syncRoutineNotifications } from '@/services/notifications/routineNotifications';
import { cancelAssessmentReminders, syncAssessmentReminders } from '@/services/notifications/assessmentReminders';

const REMINDER_TIME_OPTIONS: { hour: number; minute: number }[] = [
  { hour: 6, minute: 0 },
  { hour: 6, minute: 30 },
  { hour: 7, minute: 0 },
  { hour: 7, minute: 30 },
  { hour: 8, minute: 0 },
  { hour: 8, minute: 30 },
  { hour: 9, minute: 0 },
  { hour: 9, minute: 30 },
  { hour: 10, minute: 0 },
];

function toHHMM(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useAuth();
  const { deleteProfile } = useProfile();

  const [dailyRoutineEnabled, setDailyRoutineState] = useState(true);
  const [assessmentRemindersEnabled, setAssessmentRemindersState] = useState(true);
  const [reminderHour, setReminderHourState] = useState(DEFAULT_REMINDER_HOUR);
  const [reminderMinute, setReminderMinuteState] = useState(DEFAULT_REMINDER_MINUTE);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  const [signoutModalVisible, setSignoutModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getNotificationPreferences().then((prefs) => {
      setDailyRoutineState(prefs.dailyRoutineEnabled);
      setAssessmentRemindersState(prefs.assessmentRemindersEnabled);
      setReminderHourState(prefs.reminderHour);
      setReminderMinuteState(prefs.reminderMinute);
      setPrefsLoaded(true);
    });
  }, []);

  const handleToggleDailyRoutine = async (value: boolean) => {
    setDailyRoutineState(value);
    await setDailyRoutineEnabled(value);
    if (!user) return;
    if (value) {
      await syncRoutineNotifications(user.uid);
    } else {
      await cancelRoutineNotifications();
    }
  };

  const handleToggleAssessmentReminders = async (value: boolean) => {
    setAssessmentRemindersState(value);
    await setAssessmentRemindersEnabled(value);
    if (!user) return;
    if (value) {
      await syncAssessmentReminders(user.uid);
    } else {
      await cancelAssessmentReminders();
    }
  };

  const handleSelectReminderTime = async (hour: number, minute: number) => {
    setReminderHourState(hour);
    setReminderMinuteState(minute);
    setTimeModalVisible(false);
    await setReminderTime(hour, minute);
    if (!user) return;
    await Promise.allSettled([
      dailyRoutineEnabled ? syncRoutineNotifications(user.uid) : Promise.resolve(),
      assessmentRemindersEnabled ? syncAssessmentReminders(user.uid) : Promise.resolve(),
    ]);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteProfile.mutateAsync();
      await deleteAccount();
    } catch (error: any) {
      setDeleting(false);
      setDeleteModalVisible(false);
      if (error?.code === 'auth/requires-recent-login') {
        Alert.alert(
          'Please sign in again',
          'For your security, sign out and log back in, then try deleting your account again.',
        );
      } else {
        Alert.alert('Error', 'Failed to delete account. Please try again.');
      }
    }
  };

  return (
    <>
      <BackStep title="Settings" onBack={() => navigation.goBack()} />
      <Wrapper noTopMargin>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.listCard}>
            <MenuRow label="Edit Profile" onPress={() => router.push('/profile/edit')} last />
          </View>

          <View style={styles.listCard}>
            <ToggleRow
              label="Daily routine reminder"
              description="Get a morning summary of today's classes"
              value={dailyRoutineEnabled}
              onValueChange={handleToggleDailyRoutine}
              disabled={!prefsLoaded}
            />
            <ToggleRow
              label="Assessment reminders"
              description="Get notified before CTs, quizzes & assignments"
              value={assessmentRemindersEnabled}
              onValueChange={handleToggleAssessmentReminders}
              disabled={!prefsLoaded}
            />
            <MenuRow
              label="Reminder time"
              value={formatTime12h(toHHMM(reminderHour, reminderMinute))}
              onPress={() => setTimeModalVisible(true)}
              last
            />
          </View>

          <View style={styles.listCard}>
            <Pressable style={styles.menuRow} onPress={() => setDeleteModalVisible(true)}>
              <ThemedText type='defaultSemiBold' style={styles.dangerLabel}>Delete Account</ThemedText>
            </Pressable>
          </View>

          <ThemedText style={styles.versionText}>App version 1.0.0</ThemedText>

          <Modal visible={signoutModalVisible} backdropColor="rgba(0, 0, 0, 0.4)" animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ThemedText type="title" style={styles.modalTitle}>
                  Sign out?
                </ThemedText>
                <ThemedText>
                  Are you sure you want to sign out? You will need to log in again to access your account.
                </ThemedText>
                <View style={styles.modalButtons}>
                  <Button title="Cancel" variant="ghost" onPress={() => setSignoutModalVisible(false)} />
                  <Button
                    title="Sign Out"
                    variant="destructive"
                    onPress={async () => {
                      try {
                        await signOut();
                      } catch (error) {
                        Alert.alert('Error', 'Failed to sign out. Please try again.');
                      }
                    }}
                  />
                </View>
              </View>
            </View>
          </Modal>

          <Modal visible={timeModalVisible} backdropColor="rgba(0, 0, 0, 0.4)" animationType="fade" onRequestClose={() => setTimeModalVisible(false)}>
            <Pressable style={styles.modalOverlay} onPress={() => setTimeModalVisible(false)}>
              <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                <ThemedText type="title" style={styles.modalTitle}>
                  Reminder time
                </ThemedText>
                <ThemedText>
                  Choose when daily routine and assessment reminders should be sent.
                </ThemedText>
                <View style={styles.timeOptions}>
                  {REMINDER_TIME_OPTIONS.map((option) => (
                    <Chip
                      key={`${option.hour}-${option.minute}`}
                      label={formatTime12h(toHHMM(option.hour, option.minute))}
                      selected={reminderHour === option.hour && reminderMinute === option.minute}
                      onPress={() => handleSelectReminderTime(option.hour, option.minute)}
                    />
                  ))}
                </View>
              </Pressable>
            </Pressable>
          </Modal>

          <Modal visible={deleteModalVisible} backdropColor="rgba(0, 0, 0, 0.4)" animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ThemedText type="title" style={styles.modalTitle}>
                  Delete account?
                </ThemedText>
                <ThemedText>
                  This permanently deletes your profile and signs you out. This action cannot be undone.
                </ThemedText>
                <View style={styles.modalButtons}>
                  <Button title="Cancel" variant="ghost" onPress={() => setDeleteModalVisible(false)} disabled={deleting} />
                  <Button title="Delete" variant="destructive" onPress={handleDeleteAccount} loading={deleting} />
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </Wrapper>
    </>
  );
}

function MenuRow({
  label,
  value,
  onPress,
  last,
}: {
  label: string;
  value?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable style={[styles.menuRow, !last && styles.rowDivider]} onPress={onPress}>
      <ThemedText style={styles.menuLabel}>{label}</ThemedText>
      <View style={styles.menuRowRight}>
        {value && <ThemedText style={styles.menuValue}>{value}</ThemedText>}
        <ThemedText style={styles.chevron}>{'>'}</ThemedText>
      </View>
    </Pressable>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onValueChange,
  disabled,
  last,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.menuRow, !last && styles.rowDivider]}>
      <View style={styles.toggleTextWrap}>
        <ThemedText style={styles.menuLabel}>{label}</ThemedText>
        <ThemedText style={styles.toggleDescription}>{description}</ThemedText>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ true: "#e5e5e5", false: '#e5e5e5' }}
        thumbColor={Colors.tint}
        style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }], transitionDuration: '250ms' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  menuLabel: {
    fontSize: 15,
  },
  chevron: {
    opacity: 0.4,
    fontSize: 16,
  },
  menuRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuValue: {
    opacity: 0.5,
    fontSize: 14,
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  toggleTextWrap: {
    flex: 1,
    gap: 2,
  },
  toggleDescription: {
    opacity: 0.5,
    fontSize: 12,
  },
  dangerLabel: {
    color: '#dc2626',
    fontSize: 15,
  },
  versionText: {
    textAlign: 'center',
    opacity: 0.4,
    fontSize: 12,
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
});
