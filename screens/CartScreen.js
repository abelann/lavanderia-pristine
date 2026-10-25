import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { createLocalOrder, loadCart, updateCartQuantity } from '../services/localCommerce';

export default function CartScreen({ navigation }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshCart = async () => {
    setItems(await loadCart(user.id));
  };

  useEffect(() => {
    refreshCart();
  }, [user.id]);

  const changeQuantity = async (item, amount) => {
    const next = await updateCartQuantity(user.id, item.serviceId, item.cantidad + amount);
    setItems(next);
  };

  const confirmOrder = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const order = await createLocalOrder(user.id);
      setItems([]);
      navigation.navigate('PagoDemo', { orderId: order.id });
    } catch (submitError) {
      setError(submitError.message || 'No se pudo crear el pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Carrito</Text>
      {!items.length ? (
        <Text style={styles.empty}>Tu carrito está vacío.</Text>
      ) : items.map((item) => (
        <View key={item.serviceId} style={styles.item}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.nombre}</Text>
            <Text style={styles.itemPrice}>S/ {item.precio.toFixed(2)} por prenda</Text>
          </View>
          <View style={styles.quantityControls}>
            <Pressable style={styles.stepButton} onPress={() => changeQuantity(item, -1)}>
              <Text style={styles.stepText}>-</Text>
            </Pressable>
            <Text style={styles.quantity}>{item.cantidad}</Text>
            <Pressable style={styles.stepButton} onPress={() => changeQuantity(item, 1)}>
              <Text style={styles.stepText}>+</Text>
            </Pressable>
          </View>
        </View>
      ))}

      {items.length ? (
        <>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total estimado</Text>
            <Text style={styles.total}>S/ {total.toFixed(2)}</Text>
          </View>
          <Text style={styles.localNote}>Pedido de demostración guardado en este dispositivo.</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.primaryButton} onPress={confirmOrder} disabled={isSubmitting}>
            <Text style={styles.primaryText}>{isSubmitting ? 'Guardando...' : 'Crear pedido'}</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { backgroundColor: '#f5fbff', flexGrow: 1, padding: 22 },
  title: { color: '#20495f', fontSize: 25, fontWeight: '700', marginBottom: 16 },
  empty: { color: '#607783', fontSize: 16, marginTop: 18 },
  item: { alignItems: 'center', backgroundColor: '#fff', borderColor: '#dfe9f5', borderRadius: 10, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, padding: 14 },
  itemInfo: { flex: 1, paddingRight: 8 },
  itemName: { color: '#254a5a', fontSize: 16, fontWeight: '600' },
  itemPrice: { color: '#607783', fontSize: 13, marginTop: 4 },
  quantityControls: { alignItems: 'center', flexDirection: 'row' },
  stepButton: { alignItems: 'center', backgroundColor: '#eaf2f9', borderRadius: 7, height: 34, justifyContent: 'center', width: 34 },
  stepText: { color: '#20495f', fontSize: 20, fontWeight: '700' },
  quantity: { color: '#254a5a', fontSize: 16, fontWeight: '700', minWidth: 34, textAlign: 'center' },
  totalRow: { borderTopColor: '#d7e3ee', borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 16 },
  totalLabel: { color: '#20495f', fontSize: 16, fontWeight: '600' },
  total: { color: '#176e57', fontSize: 18, fontWeight: '700' },
  localNote: { color: '#607783', fontSize: 13, marginTop: 14, textAlign: 'center' },
  error: { color: '#b42318', marginTop: 10, textAlign: 'center' },
  primaryButton: { alignItems: 'center', backgroundColor: '#1f9d75', borderRadius: 10, marginTop: 18, padding: 15 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});