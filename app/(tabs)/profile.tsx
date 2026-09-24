import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { SvgIcon } from '@/components/ui/SvgIcon';
import { Wrapper } from '@/components/ui/Wrapper';
import { Colors } from '@/constants/theme';
import { useSemesters } from '@/hooks/useSemesters';
import { useProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/providers/auth-provider';
import { signOut } from '@/services/Auth';
import { useState } from 'react';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { profileData, isLoading } = useProfile();
  const { semesters } = useSemesters();
  const router = useRouter();
  const [signoutModalVisible, setSignoutModalVisible] = useState(false);

  const currentSemester = semesters.find((s) => s.id === profileData?.currentSemesterId);
  const displayName = profileData?.fullName || 'Student';

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="large" color={Colors.tint} />
          <ThemedText style={styles.loadingText}>Loading profile…</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <Wrapper>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <SvgIcon name="user" size={60} color={Colors.tint} />
          </View>
          <View style={styles.header}>
            <ThemedText type="defaultSemiBold" style={styles.name}>{displayName}</ThemedText>
            <ThemedText style={styles.email}>{user?.email}</ThemedText>
          </View>
        </View>

        <View style={styles.listCard}>
          <MenuRow
            icon="courses"
            label="Courses"
            onPress={() => router.push('/(tabs)/courses')}
          />
          <MenuRow
            icon="routine"
            label="Routine"
            onPress={() => router.push('/(tabs)/routine')}
          />
          <MenuRow
            icon="calender"
            label="Attendance"
            onPress={() => router.push('/(tabs)/attendance')}
          />
          <MenuRow
            icon="settings"
            label="Settings"
            onPress={() => router.push('/settings/settings')}
          />
        </View>

        <View style={styles.listCard}>
          <InfoRow label="University" value={profileData?.university || '—'} />
          <InfoRow label="Department" value={profileData?.department || '—'} />
          <InfoRow label="Semester" value={currentSemester?.name || '—'} />
          <InfoRow label="Target CGPA" value={profileData?.targetCgpa ? String(profileData.targetCgpa) : '—'} last />
        </View>

        <View style={styles.listCard}>
          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14 }}
            onPress={() => setSignoutModalVisible(true)}>
            <SvgIcon name="logout" size={22} color="#dc2626" />
            <ThemedText style={styles.logOutLabel} type='defaultSemiBold'>Log Out</ThemedText>
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
      </ScrollView>
    </Wrapper>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  last,
}: {
  icon: 'courses' | 'calender' | 'settings' | 'logout' | 'routine';
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable style={[styles.menuRow, !last && styles.rowDivider]} onPress={onPress}>
      <View style={styles.menuRowLeft}>
        <SvgIcon name={icon} size={20} color={Colors.icon} />
        <ThemedText style={styles.menuLabel}>{label}</ThemedText>
      </View>
      <ThemedText style={styles.chevron}>{'>'}</ThemedText>
    </Pressable>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.menuRow, !last && styles.rowDivider]}>
      <ThemedText style={styles.infoLabel}>{label}</ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.infoValue}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flex: 1,
    gap: 4,
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 18,
  },
  email: {
    opacity: 0.6,
    fontSize: 13,
    marginBottom: 8,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  loadingText: {
    opacity: 0.8,
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    fontSize: 15,
  },
  chevron: {
    opacity: 0.4,
    fontSize: 16,
  },
  infoLabel: {
    opacity: 0.6,
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  logOutLabel: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '600',
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
