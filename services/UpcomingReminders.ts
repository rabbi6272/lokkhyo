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
import type { UpcomingReminder } from '@/lib/types';

export function upcomingRemindersRef(uid: string, courseId: string) {
  return collection(db, 'users', uid, 'courses', courseId, 'upcomingReminders');
}

export function upcomingReminderRef(uid: string, courseId: string, reminderId: string) {
  return doc(db, 'users', uid, 'courses', courseId, 'upcomingReminders', reminderId);
}

export async function listUpcomingReminders(uid: string, courseId: string): Promise<UpcomingReminder[]> {
  const snapshot = await getDocs(
    query(upcomingRemindersRef(uid, courseId), orderBy('createdAt', 'asc')),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as UpcomingReminder));
}

export type NewUpcomingReminder = Omit<UpcomingReminder, 'id' | 'createdAt'>;

export async function createUpcomingReminder(uid: string, courseId: string, data: NewUpcomingReminder) {
  const ref = await addDoc(upcomingRemindersRef(uid, courseId), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateUpcomingReminder(
  uid: string,
  courseId: string,
  reminderId: string,
  data: Partial<UpcomingReminder>,
) {
  await updateDoc(upcomingReminderRef(uid, courseId, reminderId), data);
}

export async function deleteUpcomingReminder(uid: string, courseId: string, reminderId: string) {
  await deleteDoc(upcomingReminderRef(uid, courseId, reminderId));
}
