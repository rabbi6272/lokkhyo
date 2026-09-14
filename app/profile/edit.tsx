import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, ToastAndroid, View } from 'react-native';
import { useNavigation } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Field } from '@/components/ui/InputField';
import { Wrapper } from '@/components/ui/Wrapper';
import { BackStep } from '@/components/ui/BackStep';

import { Colors } from '@/constants/theme';
import { useSemesters } from '@/hooks/useSemesters';
import { useProfile } from '@/hooks/useUserProfile';
import { gpaRange, required } from '@/lib/validate';
import { SvgIcon } from '@/components/ui/SvgIcon';


export default function ProfileInfoCard() {
  const navigation = useNavigation();
  const { profileData, isLoading, updateProfile } = useProfile();
  const { semesters, createSemester, deleteSemester, activateSemester } = useSemesters();

  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [currentSemesterId, setCurrentSemesterId] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const [modalVisible, setModalVisible] = useState(false);
  const [newSemName, setNewSemName] = useState('');
  const [newSemGpa, setNewSemGpa] = useState('');
  const [newSemErrors, setNewSemErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (profileData) {
      setFullName(profileData.fullName || '');
      setUniversity(profileData.university || '');
      setDepartment(profileData.department || '');
      setCurrentSemesterId(profileData.currentSemesterId || '');
    }
  }, [profileData]);

  const handleSave = async () => {
    const nextErrors: Record<string, string | null> = {
      fullName: required(fullName, 'Full name'),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    await updateProfile.mutateAsync({
      fullName: fullName.trim(),
      university: university.trim(),
      department: department.trim(),
      currentSemesterId,
    });
    ToastAndroid.show('Profile updated', 2000);
  };

  const handleCancel = () => {
    if (profileData) {
      setFullName(profileData.fullName || '');
      setUniversity(profileData.university || '');
      setDepartment(profileData.department || '');
      setCurrentSemesterId(profileData.currentSemesterId || '');
    }
    setErrors({});
    navigation.goBack();
  };

  const handleCreateSemester = async () => {
    const nextErrors: Record<string, string | null> = {
      name: required(newSemName, 'Semester name'),
    };
    const gpa = Number(newSemGpa);
    if (newSemGpa.trim()) {
      nextErrors.targetGpa = Number.isNaN(gpa) ? 'Target GPA must be a number.' : gpaRange(gpa);
    } else {
      nextErrors.targetGpa = null;
    }
    setNewSemErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const id = await createSemester.mutateAsync({
      name: newSemName.trim(),
      targetGpa: newSemGpa.trim() ? gpa : 0,
    });
    setCurrentSemesterId(id);
    setNewSemName('');
    setNewSemGpa('');
    setModalVisible(false);
  };

  return (
    <>
      <BackStep title="Edit Profile" onBack={() => { navigation.goBack(); }} />
      <Wrapper style={{ flex: 1 }}>
        <View >
          <View style={styles.card}>
            <View style={styles.avatar}>
              <SvgIcon name="user" size={100} color={Colors.tint} />
            </View>
            <Field
              label="Full name"
              placeholder="Your name"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
            />
            <Field
              label="University"
              placeholder="Your university"
              value={university}
              onChangeText={setUniversity}
            />
            <Field
              label="Department"
              placeholder="e.g. Computer Science & Engineering"
              value={department}
              onChangeText={setDepartment}
            />

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={{ paddingLeft: 8 }} type="defaultSemiBold">Current Semester</ThemedText>
                <Pressable onPress={() => setModalVisible(true)}>
                  <ThemedText style={styles.addText}>+ Add</ThemedText>
                </Pressable>
              </View>
              {semesters.length === 0 ? (
                <ThemedText style={styles.emptyText}>
                  No semesters yet. Create one to get started.
                </ThemedText>
              ) : (
                <ScrollView horizontal={true} contentContainerStyle={styles.semesterList} showsHorizontalScrollIndicator={false}>
                  {semesters.map((sem) => (
                    <View key={sem.id} style={styles.semesterRow}>
                      <Chip
                        label={sem.name}
                        selected={currentSemesterId === sem.id}
                        onPress={() => {
                          setCurrentSemesterId(sem.id);
                          activateSemester.mutateAsync(sem.id);
                        }}
                      />
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={styles.actions}>
              <Button title="Cancel" variant="ghost" onPress={handleCancel} />
              <Button title="Save" onPress={handleSave} loading={updateProfile.isPending} />
            </View>

            <Modal
              visible={modalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setModalVisible(false)}>
              <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                  <ThemedText type="subtitle" style={styles.modalTitle}>
                    New Semester
                  </ThemedText>
                  <Field
                    label="Semester name"
                    placeholder="e.g. Fall 2026"
                    value={newSemName}
                    onChangeText={setNewSemName}
                    error={newSemErrors.name}
                  />
                  <Field
                    label="Target GPA (optional)"
                    placeholder="e.g. 3.80"
                    keyboardType="numeric"
                    value={newSemGpa}
                    onChangeText={setNewSemGpa}
                    error={newSemErrors.targetGpa}
                  />
                  <View style={styles.modalButtons}>
                    <Button
                      title="Cancel"
                      variant="ghost"
                      onPress={() => {
                        setModalVisible(false);
                        setNewSemName('');
                        setNewSemGpa('');
                        setNewSemErrors({});
                      }}
                    />
                    <Button title="Create" onPress={handleCreateSemester} />
                  </View>
                </Pressable>
              </Pressable>
            </Modal>
          </View>
        </View>
      </Wrapper>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  avatar: {
    alignItems: 'center',
    marginBottom: 8
  },
  email: {
    opacity: 0.7,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingText: {
    opacity: 0.5,
  },
  infoGrid: {
    gap: 16,
    marginBottom: 28,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
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
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addText: {
    fontFamily: 'LatoSemiBold',
    color: Colors.tint,
  },
  semesterList: {
    gap: 8,
    flexDirection: 'row',
  },
  semesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#dc2626',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  emptyText: {
    opacity: 0.5,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 8,
  },
  signOut: {
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
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
