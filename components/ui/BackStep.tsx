import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FontFamily, Palette, Radius, Space } from '@/constants/theme';
import { SvgIcon } from './SvgIcon';

/** Top bar of a pushed screen: a round back button and the screen's name. */
export function BackStep({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.content}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={onBack}
            hitSlop={8}
            style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}>
            <SvgIcon name="arrowLeft" size={20} color={Palette.ink} />
          </Pressable>
        ) : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', backgroundColor: Palette.mist },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    height: 56,
    paddingHorizontal: Space.lg,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: Palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, fontFamily: FontFamily.display, fontSize: 18, color: Palette.ink },
});
