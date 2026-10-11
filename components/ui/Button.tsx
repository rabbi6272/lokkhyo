import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { FontFamily, Palette, Radius } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  style?: ViewStyle;
};

const FILL: Record<Variant, string> = {
  primary: Palette.teal,
  secondary: Palette.tealSoft,
  ghost: 'transparent',
  destructive: Palette.risk,
};

const LABEL: Record<Variant, string> = {
  primary: '#FFFFFF',
  secondary: Palette.teal,
  ghost: Palette.teal,
  destructive: '#FFFFFF',
};

/**
 * Primary is the one main action on a screen; secondary sits beside it;
 * ghost is an inline text action ("Add", "See all"); destructive deletes.
 */
export function Button({ title, onPress, loading, disabled, variant = 'primary', style }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      hitSlop={variant === 'ghost' ? 10 : undefined}
      style={({ pressed }) => [
        variant === 'ghost' ? styles.ghost : styles.base,
        { backgroundColor: FILL[variant] },
        pressed && !isDisabled && (variant === 'ghost' ? styles.ghostPressed : styles.pressed),
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={LABEL[variant]} />
      ) : (
        <Text style={[styles.label, { color: LABEL[variant] }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: Radius.pill,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
  ghostPressed: { opacity: 0.6 },
  disabled: { opacity: 0.45 },
  label: { fontFamily: FontFamily.semibold, fontSize: 15 },
});
