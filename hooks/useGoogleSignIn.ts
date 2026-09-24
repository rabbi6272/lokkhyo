import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential, type User } from 'firebase/auth';
import { useCallback } from 'react';

import { auth } from '@/lib/firebase';

export function useGoogleSignIn() {
  const [, , promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    selectAccount: true,
  });

  const signInWithGoogle = useCallback(async (): Promise<User | null> => {
    const result = await promptAsync();

    if (result.type === 'error') {
      throw new Error(result.error?.message ?? 'Google sign-in failed.');
    }
    if (result.type !== 'success') {
      return null;
    }

    const idToken = result.params?.id_token;
    if (!idToken) {
      throw new Error('Google sign-in failed: missing ID token.');
    }

    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  }, [promptAsync]);

  return { signInWithGoogle };
}
