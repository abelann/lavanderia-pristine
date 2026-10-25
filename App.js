import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as LocalAuthentication from 'expo-local-authentication';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import CalculatorScreen from './screens/CalculatorScreen';
import ProfileScreen from './screens/ProfileScreen';
import CartScreen from './screens/CartScreen';
import OrdersScreen from './screens/OrdersScreen';
import PaymentDemoScreen from './screens/PaymentDemoScreen';
import { useEffect, useState } from 'react';

const Stack = createNativeStackNavigator();

function AppNavigation() {
  const { isLoading, user, signOut } = useAuth();
  const [verifiedUserId, setVerifiedUserId] = useState(null);
  const [biometricError, setBiometricError] = useState('');

  useEffect(() => {
    let isActive = true;
    if (!user?.biometricEnabled) {
      setVerifiedUserId(null);
      setBiometricError('');
      return () => { isActive = false; };
    }

    LocalAuthentication.authenticateAsync({
      promptMessage: 'Desbloquear Lavandería Pristine',
      fallbackLabel: 'Usar contraseña',
    }).then((result) => {
      if (!isActive) return;
      if (result.success) {
        setVerifiedUserId(user.id);
        setBiometricError('');
      } else {
        setBiometricError('No se pudo validar la biometría. Puedes volver al acceso por contraseña.');
      }
    }).catch(() => {
      if (isActive) setBiometricError('La biometría no está disponible en este dispositivo.');
    });

    return () => { isActive = false; };
  }, [user?.id, user?.biometricEnabled]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1f9d75" />
        <Text style={styles.loadingText}>Cargando sesión local...</Text>
      </View>
    );
  }

  if (user?.biometricEnabled && verifiedUserId !== user.id) {
    return (
      <View style={styles.loading}>
        <Text style={styles.biometricTitle}>Desbloquear sesión</Text>
        <Text style={styles.loadingText}>{biometricError || 'Confirma tu identidad para continuar.'}</Text>
        <Pressable
          style={styles.biometricButton}
          onPress={() => signOut()}
        >
          <Text style={styles.biometricButtonText}>Usar correo y contraseña</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator initialRouteName="Inicio">
          <Stack.Screen
            name="Inicio"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CalcularLavado"
            component={CalculatorScreen}
            options={{ title: 'Calcular lavado' }}
          />
          <Stack.Screen
            name="Perfil"
            component={ProfileScreen}
            options={{ title: 'Mi perfil' }}
          />
          <Stack.Screen
            name="Carrito"
            component={CartScreen}
            options={{ title: 'Carrito' }}
          />
          <Stack.Screen
            name="Pedidos"
            component={OrdersScreen}
            options={{ title: 'Mis pedidos' }}
          />
          <Stack.Screen
            name="PagoDemo"
            component={PaymentDemoScreen}
            options={{ title: 'Pago' }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name="Acceso"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: '#f5fbff',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#4c6b7a',
    fontSize: 15,
    marginTop: 12,
  },
  biometricTitle: { color: '#20495f', fontSize: 22, fontWeight: '700' },
  biometricButton: { backgroundColor: '#1f9d75', borderRadius: 9, marginTop: 20, paddingHorizontal: 18, paddingVertical: 12 },
  biometricButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
