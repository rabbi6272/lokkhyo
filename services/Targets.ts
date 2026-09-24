import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from '@react-native-firebase/firestore';

import { db } from '@/lib/firebase';
import type { AcademicTarget } from '@/lib/types';

export function targetsRef(uid: string) {
  return collection(db, 'users', uid, 'targets');
}

export function targetRef(uid: string, targetId: string) {
  return doc(db, 'users', uid, 'targets', targetId);
}

export async function listTargets(uid: string): Promise<AcademicTarget[]> {
  const snapshot = await getDocs(query(targetsRef(uid), orderBy('createdAt', 'asc')));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AcademicTarget));
}

export type NewTarget = Omit<AcademicTarget, 'id' | 'createdAt'>;

export async function createTarget(uid: string, data: NewTarget) {
  const ref = await addDoc(targetsRef(uid), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateTarget(uid: string, targetId: string, data: Partial<AcademicTarget>) {
  await updateDoc(targetRef(uid, targetId), data);
}

export async function deleteTarget(uid: string, targetId: string) {
  await deleteDoc(targetRef(uid, targetId));
}
