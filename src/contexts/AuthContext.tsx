/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User, signOut } from "firebase/auth";
import { loginUser, registerUser } from "@utils/firestore";

/**
 * AuthContext.tsx
 *
 * Thin wrapper around Firebase Auth that provides:
 * - `user`: the current Firebase user (or null)
 * - `loading`: true until the initial auth state resolves
 * - `signUp(email, password)`: create a new auth user (delegates to utils)
 * - `signIn(email, password)`: sign in an existing user (delegates to utils)
 * - `signOutUser()`: sign out and clear local state
 *
 * Usage: wrap your app with `<AuthProvider>` and call `useAuth()` in children
 */

  interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signOutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [auth]);

  const signUp = async (email: string, password: string) => {
    const newUser = await registerUser(email, password);
    setUser(newUser);
    return newUser;
  };

  const signIn = async (email: string, password: string) => {
    const loggedIn = await loginUser(email, password);
    setUser(loggedIn);
    return loggedIn;
  };

  const signOutUser = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};