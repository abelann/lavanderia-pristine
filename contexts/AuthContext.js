import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  loadAuthenticatedUser,
  registerFirebaseUser,
  reloadFirebaseProfile,
  sendFirebasePasswordReset,
  signInFirebaseUser,
  signOutFirebaseUser,
  subscribeToAuthChanges,
  updateFirebaseProfile,
} from '../services/firebaseAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const authChangeId = useRef(0);

  useEffect(() => {
    let isActive = true;

    const unsubscribe = subscribeToAuthChanges(async (authUser) => {
      const currentChangeId = ++authChangeId.current;
      setProfileError('');

      if (!authUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const authenticatedUser = await loadAuthenticatedUser(authUser);
        if (isActive && currentChangeId === authChangeId.current) setUser(authenticatedUser);
      } catch (error) {
        if (isActive && currentChangeId === authChangeId.current) {
          setUser(null);
          setProfileError(error.message || 'No se pudo cargar tu perfil de Firebase.');
        }
      } finally {
        if (isActive && currentChangeId === authChangeId.current) setIsLoading(false);
      }
    }, (error) => {
      if (isActive) {
        setProfileError(error.message || 'No se pudo comprobar la sesión de Firebase.');
        setIsLoading(false);
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const signIn = async (credentials) => {
    const authenticatedUser = await signInFirebaseUser(credentials);
    authChangeId.current += 1;
    setUser(authenticatedUser);
    setProfileError('');
  };

  const register = async (details) => {
    const authenticatedUser = await registerFirebaseUser(details);
    authChangeId.current += 1;
    setUser(authenticatedUser);
    setProfileError('');
  };

  const resetPassword = async (email) => sendFirebasePasswordReset(email);

  const updateProfile = async (profile) => {
    const updatedUser = await updateFirebaseProfile(user.id, profile);
    setUser(updatedUser);
  };

  const signOut = async () => {
    await signOutFirebaseUser();
    setUser(null);
    setProfileError('');
  };

  const retryProfile = async () => {
    setIsLoading(true);
    setProfileError('');
    try {
      setUser(await reloadFirebaseProfile());
    } catch (error) {
      setProfileError(error.message || 'No se pudo cargar tu perfil de Firebase.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        user,
        profileError,
        signIn,
        register,
        resetPassword,
        updateProfile,
        signOut,
        retryProfile,
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