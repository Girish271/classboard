import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { UserProfile } from '../types';

type C = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (e: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<C | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    const firebaseAuth = auth;
    const firestore = db;

    return onAuthStateChanged(firebaseAuth, async (u) => {
      setUser(u);

      if (u) {
        const snap = await getDoc(doc(firestore, 'users', u.uid));
        setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        profile,
        loading,

        login: async (e, p) => {
          if (!auth) {
            throw new Error(
              'Firebase configuration is missing. Please configure STEPS.txt.'
            );
          }

          await signInWithEmailAndPassword(auth, e, p);
        },

        logout: async () => {
          if (auth) {
            await signOut(auth);
          }
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const x = useContext(Ctx);

  if (!x) {
    throw new Error('AuthProvider missing');
  }

  return x;
};