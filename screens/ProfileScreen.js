import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState({
    name: user.name || '',
    surname: user.surname || '',
    fotoUri: user.fotoUri || '',
    biometricEnabled: Boolean(user.biometricEnabled),
  });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const setField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const selectPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Se necesita permiso para elegir una foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
    });

    if (!result.canceled) {
      setField('fotoUri', result.assets[0].uri);
      setError('');
    }
  };

  const toggleBiometrics = async (enabled) => {
    if (enabled) {
      const [hasHardware, isEnrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);
      if (!hasHardware || !isEnrolled) {
        setError('Este dispositivo no tiene biometría configurada.');
        return;
      }
    }
    setError('');
    setField('biometricEnabled', enabled);
  };

  const save = async () => {
    setError('');
    setNotice('');
    if (!profile.name.trim() || !profile.surname.trim()) {
      setError('Nombre y apellido son obligatorios.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(profile);
      setNotice('Perfil actualizado.');
    } catch (saveError) {
      setError(saveError.message || 'No se pudo guardar el perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Mi perfil</Text>
      <Text style={styles.caption}>Tus datos personales y cuenta.</Text>

      <View style={styles.photoArea}>
        {profile.fotoUri ? (
          <Image source={{ uri: profile.fotoUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoInitial}>{profile.name.charAt(0).toUpperCase() || '?'}</Text>
          </View>
        )}
        <Pressable style={styles.photoButton} onPress={selectPhoto}>
          <Text style={styles.photoButtonText}>Elegir foto</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={profile.name}
        onChangeText={(value) => setField('name', value)}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={profile.surname}
        onChangeText={(value) => setField('surname', value)}
        autoCapitalize="words"
      />
      <TextInput
        style={[styles.input, styles.readOnlyInput]}
        placeholder="Correo electrónico"
        value={user.email}
        editable={false}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Pressable
        style={styles.biometricsRow}
        onPress={() => toggleBiometrics(!profile.biometricEnabled)}
      >
        <View style={styles.biometricsText}>
          <Text style={styles.biometricsTitle}>Desbloqueo biométrico</Text>
          <Text style={styles.biometricsCaption}>Solo en este dispositivo y con fallback de contraseña</Text>
        </View>
        <Text style={styles.biometricsValue}>{profile.biometricEnabled ? 'Activado' : 'Desactivado'}</Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      <Pressable style={styles.saveButton} onPress={save} disabled={isSaving}>
        <Text style={styles.saveButtonText}>{isSaving ? 'Guardando...' : 'Guardar cambios'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#f5fbff',
    flexGrow: 1,
    padding: 22,
  },
  title: {
    color: '#20495f',
    fontSize: 25,
    fontWeight: '700',
  },
  caption: {
    color: '#607783',
    fontSize: 14,
    marginTop: 6,
  },
  photoArea: {
    alignItems: 'center',
    marginVertical: 22,
  },
  photo: {
    borderRadius: 54,
    height: 108,
    width: 108,
  },
  photoPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#d9f1e4',
    borderRadius: 54,
    height: 108,
    justifyContent: 'center',
    width: 108,
  },
  photoInitial: {
    color: '#1a5a3b',
    fontSize: 38,
    fontWeight: '700',
  },
  photoButton: {
    padding: 12,
  },
  photoButtonText: {
    color: '#176e57',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#d7e3ee',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  readOnlyInput: {
    color: '#607783',
  },
  biometricsRow: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#d7e3ee',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 14,
  },
  biometricsText: { flex: 1, paddingRight: 8 },
  biometricsTitle: { color: '#254a5a', fontSize: 14, fontWeight: '600' },
  biometricsCaption: { color: '#607783', fontSize: 11, marginTop: 3 },
  biometricsValue: { color: '#176e57', fontSize: 12, fontWeight: '700' },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#1f9d75',
    borderRadius: 10,
    marginTop: 8,
    padding: 15,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    color: '#b42318',
    marginBottom: 8,
    textAlign: 'center',
  },
  notice: {
    color: '#176e57',
    marginBottom: 8,
    textAlign: 'center',
  },
});