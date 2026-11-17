import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { deleteOrder, loadCustomerOrders } from '../services/firestoreOrders';

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      setOrders(await loadCustomerOrders(user.id));
    } catch (loadError) {
      setError(loadError.message || 'No se pudieron cargar tus pedidos.');
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => { refresh(); }, [refresh]);

  const removeOrder = (order) => {
    Alert.alert('Eliminar pedido', 'El pedido se eliminará permanentemente y no se podrá recuperar.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteOrder(order.id);
            await refresh();
          } catch (archiveError) {
            setError(archiveError.message || 'No se pudo eliminar el pedido.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heading}>
        <Text style={styles.title}>Mis pedidos</Text>
        <Pressable style={styles.refreshButton} onPress={refresh} disabled={isLoading}>
          <Text style={styles.refreshText}>{isLoading ? 'Actualizando...' : 'Actualizar'}</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!isLoading && !orders.length && !error ? <Text style={styles.empty}>Todavía no tienes pedidos.</Text> : null}
      {orders.map((order) => (
        <View key={order.id} style={styles.order}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>Pedido {order.id.slice(-6)}</Text>
            <Text style={[styles.status, order.status === 'archived' && styles.archivedStatus]}>{order.status}</Text>
          </View>
          <Text style={styles.date}>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Fecha pendiente'}</Text>
          {order.items.map((item) => (
            <Text key={item.serviceId} style={styles.item}>
              {item.name} · {item.quantity} prendas · S/ {(item.unitPrice * item.quantity).toFixed(2)}
            </Text>
          ))}
          <View style={styles.footer}>
            <Text style={styles.total}>S/ {order.total.toFixed(2)}</Text>
          </View>
          <Pressable
            style={styles.deleteButton}
            onPress={() => removeOrder(order)}
            accessibilityRole="button"
            accessibilityLabel={`Eliminar pedido ${order.id.slice(-6)}`}
          >
            <MaterialCommunityIcons name="delete-outline" size={20} color="#a33c3c" />
            <Text style={styles.deleteText}>Eliminar</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { backgroundColor: '#f5fbff', flexGrow: 1, padding: 22 },
  heading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  title: { color: '#20495f', fontSize: 25, fontWeight: '700' },
  refreshButton: { backgroundColor: '#eaf2f9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9 },
  refreshText: { color: '#176e57', fontSize: 14, fontWeight: '700' },
  empty: { color: '#607783', fontSize: 16, marginTop: 18 },
  order: { backgroundColor: '#fff', borderColor: '#dfe9f5', borderRadius: 10, borderWidth: 1, marginBottom: 12, padding: 15 },
  orderHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  orderId: { color: '#20495f', fontSize: 16, fontWeight: '700' },
  status: { backgroundColor: '#eaf2f9', borderRadius: 5, color: '#315b6d', fontSize: 12, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4, textTransform: 'capitalize' },
  archivedStatus: { backgroundColor: '#f2e8e8', color: '#8b3535' },
  date: { color: '#607783', fontSize: 12, marginBottom: 12, marginTop: 6 },
  item: { color: '#365b6d', fontSize: 14, marginBottom: 6 },
  footer: { borderTopColor: '#e5edf2', borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 12 },
  payment: { color: '#607783', fontSize: 13 },
  total: { color: '#176e57', fontSize: 16, fontWeight: '700' },
  deleteButton: { alignItems: 'center', alignSelf: 'flex-end', flexDirection: 'row', gap: 5, marginTop: 10, paddingVertical: 8 },
  deleteText: { color: '#a33c3c', fontSize: 13, fontWeight: '600' },
  error: { color: '#b42318', fontSize: 14, marginBottom: 12 },
});