import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { AttendanceRecord, AttendanceStatus } from '@/lib/types';

export function attendanceRef(uid: string, courseId: string) {
  return collection(db, 'users', uid, 'courses', courseId, 'attendance');
}

export function attendanceSessionRef(uid: string, courseId: string, date: string, slotId: string) {
  return doc(db, 'users', uid, 'courses', courseId, 'attendance', `${date}_${slotId}`);
}

export async function listAttendance(uid: string, courseId: string): Promise<AttendanceRecord[]> {
  const snapshot = await getDocs(attendanceRef(uid, courseId));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord));
}

export async function setAttendanceStatus(
  uid: string,
  courseId: string,
  date: string,
  slotId: string,
  status: AttendanceStatus,
) {
  await setDoc(
    attendanceSessionRef(uid, courseId, date, slotId),
    { date, slotId, status, createdAt: serverTimestamp() },
    { merge: true },
  );
}

export async function clearAttendanceStatus(uid: string, courseId: string, date: string, slotId: string) {
  await deleteDoc(attendanceSessionRef(uid, courseId, date, slotId));
}
