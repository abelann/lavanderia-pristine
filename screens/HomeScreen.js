// screens/HomeScreen.js
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.accountBar}>
        <View style={styles.accountText}>
          <Text style={styles.greeting}>Hola, {user.nombre || user.email}</Text>
          <Text style={styles.role}>
            {user.role === 'administrador' ? 'Acceso administrador demo' : 'Cliente'}
          </Text>
        </View>
        <Pressable onPress={signOut} accessibilityRole="button">
          <Text style={styles.signOut}>Salir</Text>
        </Pressable>
      </View>

      <Image
        source={require('../assets/icon.png')}
        style={styles.logo}
      />

      <Text style={styles.title}>Lavanderia Pristine</Text>
      <Text style={styles.subtitle}>Tu ropa, nuestro cuidado</Text>

      <Text style={styles.description}>
        Calcula rápidamente cuánto costaría tu servicio de lavado.
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('CalcularLavado')}
      >
        <Text style={styles.buttonText}>Calcular lavado</Text>
      </Pressable>

      <Pressable
        style={styles.profileButton}
        onPress={() => navigation.navigate('Perfil')}
      >
        <Text style={styles.profileButtonText}>Mi perfil</Text>
      </Pressable>

      <View style={styles.secondaryActions}>
        <Pressable onPress={() => navigation.navigate('Carrito')}>
          <Text style={styles.profileButtonText}>Carrito</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Pedidos')}>
          <Text style={styles.profileButtonText}>Mis pedidos</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5fbff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  accountBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 20,
    position: 'absolute',
    right: 20,
    top: 22,
  },
  accountText: {
    flexShrink: 1,
    paddingRight: 12,
  },
  greeting: {
    color: '#20495f',
    fontSize: 15,
    fontWeight: '700',
  },
  role: {
    color: '#607783',
    fontSize: 12,
    marginTop: 3,
  },
  signOut: {
    color: '#176e57',
    fontSize: 14,
    fontWeight: '700',
    padding: 8,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f4d5f',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#4c6b7a',
    marginBottom: 18,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#335a6d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#1f9d75',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  profileButton: {
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
  },
  profileButtonText: {
    color: '#176e57',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 28,
    marginTop: 4,
  },
});
