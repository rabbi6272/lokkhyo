import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Icons } from '@/constants/icons';
import { FontFamily, Palette, Radius, Space } from '@/constants/theme';

type FieldProps = TextInputProps & {
  label: string;
  error?: string | null;
  required?: boolean;
};

export function Field({ label, error, required, style, onFocus, onBlur, ...rest }: FieldProps) {
  const isPassword = Boolean(rest.secureTextEntry);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={styles.inputWrap}>
        <TextInput
          placeholderTextColor={Palette.faint}
          selectionColor={Palette.teal}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            { borderColor: error ? Palette.risk : focused ? Palette.teal : Palette.line },
            isPassword && styles.passwordInput,
            style,
          ]}
          {...rest}
          secureTextEntry={isPassword ? !passwordVisible : rest.secureTextEntry}
        />
        {isPassword && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
            hitSlop={8}
            onPress={() => setPasswordVisible((v) => !v)}
            style={styles.eyeToggle}>
            <SvgXml xml={passwordVisible ? Icons.EYE_OFF : Icons.EYE} width={18} height={18} />
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    marginBottom: Space.lg,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Palette.muted,
    paddingLeft: 2,
  },
  required: { color: Palette.risk },
  inputWrap: {
    position: 'relative',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    backgroundColor: Palette.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: Palette.ink,
  },
  passwordInput: {
    paddingRight: 44,
  },
  eyeToggle: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  error: {
    fontFamily: FontFamily.regular,
    color: Palette.risk,
    fontSize: 12,
    paddingLeft: 2,
  },
});
