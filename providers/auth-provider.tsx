import { onAuthStateChanged, type User } from '@react-native-firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { auth } from '@/lib/firebase';

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, initializing: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo(() => ({ user, initializing }), [user, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
