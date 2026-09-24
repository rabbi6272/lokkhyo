import { GoogleAuthProvider, signInWithCredential, type User } from 'firebase/auth';
import { useCallback } from 'react';
import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from 'react-native-nitro-google-signin';

import { auth } from '@/lib/firebase';

GoogleOneTapSignIn.configure({ webClientId: "882450675886-0luhlvuahqt1idhhbj1enjd37a1iroaj.apps.googleusercontent.com" });

export function useGoogleSignIn() {
  const signInWithGoogle = useCallback(async (): Promise<User | null> => {
    await GoogleOneTapSignIn.checkPlayServices();

    let response = await GoogleOneTapSignIn.signIn();
    if (isNoSavedCredentialFoundResponse(response)) {
      console.log('No saved credentials found. Prompting user to create an account.');
      response = await GoogleOneTapSignIn.createAccount();
    }
    if (isNoSavedCredentialFoundResponse(response)) {
      console.log('No saved credentials found. Prompting user to sign in explicitly.');
      response = await GoogleOneTapSignIn.presentExplicitSignIn();
    }

    if (isCancelledResponse(response)) {
      return null;
    }
    if (!isSuccessResponse(response)) {
      return null;
    }

    const { idToken } = response.data;
    if (!idToken) {
      throw new Error('Google sign-in failed: missing ID token.');
    }

    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  }, []);

  return { signInWithGoogle };
}
