import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function PaymentDemoScreen({ navigation, route }) {
  return (
    <View style={styles.container}>
      <View style={styles.message}>
        <Text style={styles.title}>Pedido registrado</Text>
        <Text style={styles.orderId}>Referencia: {route.params?.orderId}</Text>
        <Text style={styles.body}>
          Tu pedido fue registrado correctamente. Puedes ver su estado en mis pedidos.
        </Text>
        <Text style={styles.status}>Estado del pedido: pendiente</Text>
      </View>
      <Pressable style={styles.button} onPress={() => navigation.navigate('Pedidos')}>
        <Text style={styles.buttonText}>Ver mis pedidos</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f5fbff', flex: 1, justifyContent: 'center', padding: 24 },
  message: { alignItems: 'center', backgroundColor: '#fff', borderColor: '#dfe9f5', borderRadius: 10, borderWidth: 1, padding: 22 },
  title: { color: '#20495f', fontSize: 23, fontWeight: '700', textAlign: 'center' },
  orderId: { color: '#607783', fontSize: 12, marginTop: 10, textAlign: 'center' },
  body: { color: '#365b6d', fontSize: 15, lineHeight: 22, marginTop: 18, textAlign: 'center' },
  status: { color: '#755b00', fontSize: 14, fontWeight: '600', marginTop: 14 },
  button: { alignItems: 'center', backgroundColor: '#1f9d75', borderRadius: 10, marginTop: 18, padding: 15 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});