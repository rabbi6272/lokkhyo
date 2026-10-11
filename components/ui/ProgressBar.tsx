import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Palette } from '@/constants/theme';

type ProgressBarProps = {
  percent: number;
  color?: string;
  /** Where the target line sits, 0–100 — e.g. 60 for the attendance mark. */
  target?: number;
};

/**
 * A thin bar that fills to `percent`. With `target`, a small tick marks the
 * line the student is aiming for, so the bar reads as "how far from the
 * target", not just "how full".
 */
export function ProgressBar({ percent, color = Palette.teal, target }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(clamped, { duration: 700 });
  }, [clamped, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
      style={styles.wrap}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle, { backgroundColor: color }]} />
      </View>
      {target !== undefined && <View style={[styles.tick, { left: `${Math.min(100, Math.max(0, target))}%` }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 12, justifyContent: 'center' },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: Palette.line,
  },
  fill: { height: '100%', borderRadius: 3 },
  tick: {
    position: 'absolute',
    width: 2,
    height: 12,
    marginLeft: -1,
    borderRadius: 1,
    backgroundColor: Palette.ink,
  },
});
