import { Link } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/InputField';
import { GoogleButton } from '@/components/ui/GoogleButton';
import { OrDivider } from '@/components/ui/OrDivider';
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';
import { signUp } from '@/services/Auth';
import { FirebaseError } from '@/services/FirebaseError';
import { createProfile, getProfile } from '@/services/Profile';
import { createSemester, listSemesters } from '@/services/Semesters';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const { signInWithGoogle } = useGoogleSignIn();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim() || password.length < 6) {
      setError('Name, valid email, and a password of at least 6 characters are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await signUp(email.trim(), password);
      await createProfile(user.uid, { fullName: fullName.trim() });
      await createSemester(user.uid, {
        name: 'Semester 1',
        targetGpa: 4,
        startDate: new Date().toISOString().slice(0, 10),
        totalWeeks: 13,
      });
    } catch (e) {
      setError(FirebaseError((e as any).code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const googleUser = await signInWithGoogle();
      if (!googleUser) return;

      const profile = await getProfile(googleUser.uid);
      if (!profile) {
        await createProfile(googleUser.uid, {
          fullName: googleUser.displayName ?? '',
        });
      }

      const semesters = await listSemesters(googleUser.uid);
      if (semesters.length === 0) {
        await createSemester(googleUser.uid, {
          name: 'Semester 1',
          targetGpa: 4,
          startDate: new Date().toISOString().slice(0, 10),
          totalWeeks: 13,
        });
      }
    } catch (e) {
      setError(FirebaseError((e as any)?.code ?? e));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={styles.wrapper} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <ThemedText type="title" style={styles.title}>
              Create account
            </ThemedText>
            <ThemedText type="subtitle" style={styles.subtitle}>
              Start tracking your academics
            </ThemedText>

            <Field
              required
              label="Full name"
              placeholder="Your name"
              autoComplete="name"
              value={fullName}
              onChangeText={setFullName}
            />
            <Field
              required
              label="Email"
              placeholder="you@example.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Field
              required
              label="Password"
              placeholder="At least 6 characters"
              secureTextEntry
              autoComplete="password-new"
              value={password}
              onChangeText={setPassword}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button title="Sign Up" onPress={handleSubmit} loading={loading} />

            <OrDivider />

            <GoogleButton onPress={handleGoogle} loading={googleLoading} />

            <ThemedText style={styles.footer}>
              Already have an account? <Link href="/login" style={styles.link}>Sign in</Link>
            </ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  wrapper: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f1f1f1',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  error: {
    color: '#e5484d',
    marginBottom: 12,
    paddingLeft: 8,
    fontSize: 13
  },
  footer: {
    marginTop: 24,
    textAlign: 'center',
  },
  link: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
});
