import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { SvgIcon } from '@/components/ui/SvgIcon';
import { Card } from '@/components/ui/Card';
import { Palette, Radius, Space } from '@/constants/theme';
import { courseProgress } from '@/lib/gpa';
import type { Assessment, Course } from '@/lib/types';
import { formatGpa } from '@/services/grades/grades.services';
import type { ResultDto, ResultStatusDto } from '@/services/grades/grades.types';

type CourseCardProps = {
  course: Course;
  assessments?: Assessment[];
  /**
   * The course's official results. When the server has graded the course, its
   * letter grade takes the mark slot and the CT ring steps aside — the grade is
   * the authoritative figure, the ring is only coursework-in-progress.
   */
  results?: ResultDto[];
  /** Render as a row inside a shared card instead of its own card. */
  inline?: boolean;
};

/**
 * A course at a glance. Ungraded: CT progress as a ring with the pass mark
 * drawn on it, so "am I safe?" reads before the number does. Graded: the letter
 * grade the server's GPA engine recorded, with the grade point and percentage
 * under the title.
 */
export function CourseCard({ course, assessments = [], results, inline }: CourseCardProps) {
  const router = useRouter();

  const graded = results?.find((r) => r.isLatestAttempt);
  const { percent } = courseProgress(assessments);
  const target = course.passMarks > 0 ? course.passMarks : undefined;
  const belowTarget = target !== undefined && percent < target;
  const backlog = graded?.status === 'BACKLOG';
  const color = backlog ? Palette.risk : graded ? Palette.good : belowTarget ? Palette.warn : Palette.teal;

  const accessibilityLabel = graded
    ? `${course.code}, ${graded.letterGrade}, ${formatGpa(graded.gradePoint)} grade point`
    : `${course.code}, ${percent}% CT progress`;

  const body = (
    <View style={styles.row}>
      {graded ? (
        <GradeBadge letterGrade={graded.letterGrade} status={graded.status} />
      ) : (
        <ProgressRing percent={percent} target={target} color={color} size={48} />
      )}
      <View style={styles.text}>
        <View style={styles.titleRow}>
          <ThemedText type="defaultSemiBold">{course.code}</ThemedText>
          <ThemedText type="caption">{course.credits} cr</ThemedText>
        </View>
        <ThemedText type="caption" numberOfLines={1}>
          {course.title}
        </ThemedText>
        {graded && (
          <ThemedText type="caption" color={backlog ? Palette.risk : Palette.muted}>
            {formatGpa(graded.gradePoint)} GP · {graded.percentage}%
            {graded.attempt > 1 ? ` · attempt ${graded.attempt}` : ''}
          </ThemedText>
        )}
      </View>
      <SvgIcon name="chevron" size={18} color={Palette.faint} />
    </View>
  );

  const open = () => router.push(`/course/${course.id}`);
  if (inline) {
    return (
      <Card onPress={open} style={styles.inline} accessibilityLabel={accessibilityLabel}>
        {body}
      </Card>
    );
  }
  return (
    <Card onPress={open} dense style={styles.card} accessibilityLabel={accessibilityLabel}>
      {body}
    </Card>
  );
}

/**
 * The graded course's mark. Sits in the ring's 48px slot so a list stays even,
 * but says what was recorded rather than how far along it is.
 */
function GradeBadge({ letterGrade, status }: { letterGrade: string; status: ResultStatusDto }) {
  const failed = status !== 'PASSED';
  return (
    <View
      style={[styles.badge, { backgroundColor: failed ? Palette.riskSoft : Palette.tealSoft }]}
      accessible
      accessibilityLabel={`Grade ${letterGrade}`}>
      <ThemedText type="number" color={failed ? Palette.risk : Palette.teal}>
        {letterGrade}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Space.sm },
  inline: { borderWidth: 0, borderRadius: 0, paddingHorizontal: 0, paddingVertical: Space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  text: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: Space.sm },
  badge: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
