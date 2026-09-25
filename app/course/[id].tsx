import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SvgIcon } from '@/components/ui/SvgIcon';
import { Wrapper } from '@/components/ui/Wrapper';
import { Colors } from '@/constants/theme';
import { useAllCoursesAttendance } from '@/hooks/useAllCoursesAttendance';
import { useAssessments } from '@/hooks/useAssessments';
import { useCourses } from '@/hooks/useCourses';
import { ASSESSMENT_TYPE_LABELS } from '@/lib/constants';
import { courseProgress } from '@/lib/gpa';


export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { courses, isLoading: isCoursesLoading } = useCourses();
  const course = courses.find((c) => c.id === id);
  const { assessments, isLoading: isAssessmentsLoading, deleteAssessment } = useAssessments(id ?? '');
  const { courseAttendance } = useAllCoursesAttendance();

  const attendanceStats = courseAttendance.find((c) => c.course.id === id)?.stats;

  const { percent, max, obtained } = courseProgress(assessments, attendanceStats?.mark ?? 0);

  const handleDelete = (assessmentId: string, name: string) => {
    Alert.alert('Delete assessment', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteAssessment.mutate(assessmentId),
      },
    ]);
  };

  if (isCoursesLoading || isAssessmentsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.tint} />
        <ThemedText>Loading course…</ThemedText>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.centered}>
        <ThemedText>Course not found.</ThemedText>
      </View>
    );
  }

  return (
    <Wrapper style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText type="title">{course?.code}</ThemedText>
          <ThemedText style={styles.title}>{course?.title}</ThemedText>
          <ThemedText style={styles.meta}>{course?.credits} credits · {course?.ctWeight}% CT weight</ThemedText>
          {course?.courseTeachers && course.courseTeachers.length > 0 && (
            <ThemedText style={styles.meta}>Taught by {course.courseTeachers.join(', ')}</ThemedText>
          )}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <ThemedText type="subtitle">Overall progress</ThemedText>
            <ThemedText type="subtitle" style={styles.percent}>{percent}%</ThemedText>
          </View>
          <ProgressBar percent={percent} />
        </View>

        <View style={styles.row}>
          <ThemedText type="subtitle">Assessments</ThemedText>
          <Button
            title="+Add"
            variant="ghost"
            onPress={() => router.push(`/assessment/new?courseId=${course?.id}`)}
          />
        </View>

        {isAssessmentsLoading ? (
          <ThemedText>Loading assessments…</ThemedText>
        ) : assessments.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <SvgIcon name="empty" size={200} color={Colors.icon} />
            <ThemedText style={styles.meta}>No assessments yet. Add your first CT mark.</ThemedText>
            <Button
              style={{ marginTop: 10 }}
              title="+Add"
              variant="ghost"
              onPress={() => router.push(`/assessment/new?courseId=${course?.id}`)}
            />
          </View>
        ) : (
          assessments.map((a) => (
            <Pressable
              key={a.id}
              style={[styles.assessment, { borderColor: Colors.icon }]}
              onPress={() => router.push(`/assessment/new?courseId=${course?.id}&assessmentId=${a.id}`)}>
              <View style={styles.assessmentRow}>
                <View style={styles.assessmentInfo}>
                  <ThemedText type="defaultSemiBold">
                    {a.name} <ThemedText style={styles.meta}>· {ASSESSMENT_TYPE_LABELS[a.type]}</ThemedText>
                  </ThemedText>
                  <ThemedText style={styles.meta}>
                    {a.marksObtained} / {a.maxMarks} · weight {a.weight}% · {a.date}
                    {a.teacherName ? ` · ${a.teacherName}` : ''}
                  </ThemedText>
                </View>
                <Pressable onPress={() => handleDelete(a.id, a.name)} hitSlop={8}>
                  <SvgIcon size={20} name="trash" color="#e5484d" />
                </Pressable>
              </View>
            </Pressable>
          ))
        )}

        <Pressable
          style={[styles.attendanceLink, { marginTop: 24 }]}
          onPress={() => router.push('/(tabs)/attendance')}>
          <View>
            <ThemedText type="subtitle">Attendance</ThemedText>
            <ThemedText style={styles.meta}>
              {attendanceStats && attendanceStats.held > 0
                ? `${attendanceStats.percent}% · mark ${attendanceStats.mark}/10${!attendanceStats.eligible ? ' · below eligibility' : ''}`
                : 'No sessions recorded yet'}
            </ThemedText>
          </View>
          <ThemedText style={styles.chevron}>{'>'}</ThemedText>
        </Pressable>
      </ScrollView>
    </Wrapper >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    gap: 4,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    opacity: 0.8,
  },
  meta: {
    opacity: 0.6,
    fontSize: 14,
  },
  summary: {
    gap: 8,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percent: {
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  empty: {
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 8,
  },
  assessment: {
    borderWidth: 1,
    borderLeftWidth: 5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  assessmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assessmentInfo: {
    flex: 1,
    gap: 2,
  },
  attendanceLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  chevron: {
    opacity: 0.4,
    fontSize: 16,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
