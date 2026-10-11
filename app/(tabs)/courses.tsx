import { useQueries } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { CourseCard } from '@/components/CourseCard';
import { ThemedText } from '@/components/ThemedText';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Wrapper } from '@/components/ui/Wrapper';
import { Palette, Space } from '@/constants/theme';
import { useCourses } from '@/hooks/useCourses';
import { useSemesters } from '@/hooks/useSemesters';
import { useProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/providers/auth-provider';
import { courseAssessmentsQuery } from '@/services/assessments/assessments.hooks';

export default function CoursesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { courses, isLoading } = useCourses();
  const { semesters } = useSemesters();
  const { profileData } = useProfile();

  const progressQueries = useQueries({
    queries: courses.map((course) => courseAssessmentsQuery(user?.uid, course.id)),
  });

  const semester = semesters.find((s) => s.id === profileData?.currentSemesterId);
  const credits = courses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <Wrapper>
      <PageHeader
        eyebrow={semester ? semester.name : undefined}
        title="Courses"
        actions="/course/new"
        actionLabel="Add course"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color={Palette.teal} style={styles.loading} />
        ) : courses.length === 0 ? (
          <EmptyState
            title="No courses yet"
            body="Add a course to start tracking your CT marks."
            actionLabel="Add a course"
            onAction={() => router.push('/course/new')}
          />
        ) : (
          <>
            <View style={styles.summary}>
              <ThemedText type="caption">
                {courses.length} {courses.length === 1 ? 'course' : 'courses'} · {credits} credits
              </ThemedText>
              <ThemedText type="caption">Ring: CT progress · tick: pass mark</ThemedText>
            </View>
            {courses.map((course, index) => (
              <CourseCard key={course.id} course={course} assessments={progressQueries[index]?.data} />
            ))}
          </>
        )}
      </ScrollView>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: Space.xxl },
  loading: { marginTop: Space.xxl },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Space.md,
  },
});
