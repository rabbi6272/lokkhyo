import { Image, StyleSheet, Text, View } from 'react-native';

import { SvgIcon } from '@/components/ui/SvgIcon';
import { Brand, Colors } from '@/constants/theme';

type AvatarProps = {
  /** Used for the initials fallback and the accessibility label. */
  name: string;
  photoUrl?: string | null;
  /** Diameter in dp. */
  size?: number;
  /**
   * `onTeal` renders on the brand masthead (translucent white circle, white
   * initials); `onPage` renders on a white or light surface.
   */
  tone?: 'onTeal' | 'onPage';
};

/** Up to two initials, e.g. "Tanvir Ahmed" → "TA". */
function getInitials(name?: string) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

/**
 * A student's photo, falling back to their initials and finally to a generic
 * icon. Both the profile and edit screens use it so the same person looks the
 * same everywhere.
 */
export function Avatar({ name, photoUrl, size = 60, tone = 'onPage' }: AvatarProps) {
  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        resizeMode="cover"
        accessibilityLabel={`${name}'s photo`}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: Colors.card }}
      />
    );
  }

  const initials = getInitials(name);

  return (
    <View
      accessibilityLabel={`${name}'s avatar`}
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tone === 'onTeal' ? 'rgba(255,255,255,0.16)' : Colors.card,
        },
      ]}>
      {initials ? (
        <Text
          style={{
            fontFamily: 'InterSemiBold',
            fontSize: size * 0.34,
            color: tone === 'onTeal' ? '#fff' : Colors.text,
          }}>
          {initials}
        </Text>
      ) : (
        <SvgIcon
          name="user"
          size={size * 0.46}
          color={tone === 'onTeal' ? Brand.accent : Colors.icon}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
