import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StatusBar, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Space } from '@/constants/theme';

/** Page shell: mist background, safe area, side gutters, keyboard-aware. */
export function Wrapper({
  style,
  children,
  noTopMargin,
}: {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  noTopMargin?: boolean;
}) {
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView
        edges={noTopMargin ? ['left', 'right'] : ['top', 'left', 'right']}
        style={[styles.safe, { paddingTop: noTopMargin ? 0 : Space.md }, style]}>
        {children}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.mist },
  safe: { flex: 1, paddingHorizontal: Space.lg, backgroundColor: Palette.mist },
});
