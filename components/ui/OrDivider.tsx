import { StyleSheet, Text, View } from 'react-native';

import { FontFamily, Palette } from '@/constants/theme';

export function OrDivider() {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.text}>or</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Palette.line,
    opacity: 0.4,
  },
  text: {
    fontSize: 13,
    color: Palette.faint,
    fontFamily: FontFamily.medium,
  },
});
