import { useQueries } from '@tanstack/react-query';
import type { ExternalPathString } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CourseCard } from '@/components/CourseCard';
import { ThemedText } from '@/components/ThemedText';
import { Wrapper } from '@/components/ui/Wrapper';
import { PageHeader } from '@/components/ui/PageHeader';

import { useCourses } from '@/hooks/useCourses';
import { useAuth } from '@/providers/auth-provider';
import { listAssessments } from '@/services/Assessments';

export default function CoursesScreen() {
  const { user } = useAuth();
  const { courses, isLoading } = useCourses();

  const progressQueries = useQueries({
    queries: courses.map((course) => ({
      queryKey: ['assessments', course.id],
      queryFn: () => (user ? listAssessments(user.uid, course.id) : []),
      enabled: !!user && !!course.id,
    })),
  });

  return (
    <Wrapper>
      <PageHeader
        title="Courses"
        actions={'/course/new' as ExternalPathString}
        icon="circleAdd"
      />

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <ThemedText>Loading courses…</ThemedText>
        ) : courses.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText type="subtitle">No courses yet</ThemedText>
            <ThemedText style={styles.emptyText}>
              Add a course to start tracking your CT marks.
            </ThemedText>
          </View>
        ) : (
          courses.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              assessments={progressQueries[index]?.data}
            />
          ))
        )}
      </ScrollView>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingVertical: 20,
  },
  empty: {
    alignItems: 'center',
    marginTop: 80,
    gap: 8,
  },
  emptyText: {
    opacity: 0.7,
    textAlign: 'center',
  },
});
