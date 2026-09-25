import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  serverTimestamp,
  updateDoc,
} from '@react-native-firebase/firestore';

import { db } from '@/lib/firebase';
import type { RoutineSlot } from '@/lib/types';

export function routineRef(uid: string) {
  return collection(db, 'users', uid, 'routineSlots');
}

export function routineSlotRef(uid: string, slotId: string) {
  return doc(db, 'users', uid, 'routineSlots', slotId);
}

export async function listRoutine(uid: string): Promise<RoutineSlot[]> {
  const snapshot = await getDocs(routineRef(uid));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as RoutineSlot));
}

export type NewRoutineSlot = Omit<RoutineSlot, 'id' | 'createdAt'>;

export async function createRoutineSlot(uid: string, data: NewRoutineSlot) {
  const ref = await addDoc(routineRef(uid), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateRoutineSlot(uid: string, slotId: string, data: Partial<RoutineSlot>) {
  await updateDoc(routineSlotRef(uid, slotId), data);
}

export async function deleteRoutineSlot(uid: string, slotId: string) {
  await deleteDoc(routineSlotRef(uid, slotId));
}
