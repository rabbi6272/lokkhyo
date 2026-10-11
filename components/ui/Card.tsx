import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Palette, Radius, Space } from '@/constants/theme';

type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Tighter padding for list-like cards. */
  dense?: boolean;
  accessibilityLabel?: string;
};

/** The app's one surface: white, hairline border, no shadow. */
export function Card({ children, onPress, style, dense, accessibilityLabel }: CardProps) {
  const body = [styles.card, dense && styles.dense, style];
  if (!onPress) return <View style={body}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [body, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

/** A hairline between rows inside a card. */
export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    padding: Space.lg,
  },
  dense: { paddingVertical: Space.md },
  pressed: { backgroundColor: '#FAFBFB' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Palette.line },
});
