import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { SvgIcon } from '@/components/ui/SvgIcon';
import { Card } from '@/components/ui/Card';
import { Palette, Space } from '@/constants/theme';
import { courseProgress } from '@/lib/gpa';
import type { Assessment, Course } from '@/lib/types';

type CourseCardProps = {
  course: Course;
  assessments?: Assessment[];
  /** Render as a row inside a shared card instead of its own card. */
  inline?: boolean;
};

/**
 * A course at a glance: CT progress as a ring with the pass mark drawn on it,
 * so "am I safe?" reads before the number does.
 */
export function CourseCard({ course, assessments = [], inline }: CourseCardProps) {
  const router = useRouter();
  const { percent } = courseProgress(assessments);
  const target = course.passMarks > 0 ? course.passMarks : undefined;
  const color = target !== undefined && percent < target ? Palette.warn : Palette.teal;

  const body = (
    <View style={styles.row}>
      <ProgressRing percent={percent} target={target} color={color} size={48} />
      <View style={styles.text}>
        <View style={styles.titleRow}>
          <ThemedText type="defaultSemiBold">{course.code}</ThemedText>
          <ThemedText type="caption">{course.credits} cr</ThemedText>
        </View>
        <ThemedText type="caption" numberOfLines={1}>
          {course.title}
        </ThemedText>
      </View>
      <SvgIcon name="chevron" size={18} color={Palette.faint} />
    </View>
  );

  const open = () => router.push(`/course/${course.id}`);
  if (inline) {
    return (
      <Card onPress={open} style={styles.inline} accessibilityLabel={`${course.code}, ${percent}% CT progress`}>
        {body}
      </Card>
    );
  }
  return (
    <Card onPress={open} dense style={styles.card} accessibilityLabel={`${course.code}, ${percent}% CT progress`}>
      {body}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Space.sm },
  inline: { borderWidth: 0, borderRadius: 0, paddingHorizontal: 0, paddingVertical: Space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  text: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: Space.sm },
});
