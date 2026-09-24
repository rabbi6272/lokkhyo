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
import type { Course } from '@/lib/types';

export function coursesRef(uid: string) {
  return collection(db, 'users', uid, 'courses');
}

export function courseRef(uid: string, courseId: string) {
  return doc(db, 'users', uid, 'courses', courseId);
}

export async function listCourses(uid: string): Promise<Course[]> {
  const snapshot = await getDocs(query(coursesRef(uid), orderBy('createdAt', 'asc')));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Course));
}

export type NewCourse = Omit<Course, 'id' | 'createdAt'>;

export async function createCourse(uid: string, data: NewCourse) {
  const ref = await addDoc(coursesRef(uid), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateCourse(uid: string, courseId: string, data: Partial<Course>) {
  await updateDoc(courseRef(uid, courseId), data);
}

export async function deleteCourse(uid: string, courseId: string) {
  await deleteDoc(courseRef(uid, courseId));
}
