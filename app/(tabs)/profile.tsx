import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { SvgIcon } from '@/components/ui/SvgIcon';
import { Brand, Colors, Palette } from '@/constants/theme';
import { useSemesters } from '@/hooks/useSemesters';
import { useProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/providers/auth-provider';
import { useCgpa } from '@/services/grades/grades.hooks';
import { formatGpa } from '@/services/grades/grades.services';
import { signOut } from '@/services/auth/auth.services';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { profileData, isLoading } = useProfile();
  const { semesters } = useSemesters();
  const { data: cgpa } = useCgpa(user?.uid);
  const router = useRouter();
  const [signoutModalVisible, setSignoutModalVisible] = useState(false);

  const currentSemester = semesters.find((s) => s.id === profileData?.currentSemesterId);
  const fullName = profileData?.fullName || user?.displayName || 'Student';
  const email = user?.email ?? '';

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <SafeAreaView edges={['top']} style={styles.masthead}>
        <View style={styles.mastheadInner}>
          {/* <Text style={styles.eyebrow}>LOKKHYO</Text> */}

          <View style={styles.identity}>
            <Avatar name={fullName} photoUrl={profileData?.photoUrl} size={64} tone="onTeal" />
            <View style={styles.identityText}>
              <Text style={styles.name} numberOfLines={1}>
                {fullName}
              </Text>
              {email ? (
                <Text style={styles.email} numberOfLines={1}>
                  {email}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={Brand.teal} />
            <ThemedText style={styles.loadingText}>Loading profile…</ThemedText>
          </View>
        ) : (
          <>
            <Section title="ACADEMIC">
              <InfoRow label="University" value={profileData?.university || '—'} />
              <InfoRow label="Department" value={profileData?.department || '—'} />
              <InfoRow label="Semester" value={currentSemester?.name || '—'} />
              <InfoRow label="CGPA" value={formatGpa(cgpa?.cgpa)} />
              <InfoRow
                label="Target CGPA"
                value={profileData?.targetCgpa ? String(profileData.targetCgpa) : '—'}
                last
              />
            </Section>

            <Section title="QUICK LINKS">
              <MenuRow
                icon="courses"
                label="Courses"
                onPress={() => router.push('/(tabs)/courses')}
              />
              <MenuRow
                icon="courses"
                label="Transcript & degree status"
                onPress={() => router.push('/profile/transcript')}
              />
              <MenuRow icon="routine" label="Routine" onPress={() => router.push('/(tabs)/routine')} />
              <MenuRow
                icon="calender"
                label="Attendance"
                onPress={() => router.push('/(tabs)/attendance')}
              />
              <MenuRow
                icon="settings"
                label="Settings"
                onPress={() => router.push('/settings/settings')}
                last
              />
            </Section>

            <Section title="ACCOUNT">
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                onPress={() => setSignoutModalVisible(true)}>
                <View style={styles.rowLeft}>
                  <SvgIcon name="logout" size={20} color={Brand.danger} />
                  <ThemedText type="defaultSemiBold" style={styles.dangerLabel}>
                    Log out
                  </ThemedText>
                </View>
              </Pressable>
            </Section>

            <ThemedText style={styles.versionText}>Lokkhyo · version 1.1.0</ThemedText>
          </>
        )}
      </ScrollView>

      <Modal visible={signoutModalVisible} backdropColor="rgba(15,30,36,0.45)" animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="title" style={styles.modalTitle}>
              Sign out?
            </ThemedText>
            <ThemedText>
              Are you sure you want to sign out? You will need to log in again to access your account.
            </ThemedText>
            <View style={styles.modalButtons}>
              <Button title="Cancel" variant="secondary" onPress={() => setSignoutModalVisible(false)} />
              <Button
                title="Sign Out"
                variant="destructive"
                onPress={async () => {
                  try {
                    await signOut();
                  } catch {
                    Alert.alert('Error', 'Failed to sign out. Please try again.');
                  }
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  last,
}: {
  icon: 'courses' | 'calender' | 'settings' | 'routine';
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, !last && styles.rowDivider, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.rowLeft}>
        <SvgIcon name={icon} size={20} color={Colors.icon} />
        <ThemedText style={styles.rowLabel}>{label}</ThemedText>
      </View>
      <SvgIcon name="chevron" size={16} color={Palette.faint} />
    </Pressable>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <ThemedText style={styles.rowLabel}>{label}</ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.rowValue} numberOfLines={1}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.page,
  },
  masthead: {
    backgroundColor: Brand.teal,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  mastheadInner: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  eyebrow: {
    fontFamily: 'InterSemiBold',
    fontSize: 12,
    letterSpacing: 3,
    color: Brand.accent,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 16,
  },
  identityText: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontFamily: 'InterSemiBold',
    fontSize: 21,
    color: '#FFFFFF',
  },
  email: {
    fontFamily: 'InterRegular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  editButton: {
    alignSelf: 'flex-start',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  editLabel: {
    fontFamily: 'InterSemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 28,
  },
  loadingText: {
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Brand.divider,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
  },
  rowValue: {
    fontSize: 15,
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 16,
  },
  chevron: {
    fontSize: 18,
    lineHeight: 20,
    color: Palette.faint,
  },
  dangerLabel: {
    color: Brand.danger,
    fontSize: 15,
  },
  pressed: {
    opacity: 0.6,
  },
  versionText: {
    textAlign: 'center',
    opacity: 0.4,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,30,36,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Palette.surface,
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
