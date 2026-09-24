import { GoogleAuthProvider, signInWithCredential, type User } from 'firebase/auth';
import { useCallback } from 'react';
import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from 'react-native-nitro-google-signin';

import { auth } from '@/lib/firebase';

GoogleOneTapSignIn.configure({ webClientId: 'autoDetect' });

export function useGoogleSignIn() {
  const signInWithGoogle = useCallback(async (): Promise<User | null> => {
    await GoogleOneTapSignIn.checkPlayServices();

    let response = await GoogleOneTapSignIn.signIn();
    if (isNoSavedCredentialFoundResponse(response)) {
      response = await GoogleOneTapSignIn.createAccount();
    }
    if (isNoSavedCredentialFoundResponse(response)) {
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
