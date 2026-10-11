import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FontFamily, Palette, Radius, Space } from '@/constants/theme';

type SectionProps = {
  /** Eyebrow above the card, e.g. "Academic". Rendered in caps. */
  title: string;
  /** Trailing element on the title row — an action such as "+ Add". */
  action?: ReactNode;
  /** The card's contents; rows are expected to draw their own dividers. */
  children: ReactNode;
};

/**
 * A titled white surface on the page's light background.
 *
 * The one card shape the app's forms are built from, so the profile screen and
 * the edit screen read as the same product. Passing `action` puts a control on
 * the title row rather than inside the card, which keeps row dividers clean.
 */
export function Section({ title, action, children }: SectionProps) {
  return (
    <View style={styles.block}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {action}
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: Space.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.xs,
    marginBottom: Space.sm,
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: Palette.muted,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    paddingHorizontal: Space.lg,
    /** Just enough to keep a card's first row off the edge; rows and fields
     *  supply the rest of the vertical rhythm themselves. */
    paddingVertical: 2,
  },
});
