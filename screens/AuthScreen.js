import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const MODE_LOGIN = 'login';
const MODE_REGISTER = 'register';
const MODE_RESET = 'reset';

export default function AuthScreen() {
  const { signIn, register, resetPassword } = useAuth();
  const [mode, setMode] = useState(MODE_LOGIN);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setError('');
    setNotice('');

    if (!email.trim()) {
      setError('Ingresa tu correo.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Ingresa un correo válido.');
      return;
    }

    if (mode === MODE_REGISTER && !nombre.trim()) {
      setError('Ingresa tu nombre.');
      return;
    }

    const activePassword = mode === MODE_RESET ? newPassword : password;
    if (activePassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === MODE_REGISTER) {
        await register({ nombre, email, password });
      } else if (mode === MODE_RESET) {
        await resetPassword({ email, password: newPassword });
        setMode(MODE_LOGIN);
        setPassword('');
        setNewPassword('');
        setNotice('Contraseña local actualizada. Ya puedes iniciar sesión.');
      } else {
        await signIn({ email, password });
      }
    } catch (submitError) {
      setError(submitError.message || 'No se pudo completar la operación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setNotice('');
  };

  const title = mode === MODE_REGISTER
    ? 'Crear cuenta'
    : mode === MODE_RESET
      ? 'Restablecer contraseña'
      : 'Iniciar sesión';

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.heading}>
          <Text style={styles.brand}>Lavandería Pristine</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Acceso de demostración local</Text>
        </View>

        <View style={styles.form}>
          {mode === MODE_REGISTER ? (
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          {mode !== MODE_RESET ? (
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}

          <Pressable
            accessibilityRole="button"
            style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
            onPress={submit}
            disabled={isSubmitting}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? 'Procesando...' : title}
            </Text>
          </Pressable>

          {mode === MODE_LOGIN ? (
            <Pressable style={styles.textButton} onPress={() => changeMode(MODE_RESET)}>
              <Text style={styles.link}>Olvidé mi contraseña</Text>
            </Pressable>
          ) : null}

          <View style={styles.modeRow}>
            {mode !== MODE_LOGIN ? (
              <Pressable onPress={() => changeMode(MODE_LOGIN)}>
                <Text style={styles.link}>Volver a iniciar sesión</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => changeMode(MODE_REGISTER)}>
                <Text style={styles.link}>Crear cuenta de cliente</Text>
              </Pressable>
            )}
          </View>

          {mode === MODE_LOGIN ? (
            <View style={styles.demoBox}>
              <Text style={styles.demoText}>admin@pristine.local</Text>
              <Text style={styles.demoText}>Contraseña: pristine-demo</Text>
              <Pressable
                onPress={() => {
                  setEmail('admin@pristine.local');
                  setPassword('pristine-demo');
                }}
              >
                <Text style={styles.link}>Usar cuenta de administrador</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#f5fbff',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  heading: {
    alignItems: 'center',
    marginBottom: 26,
  },
  brand: {
    color: '#1f4d5f',
    fontSize: 25,
    fontWeight: '700',
    marginBottom: 18,
  },
  title: {
    color: '#20495f',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#4c6b7a',
    fontSize: 15,
    marginTop: 6,
  },
  form: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
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
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#1f9d75',
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 50,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  textButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  modeRow: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  link: {
    color: '#176e57',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  error: {
    color: '#b42318',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  notice: {
    color: '#176e57',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  demoBox: {
    backgroundColor: '#eaf2f9',
    borderRadius: 8,
    marginTop: 12,
    padding: 14,
  },
  demoTitle: {
    color: '#20495f',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  demoText: {
    color: '#365b6d',
    fontSize: 13,
    marginBottom: 3,
  },
  disclaimer: {
    alignSelf: 'center',
    color: '#657984',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 25,
    maxWidth: 480,
    textAlign: 'center',
  },
});