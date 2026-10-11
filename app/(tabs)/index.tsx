import { useQueries } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AttendanceMeter } from '@/components/AttendanceMeter';
import { CourseCard } from '@/components/CourseCard';
import { ThemedText } from '@/components/ThemedText';
import { Card, Divider } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Wrapper } from '@/components/ui/Wrapper';
import { Palette, Radius, Space } from '@/constants/theme';
import { useAllCoursesAttendance } from '@/hooks/useAllCoursesAttendance';
import { useCourses } from '@/hooks/useCourses';
import { useRoutines } from '@/hooks/useRoutines';
import { useProfile } from '@/hooks/useUserProfile';
import { DAY_NAMES, MONTH_NAMES } from '@/lib/constants';
import { formatTime12h, getTodayOfWeek } from '@/lib/routine';
import { parseTime } from '@/lib/validate';
import { useAuth } from '@/providers/auth-provider';
import { courseAssessmentsQuery } from '@/services/assessments/assessments.hooks';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profileData } = useProfile();
  const { courses } = useCourses();
  const { slots } = useRoutines();
  const { courseAttendance } = useAllCoursesAttendance();

  const progressQueries = useQueries({
    queries: courses.map((course) => courseAssessmentsQuery(user?.uid, course.id)),
  });

  const firstName = profileData?.fullName?.split(' ')[0] || 'there';
  const now = new Date();
  const today = getTodayOfWeek();
  const todayLabel = `${DAY_NAMES[today]}, ${now.getDate()} ${MONTH_NAMES[now.getMonth()]}`;
  const todaySlots = slots
    .filter((s) => s.dayOfWeek === today)
    .sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
  const nextClass = findNextClass(slots);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <Wrapper>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PageHeader eyebrow={todayLabel} title={`Hello, ${firstName}`} />

        {nextClass ? (
          <View style={styles.hero} accessible accessibilityLabel={`Next class ${nextClass.courseLabel} ${nextClass.when} at ${nextClass.startTime}`}>
            <ThemedText type="eyebrow" color={Palette.tealOnDark}>
              NEXT CLASS · {nextClass.when.toUpperCase()}
            </ThemedText>
            <View style={styles.heroRow}>
              <ThemedText type="figure" color="#FFFFFF">
                {formatTime12h(nextClass.startTime)}
              </ThemedText>
              <ThemedText type="heading" color="#FFFFFF" style={styles.heroCourse} numberOfLines={1}>
                {nextClass.courseLabel}
              </ThemedText>
            </View>
            <ThemedText type="caption" color={Palette.tealOnDark}>
              Until {formatTime12h(nextClass.endTime)}
              {nextClass.room ? ` · Room ${nextClass.room}` : ''}
            </ThemedText>
          </View>
        ) : (
          <EmptyState
            title="No classes in your routine"
            body="Add your weekly classes to see what's next."
            actionLabel="Add a class"
            onAction={() => router.push('/routine/new')}
          />
        )}

        {todaySlots.length > 0 && (
          <>
            <SectionHeader title="Today" actionLabel="Routine" href="/routine" />
            <Card dense>
              {todaySlots.map((slot, index) => {
                const done = parseTime(slot.endTime) <= nowMinutes;
                return (
                  <View key={slot.id}>
                    {index > 0 && <Divider />}
                    <View style={[styles.slotRow, done && styles.done]}>
                      <ThemedText type="number" style={styles.slotTime}>
                        {formatTime12h(slot.startTime)}
                      </ThemedText>
                      <ThemedText type="defaultSemiBold" style={styles.flex} numberOfLines={1}>
                        {slot.courseLabel}
                      </ThemedText>
                      {slot.room ? <ThemedText type="caption">{slot.room}</ThemedText> : null}
                    </View>
                  </View>
                );
              })}
            </Card>
          </>
        )}

        <SectionHeader title="Courses" actionLabel="See all" href="/courses" />
        {courses.length === 0 ? (
          <EmptyState
            title="No courses yet"
            body="Add a course to start tracking CT marks."
            actionLabel="Add a course"
            onAction={() => router.push('/course/new')}
          />
        ) : (
          <Card dense style={styles.listCard}>
            {courses.slice(0, 3).map((course, index) => (
              <View key={course.id}>
                {index > 0 && <Divider />}
                <CourseCard course={course} assessments={progressQueries[index]?.data} inline />
              </View>
            ))}
          </Card>
        )}

        {courses.length > 0 && (
          <>
            <SectionHeader title="Attendance" actionLabel="See all" href="/attendance" />
            <Card dense style={styles.listCard}>
              {courses.slice(0, 3).map((course, index) => (
                <View key={course.id}>
                  {index > 0 && <Divider />}
                  <AttendanceMeter
                    code={course.code}
                    stats={courseAttendance.find((a) => a.course.id === course.id)?.stats}
                  />
                </View>
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </Wrapper>
  );
}

function findNextClass(slots: ReturnType<typeof useRoutines>['slots']) {
  if (slots.length === 0) return null;
  const now = new Date();
  const today = getTodayOfWeek();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (let offset = 0; offset < 7; offset++) {
    const dayIndex = (today + offset) % 7;
    const match = slots
      .filter((s) => s.dayOfWeek === dayIndex)
      .sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime))
      .find((s) => offset > 0 || parseTime(s.startTime) >= nowMinutes);
    if (match) {
      const when = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : DAY_NAMES[dayIndex];
      return { ...match, when };
    }
  }
  return null;
}

const styles = StyleSheet.create({
  content: { paddingBottom: Space.xxl },
  flex: { flex: 1 },
  hero: {
    backgroundColor: Palette.teal,
    borderRadius: Radius.lg,
    padding: Space.lg + 4,
    gap: Space.xs,
  },
  heroRow: { flexDirection: 'row', alignItems: 'baseline', gap: Space.md, marginTop: Space.xs },
  heroCourse: { flexShrink: 1 },
  listCard: { paddingVertical: 0 },
  slotRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md, paddingVertical: Space.md },
  slotTime: { width: 72, color: Palette.teal },
  done: { opacity: 0.45 },
});
