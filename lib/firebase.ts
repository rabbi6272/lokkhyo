import { getAuth, type User } from '@react-native-firebase/auth';
import { getFirestore, type Firestore } from '@react-native-firebase/firestore';

export const auth = getAuth();

export const db: Firestore = getFirestore();

export type { User };
