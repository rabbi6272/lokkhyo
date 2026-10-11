import { Pressable, StyleSheet, Text } from 'react-native';

import { FontFamily, Palette, Radius } from '@/constants/theme';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

/** A selectable pill: a day, a semester, a course. */
export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.idle,
        pressed && { opacity: 0.8 },
      ]}>
      <Text style={[styles.label, { color: selected ? '#FFFFFF' : Palette.ink }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    height: 36,
    justifyContent: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  idle: { backgroundColor: Palette.surface, borderColor: Palette.line },
  selected: { backgroundColor: Palette.teal, borderColor: Palette.teal },
  label: { fontFamily: FontFamily.medium, fontSize: 14 },
});
