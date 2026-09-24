import { doc, getDoc, setDoc, serverTimestamp, deleteDoc } from '@react-native-firebase/firestore';

import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';

export function profileRef(uid: string) {
  return doc(db, 'users', uid);
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(profileRef(uid));
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserProfile;
}

export async function createProfile(uid: string, data: Partial<UserProfile>) {
  await setDoc(
    profileRef(uid),
    { ...data, createdAt: serverTimestamp() },
    { merge: true },
  );
}

export async function updateProfile(uid: string, data: Partial<UserProfile>) {
  await setDoc(profileRef(uid), data, { merge: true });
}

export async function deleteProfile(uid: string) {
  await deleteDoc(profileRef(uid));
}
