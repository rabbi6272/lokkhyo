import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Palette, Radius, Space } from '@/constants/theme';
import { SvgIcon } from './SvgIcon';

type PageHeaderProps = {
  title: string;
  /** One line of real context above the title: today's date, the semester. */
  eyebrow?: string;
  /** Route of the screen's add action, shown as a round + button. */
  actions?: Href;
  /** Kept for older callers; the add button always shows a plus. */
  icon?: string;
  /** Accessible name of the add button. */
  actionLabel?: string;
  /** @deprecated No longer rendered. */
  helloWave?: boolean;
};

export function PageHeader({ title, eyebrow, actions, actionLabel = 'Add' }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.text}>
        {eyebrow ? <ThemedText type="eyebrow">{eyebrow.toUpperCase()}</ThemedText> : null}
        <ThemedText type="title" numberOfLines={1}>
          {title}
        </ThemedText>
      </View>
      {actions && (
        <Link href={actions} asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            hitSlop={6}
            style={({ pressed }) => [styles.add, pressed && { backgroundColor: Palette.tealDeep }]}>
            <SvgIcon name="plus" size={20} color="#FFFFFF" />
          </Pressable>
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: Space.sm,
    paddingBottom: Space.lg,
  },
  text: { flex: 1, gap: 2 },
  add: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Palette.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
