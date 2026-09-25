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
import type { Assessment } from '@/lib/types';

export function assessmentsRef(uid: string, courseId: string) {
  return collection(db, 'users', uid, 'courses', courseId, 'assessments');
}

export function assessmentRef(uid: string, courseId: string, assessmentId: string) {
  return doc(db, 'users', uid, 'courses', courseId, 'assessments', assessmentId);
}

export async function listAssessments(uid: string, courseId: string): Promise<Assessment[]> {
  const snapshot = await getDocs(
    query(assessmentsRef(uid, courseId), orderBy('createdAt', 'asc')),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Assessment));
}

export type NewAssessment = Omit<Assessment, 'id' | 'createdAt'>;

export async function createAssessment(uid: string, courseId: string, data: NewAssessment) {
  const ref = await addDoc(assessmentsRef(uid, courseId), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateAssessment(
  uid: string,
  courseId: string,
  assessmentId: string,
  data: Partial<Assessment>,
) {
  await updateDoc(assessmentRef(uid, courseId, assessmentId), data);
}

export async function deleteAssessment(uid: string, courseId: string, assessmentId: string) {
  await deleteDoc(assessmentRef(uid, courseId, assessmentId));
}
