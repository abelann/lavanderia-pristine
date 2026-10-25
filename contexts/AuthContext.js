import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  registerLocalUser,
  resetLocalPassword,
  restoreLocalSession,
  signInLocalUser,
  signOutLocalUser,
  updateLocalProfile,
} from '../services/localAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    restoreLocalSession().then((storedSession) => {
      if (isActive) {
        setSession(storedSession);
        setIsLoading(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  const signIn = async (credentials) => {
    const nextSession = await signInLocalUser(credentials);
    setSession(nextSession);
  };

  const register = async (details) => {
    const nextSession = await registerLocalUser(details);
    setSession(nextSession);
  };

  const resetPassword = async (details) => resetLocalPassword(details);

  const updateProfile = async (profile) => {
    const nextSession = await updateLocalProfile(session.user.id, profile);
    setSession(nextSession);
  };

  const signOut = async () => {
    await signOutLocalUser();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        session,
        user: session?.user || null,
        signIn,
        register,
        resetPassword,
        updateProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  }
  return context;
}