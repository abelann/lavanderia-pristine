// screens/HomeScreen.js
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
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
});
