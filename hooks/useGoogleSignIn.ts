import { GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useCallback } from 'react';
import { Platform } from 'react-native';

import { auth, type User } from '@/lib/firebase';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export function useGoogleSignIn() {
  const signInWithGoogle = useCallback(async (): Promise<User | null> => {
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    const silent = await GoogleSignin.signInSilently();
    const response = silent.type === 'success' ? silent : await GoogleSignin.signIn();

    if (response.type !== 'success') {
      return null;
    }

    let idToken = response.data.idToken;
    if (!idToken) {
      idToken = (await GoogleSignin.getTokens()).idToken;
    }
    if (!idToken) {
      throw new Error('Google sign-in failed: missing ID token.');
    }

    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  }, []);

  return { signInWithGoogle };
}
