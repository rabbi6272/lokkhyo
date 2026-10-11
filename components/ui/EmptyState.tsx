import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Palette, Radius, Space } from '@/constants/theme';
import { Button } from './Button';

type EmptyStateProps = {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** What to do next when a list is empty: a dashed card with one action. */
export function EmptyState({ title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.box}>
      <ThemedText type="defaultSemiBold" style={styles.center}>
        {title}
      </ThemedText>
      {body ? (
        <ThemedText type="caption" style={styles.center}>
          {body}
        </ThemedText>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} variant="secondary" onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Palette.line,
    paddingVertical: Space.xl,
    paddingHorizontal: Space.lg,
    alignItems: 'center',
    gap: Space.xs,
  },
  center: { textAlign: 'center' },
  action: { marginTop: Space.md, minHeight: 40 },
});
