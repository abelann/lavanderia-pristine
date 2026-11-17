import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, database } from './firebase';
import { loadProfilePreferences, saveProfilePreferences } from './profilePreferences';

function userDocument(uid) {
  return doc(database, 'users', uid);
}

export function subscribeToAuthChanges(listener, onError) {
  return onAuthStateChanged(auth, listener, onError);
}

export async function loadAuthenticatedUser(authUser) {
  let profileSnapshot;
  try {
    profileSnapshot = await getDoc(userDocument(authUser.uid));
  } catch (error) {
    if (error.code === 'permission-denied') {
      throw new Error(
        'Firestore rechazó el acceso al perfil. Verifica que el documento esté en users/{UID} usando el UID de Authentication y que las reglas actuales estén publicadas.'
      );
    }
    throw error;
  }

  const localPreferences = await loadProfilePreferences(authUser.uid);

  if (!profileSnapshot.exists()) {
    throw new Error('Tu cuenta no tiene un perfil de cliente en Firestore. Contacta con soporte.');
  }

  const profile = profileSnapshot.data();
  return {
    id: authUser.uid,
    name: profile.name || '',
    surname: profile.surname || '',
    email: authUser.email || profile.email || '',
    role: profile.role || null,
    ...localPreferences,
  };
}

export async function registerFirebaseUser({ name, surname, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);

  try {
    await setDoc(userDocument(credential.user.uid), {
      name: name.trim(),
      surname: surname.trim(),
      email: credential.user.email || normalizedEmail,
      role: 'cliente',
    });
    const localPreferences = await loadProfilePreferences(credential.user.uid);
    return {
      id: credential.user.uid,
      name: name.trim(),
      surname: surname.trim(),
      email: credential.user.email || normalizedEmail,
      role: 'cliente',
      ...localPreferences,
    };
  } catch (error) {
    await deleteUser(credential.user);
    throw error;
  }
}

export async function signInFirebaseUser({ email, password }) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password
  );
  return loadAuthenticatedUser(credential.user);
}

export async function sendFirebasePasswordReset(email) {
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

export async function updateFirebaseProfile(uid, profile) {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== uid) {
    throw new Error('La sesión cambió. Inicia sesión de nuevo para guardar el perfil.');
  }

  const cloudProfile = {
    name: profile.name.trim(),
    surname: profile.surname.trim(),
  };
  const localPreferences = {
    fotoUri: profile.fotoUri || '',
    biometricEnabled: Boolean(profile.biometricEnabled),
  };

  await updateDoc(userDocument(uid), cloudProfile);
  await saveProfilePreferences(uid, localPreferences);

  return loadAuthenticatedUser(currentUser);
}

export async function signOutFirebaseUser() {
  await signOut(auth);
}

export async function reloadFirebaseProfile() {
  if (!auth.currentUser) return null;
  return loadAuthenticatedUser(auth.currentUser);
}