import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
  where,
  query,
} from '@react-native-firebase/firestore';

import { db } from '@/lib/firebase';
import type { Semester } from '@/lib/types';

export function semestersRef(uid: string) {
  return collection(db, 'users', uid, 'semesters');
}

export function semesterRef(uid: string, semesterId: string) {
  return doc(db, 'users', uid, 'semesters', semesterId);
}

export async function listSemesters(uid: string): Promise<Semester[]> {
  const snapshot = await getDocs(semestersRef(uid));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Semester));
}

export async function getActiveSemester(uid: string): Promise<Semester | null> {
  const snapshot = await getDocs(query(semestersRef(uid), where('status', '==', 'active')));
  const match = snapshot.docs[0];
  return match ? ({ id: match.id, ...match.data() } as Semester) : null;
}

export async function createSemester(
  uid: string,
  data: Pick<Semester, 'name' | 'targetGpa' | 'startDate' | 'totalWeeks'>,
) {
  const ref = await addDoc(semestersRef(uid), {
    ...data,
    status: 'active',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateSemester(
  uid: string,
  semesterId: string,
  data: Partial<Semester>,
) {
  await updateDoc(semesterRef(uid, semesterId), data);
}

export async function deleteSemester(uid: string, semesterId: string) {
  await deleteDoc(semesterRef(uid, semesterId));
}

export async function activateSemester(uid: string, semesterId: string) {
  const snapshot = await getDocs(semestersRef(uid));
  const batch = snapshot.docs.map((d) =>
    updateDoc(semesterRef(uid, d.id), { status: d.id === semesterId ? 'active' : 'inactive' }),
  );
  await Promise.all(batch);
}
