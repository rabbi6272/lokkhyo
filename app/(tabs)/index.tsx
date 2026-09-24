import { useQueries } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useCourses } from '@/hooks/useCourses';
import { useRoutines } from '@/hooks/useRoutines';
import { useProfile } from '@/hooks/useUserProfile';

import { CourseCard } from '@/components/CourseCard';
import { ThemedText } from '@/components/ThemedText';
import { PageHeader } from '@/components/ui/PageHeader';
import { Wrapper } from '@/components/ui/Wrapper';

import { SvgIcon } from '@/components/ui/SvgIcon';
import { Colors } from '@/constants/theme';
import { useAllCoursesAttendance } from '@/hooks/useAllCoursesAttendance';
import { DAY_NAMES } from '@/lib/constants';
import { parseTime } from '@/lib/validate';
import { useAuth } from '@/providers/auth-provider';
import { listAssessments } from '@/services/Assessments';

export default function HomeScreen() {
  const { user } = useAuth();
  const { profileData } = useProfile();
  const { courses } = useCourses();
  const { slots } = useRoutines();
  const { courseAttendance, sessionsByDate, overall, isLoading } = useAllCoursesAttendance();


  const progressQueries = useQueries({
    queries: courses.map((course) => ({
      queryKey: ['assessments', course.id],
      queryFn: () => (user ? listAssessments(user.uid, course.id) : []),
      enabled: !!user && !!course.id,
    })),
  });

  const firstName = profileData?.fullName?.split(' ')[0] ?? 'Student';

  const nextClass = findNextClass(slots);


  return (
    <Wrapper style={styles.safe}>
      <PageHeader title={`Hello, ${firstName}`} />
      <ScrollView contentContainerStyle={styles.content}>
        {nextClass ? (
          <View style={styles.nextClass}>
            <ThemedText style={styles.label}>NEXT CLASS</ThemedText>
            <ThemedText type="subtitle" style={styles.nextClassTitle}>
              {nextClass.courseLabel}
            </ThemedText>
            <ThemedText style={styles.nextClassMeta}>
              {nextClass.startTime} – {nextClass.endTime}
              {nextClass.room ? ` · ${nextClass.room}` : ''}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.sectionRow}>
          <ThemedText type="subtitle">CT Progress</ThemedText>
          <Link href="/courses" style={styles.seeAll}>See all</Link>
        </View>

        {courses.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <SvgIcon name="empty" size={200} color={Colors.icon} />
            <ThemedText style={styles.meta}>No courses yet. Add one from the Courses tab.</ThemedText>
          </View>
        ) : (
          courses.slice(0, 3).map((course, index) => (
            <CourseCard key={course.id} course={course} assessments={progressQueries[index]?.data} />
          ))
        )}

        <View style={styles.sectionRow}>
          <ThemedText type="subtitle">Routine</ThemedText>
          <Link href="/routine" style={styles.seeAll}>See all</Link>
        </View>

        {slots.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <SvgIcon name="empty" size={200} color={Colors.icon} />
            <ThemedText style={styles.meta}>No routine yet. Add one from the Routine tab.</ThemedText>
          </View>
        ) : (
          slots.slice(0, 3).map((slot) => (
            <View key={`${slot.dayOfWeek}-${slot.startTime}`} style={styles.targetRow}>
              <ThemedText>{DAY_NAMES[slot.dayOfWeek]} {slot.startTime} – {slot.endTime}</ThemedText>
              <ThemedText>{slot.courseLabel}</ThemedText>
            </View>
          ))
        )}

        <View style={styles.sectionRow}>
          <ThemedText type="subtitle">Attendance</ThemedText>
          <Link href="/attendance" style={styles.seeAll}>See all</Link>
        </View>
        {courses.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <SvgIcon name="empty" size={200} color={Colors.icon} />
            <ThemedText style={styles.meta}>No attendance data yet. Add courses and sessions to track attendance.</ThemedText>
          </View>
        ) : (
          courses.slice(0, 3).map((course) => (
            <View key={course.id} style={styles.attendanceRow}>
              <View style={{ ...styles.targetRow, marginBottom: 2 }}>
                <ThemedText type='defaultSemiBold'>{course.code}</ThemedText>
                <ThemedText>
                  {courseAttendance.find((attendance) => attendance.course.id === course.id)?.stats.percent + "%" || 'N/A'}
                </ThemedText>
              </View>
              <ThemedText>{course.title}</ThemedText>
            </View>
          ))
        )}
      </ScrollView>
    </Wrapper>
  );
}

function findNextClass(slots: ReturnType<typeof useRoutines>['slots']) {
  if (slots.length === 0) return null;
  const now = new Date();
  const today = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (let offset = 0; offset < 7; offset++) {
    const dayIndex = (today + offset) % 7;
    const daySlots = slots
      .filter((s) => s.dayOfWeek === dayIndex)
      .sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
    const match = daySlots.find((s) => {
      if (offset === 0) return parseTime(s.startTime) >= nowMinutes;
      return true;
    });
    if (match) {
      return { ...match, day: DAY_NAMES[dayIndex], offset };
    }
  }
  return null;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingVertical: 20,
  },
  greeting: {
    marginBottom: 2,
  },
  subGreeting: {
    opacity: 0.7,
    marginBottom: 20,
  },
  nextClass: {
    backgroundColor: '#0a7ea4',
    borderRadius: 14,
    padding: 16,
    gap: 4,
    marginBottom: 24,
  },
  label: {
    color: '#e6f4fe',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  nextClassTitle: {
    color: '#fff',
  },
  nextClassMeta: {
    color: '#e6f4fe',
    fontSize: 14,
  },
  meta: {
    opacity: 0.6,
    fontSize: 14,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  seeAll: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  target: {
    marginBottom: 12,
    gap: 6,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceRow: {
    flexDirection: 'column',
    paddingVertical: 12,
    borderWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 5,
    borderColor: Colors.icon,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
});
