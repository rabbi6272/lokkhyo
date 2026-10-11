import { Link, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { GoogleButton } from '@/components/ui/GoogleButton';
import { OrDivider } from '@/components/ui/OrDivider';
import { Brand, FontFamily, Palette } from '@/constants/theme';

interface AuthScreenLayoutProps {
  title: string;
  subtitle: string;
  /** Inline error shown between the fields and the submit button. */
  error?: string;
  /** The form fields, rendered above the error and the buttons. */
  children: ReactNode;
  submitLabel: string;
  submitLoading?: boolean;
  onSubmit: () => void;
  googleLoading?: boolean;
  onGoogle: () => void;
  footerPrompt: string;
  footerLinkLabel: string;
  footerLinkHref: Href;
}

/**
 * The shared shell for the login and sign-up screens.
 *
 * No card: a deep-teal masthead carries the wordmark and the screen's heading,
 * and the form sits directly on the page below it. The color block is the one
 * deliberate accent — everything under it stays quiet (white, black buttons,
 * grey secondary text) so the two screens read as one product, not two forms.
 */
export function AuthScreenLayout({
  title,
  subtitle,
  error,
  children,
  submitLabel,
  submitLoading,
  onSubmit,
  googleLoading,
  onGoogle,
  footerPrompt,
  footerLinkLabel,
  footerLinkHref,
}: AuthScreenLayoutProps) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView edges={['top']} style={styles.masthead}>
        <View style={styles.mastheadInner}>
          <Text style={styles.eyebrow}>LOKKHYO</Text>
          <Text style={styles.headline}>{title}</Text>
          <Text style={styles.lede}>{subtitle}</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled">
        {children}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title={submitLabel} onPress={onSubmit} loading={submitLoading} />

        <OrDivider />

        <GoogleButton onPress={onGoogle} loading={googleLoading} />

        <ThemedText style={styles.footer}>
          {footerPrompt}{' '}
          <Link href={footerLinkHref} style={styles.link}>
            {footerLinkLabel}
          </Link>
        </ThemedText>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Palette.surface,
  },
  masthead: {
    backgroundColor: Brand.teal,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  mastheadInner: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
  },
  eyebrow: {
    fontFamily: 'InterSemiBold',
    fontSize: 12,
    letterSpacing: 3,
    color: Brand.accent,
  },
  headline: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
    color: '#FFFFFF',
    marginTop: 14,
  },
  lede: {
    fontFamily: 'InterRegular',
    fontSize: 15,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.88)',
    marginTop: 6,
  },
  form: {
    flex: 1,
    backgroundColor: Palette.surface,
  },
  formContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
  },
  error: {
    color: Palette.risk,
    fontSize: 13,
    marginBottom: 14,
    paddingLeft: 4,
  },
  footer: {
    marginTop: 24,
    color: Palette.muted,
    fontSize: 14,
  },
  link: {
    color: Palette.teal,
    fontFamily: FontFamily.semibold,
  },
});
