import { StyleSheet, Text, type TextProps } from 'react-native';


export type ThemedTextProps = TextProps & {
  color?: string;
  type?: 'default' | 'title' | 'normalTitle' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  color,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: 'InterRegular',
    fontSize: 14,
    lineHeight: 20,
  },
  defaultSemiBold: {
    fontFamily: 'InterSemiBold',
    fontSize: 15,
    lineHeight: 20,
  },
  title: {
    fontFamily: 'InterSemiBold',
    fontSize: 28,
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 16,
  },
  link: {
    fontFamily: 'LatoRegular',
    lineHeight: 20,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
