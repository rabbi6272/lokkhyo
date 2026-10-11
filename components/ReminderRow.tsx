import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { SvgIcon } from '@/components/ui/SvgIcon';
import { FontFamily, Palette, Radius, Space } from '@/constants/theme';
import { ASSESSMENT_TYPE_LABELS, MONTH_NAMES } from '@/lib/constants';
import type { AssessmentType } from '@/lib/types';

type ReminderRowProps = {
  name: string;
  type: AssessmentType;
  /** `YYYY-MM-DD`. */
  date: string;
  /** Course code, shown when the list mixes courses. */
  courseCode?: string;
  /** When the local notification fires, if one is scheduled. */
  reminderLine?: string | null;
  highlighted?: boolean;
  onPress: () => void;
  onDelete: () => void;
};

/** An upcoming CT/quiz/assignment: a date tile, what it is, when you'll be reminded. */
export function ReminderRow({ name, type, date, courseCode, reminderLine, highlighted, onPress, onDelete }: ReminderRowProps) {
  const [, month, day] = date.split('-').map(Number);
  const daysLeft = daysUntil(date);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${ASSESSMENT_TYPE_LABELS[type]}, ${date}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, highlighted && styles.highlighted, pressed && { opacity: 0.7 }]}>
      <View style={[styles.tile, daysLeft <= 2 && daysLeft >= 0 && styles.tileSoon]}>
        <ThemedText style={[styles.tileDay, daysLeft <= 2 && daysLeft >= 0 && { color: Palette.warn }]}>{day}</ThemedText>
        <ThemedText style={styles.tileMonth}>{MONTH_NAMES[month - 1]?.slice(0, 3).toUpperCase()}</ThemedText>
      </View>
      <View style={styles.text}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
          {name}
        </ThemedText>
        <ThemedText type="caption" numberOfLines={1}>
          {ASSESSMENT_TYPE_LABELS[type]}
          {courseCode ? ` · ${courseCode}` : ''} · {relativeDay(daysLeft)}
        </ThemedText>
        {reminderLine ? (
          <ThemedText type="caption" color={Palette.teal} numberOfLines={1}>
            {reminderLine}
          </ThemedText>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete ${name}`}
        onPress={onDelete}
        hitSlop={10}>
        <SvgIcon size={18} name="trash" color={Palette.faint} />
      </Pressable>
    </Pressable>
  );
}

function daysUntil(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - today) / 86_400_000);
}

function relativeDay(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days < 0) return `${-days} ${days === -1 ? 'day' : 'days'} ago`;
  return `in ${days} days`;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Space.md, paddingVertical: Space.md },
  highlighted: { backgroundColor: Palette.tealSoft, borderRadius: Radius.md, marginHorizontal: -Space.sm, paddingHorizontal: Space.sm },
  tile: {
    width: 46,
    height: 50,
    borderRadius: Radius.sm,
    backgroundColor: Palette.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileSoon: { backgroundColor: Palette.warnSoft },
  tileDay: { fontFamily: FontFamily.display, fontSize: 18, lineHeight: 22, color: Palette.ink },
  tileMonth: { fontFamily: FontFamily.semibold, fontSize: 10, letterSpacing: 0.8, color: Palette.muted },
  text: { flex: 1, gap: 1 },
});
