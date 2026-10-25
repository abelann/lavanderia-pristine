import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { loadOrders } from '../services/localCommerce';

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let isActive = true;
    loadOrders(user.id).then((savedOrders) => {
      if (isActive) setOrders(savedOrders);
    });
    return () => { isActive = false; };
  }, [user.id]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mis pedidos</Text>
      {!orders.length ? <Text style={styles.empty}>Todavía no tienes pedidos.</Text> : null}
      {orders.map((order) => (
        <View key={order.id} style={styles.order}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>Pedido {order.id.slice(-6)}</Text>
            <Text style={styles.status}>{order.status}</Text>
          </View>
          <Text style={styles.date}>{new Date(order.createdAt).toLocaleString()}</Text>
          {order.items.map((item) => (
            <Text key={item.serviceId} style={styles.item}>
              {item.nombre} · {item.cantidad} prendas · S/ {(item.precio * item.cantidad).toFixed(2)}
            </Text>
          ))}
          <View style={styles.footer}>
            <Text style={styles.payment}>Pago: {order.paymentStatus}</Text>
            <Text style={styles.total}>S/ {order.total.toFixed(2)}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { backgroundColor: '#f5fbff', flexGrow: 1, padding: 22 },
  title: { color: '#20495f', fontSize: 25, fontWeight: '700', marginBottom: 16 },
  empty: { color: '#607783', fontSize: 16, marginTop: 18 },
  order: { backgroundColor: '#fff', borderColor: '#dfe9f5', borderRadius: 10, borderWidth: 1, marginBottom: 12, padding: 15 },
  orderHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  orderId: { color: '#20495f', fontSize: 16, fontWeight: '700' },
  status: { backgroundColor: '#fff2cc', borderRadius: 5, color: '#755b00', fontSize: 12, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4, textTransform: 'capitalize' },
  date: { color: '#607783', fontSize: 12, marginBottom: 12, marginTop: 6 },
  item: { color: '#365b6d', fontSize: 14, marginBottom: 6 },
  footer: { borderTopColor: '#e5edf2', borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 12 },
  payment: { color: '#607783', fontSize: 13 },
  total: { color: '#176e57', fontSize: 16, fontWeight: '700' },
  disclaimer: { color: '#607783', fontSize: 12, marginTop: 10, textAlign: 'center' },
});