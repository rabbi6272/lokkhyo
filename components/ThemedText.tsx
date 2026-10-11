import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontFamily, Palette, Type } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  color?: string;
  type?:
    | 'default'
    | 'defaultSemiBold'
    | 'title'
    | 'normalTitle'
    | 'subtitle'
    | 'link'
    | 'heading'
    | 'caption'
    | 'eyebrow'
    | 'figure'
    | 'number';
};

/**
 * All app text. Types map onto the type scale in `constants/theme`; the older
 * names (`subtitle`, `defaultSemiBold`, …) are kept so existing screens follow.
 */
export function ThemedText({ style, color, type = 'default', ...rest }: ThemedTextProps) {
  return <Text style={[styles.base, styles[type], color ? { color } : undefined, style]} {...rest} />;
}

const styles = StyleSheet.create({
  base: { color: Palette.ink },
  default: Type.body,
  defaultSemiBold: Type.bodyStrong,
  title: Type.title,
  normalTitle: Type.title,
  subtitle: Type.heading,
  heading: Type.heading,
  caption: { ...Type.caption, color: Palette.muted },
  eyebrow: { ...Type.eyebrow, color: Palette.muted },
  figure: Type.figure,
  number: Type.number,
  link: { fontFamily: FontFamily.semibold, fontSize: 14, color: Palette.teal },
});
