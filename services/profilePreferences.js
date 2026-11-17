import AsyncStorage from '@react-native-async-storage/async-storage';

const preferencesKey = (uid) => `lavanderia-pristine:profile-preferences:${uid}:v1`;

export async function loadProfilePreferences(uid) {
  try {
    const storedPreferences = await AsyncStorage.getItem(preferencesKey(uid));
    const preferences = storedPreferences ? JSON.parse(storedPreferences) : {};
    return {
      fotoUri: preferences.fotoUri || '',
      biometricEnabled: Boolean(preferences.biometricEnabled),
    };
  } catch {
    return { fotoUri: '', biometricEnabled: false };
  }
}

export async function saveProfilePreferences(uid, preferences) {
  await AsyncStorage.setItem(preferencesKey(uid), JSON.stringify(preferences));
}