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

import { ThemedText } from '@/components/ThemedText';
import { Icons } from '@/constants/icons';
import { Colors } from '@/constants/theme';

type FieldProps = TextInputProps & {
  label: string;
  error?: string | null;
  required?: boolean;
};

export function Field({ label, error, required, style, ...rest }: FieldProps) {
  const isPassword = Boolean(rest.secureTextEntry);
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={[styles.container]}>
      <ThemedText type="defaultSemiBold" style={{ paddingLeft: 8 }}>
        {label}{required && <Text style={{ color: '#e5484d' }}> * </Text>}
      </ThemedText>
      <View style={styles.inputWrap}>
        <TextInput
          placeholderTextColor={Colors.icon}
          style={[
            styles.input,
            { borderColor: error ? '#e5484d' : Colors.icon, color: Colors.text },
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
            <SvgXml
              xml={passwordVisible ? Icons.EYE_OFF : Icons.EYE}
              width={18}
              height={18}
            />
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
    marginBottom: 14,
  },
  inputWrap: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '500'
  },
  passwordInput: {
    paddingRight: 44,
  },
  eyeToggle: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  error: {
    color: '#e5484d',
    fontSize: 11,
  },
});
