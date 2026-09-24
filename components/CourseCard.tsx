import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors } from '@/constants/theme';
import { courseProgress } from '@/lib/gpa';
import type { Assessment, Course } from '@/lib/types';

type CourseCardProps = {
  course: Course;
  assessments?: Assessment[];
};

export function CourseCard({ course, assessments = [] }: CourseCardProps) {
  const router = useRouter();
  const progress = courseProgress(assessments);

  return (
    <Pressable
      onPress={() => router.push(`/course/${course.id}`)}
      style={({ pressed }) => [styles.card, { borderColor: Colors.icon }, pressed && styles.pressed]}>
      <View style={styles.row}>
        <ThemedText type="defaultSemiBold">{course.code}</ThemedText>
        <ThemedText style={styles.credits}>{course.credits} cr</ThemedText>
      </View>
      <ThemedText style={styles.title} numberOfLines={1}>
        {course.title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderLeftWidth: 5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  credits: {
    opacity: 0.6,
    fontSize: 14,
  },
  title: {
    opacity: 0.8,
  }
});
