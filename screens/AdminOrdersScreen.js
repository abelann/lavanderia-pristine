import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Dimensions, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import { deleteOrder, loadAdminOrdersCache, loadAllAdminOrders, updateAdminOrderStatus } from '../services/firestoreOrders';

const CHART_WIDTH = Dimensions.get('window').width - 44;
const ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled', 'archived'];

function localDateKey(value) {
  if (!value) return '';
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [customerFilter, setCustomerFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      setOrders(await loadAllAdminOrders());
    } catch (loadError) {
      setError(loadError.message || 'No se pudieron actualizar los pedidos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    loadAdminOrdersCache().then((cachedOrders) => {
      if (active && cachedOrders.length) setOrders(cachedOrders);
      if (active) refresh();
    });
    return () => { active = false; };
  }, [refresh]);

  const visibleOrders = useMemo(() => {
    const search = customerFilter.trim().toLowerCase();
    return orders.filter((order) => {
      const customer = order.customer || {};
      const customerText = `${customer.name || ''} ${customer.surname || ''} ${customer.email || ''} ${order.userId}`.toLowerCase();
      const date = localDateKey(order.createdAt);
      return (!search || customerText.includes(search))
        && (!startDate || date >= startDate)
        && (!endDate || date <= endDate);
    });
  }, [orders, customerFilter, startDate, endDate]);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return { key: localDateKey(date), label: date.toLocaleDateString(undefined, { weekday: 'short' }) };
    });
    const counts = new Map(days.map((day) => [day.key, 0]));
    for (const order of orders) {
      const key = localDateKey(order.createdAt);
      if (counts.has(key)) counts.set(key, counts.get(key) + 1);
    }
    return {
      labels: days.map((day) => day.label),
      datasets: [{ data: days.map((day) => counts.get(day.key)) }],
    };
  }, [orders]);

  const setStatus = (order, status) => {
    Alert.alert('Actualizar pedido', `¿Cambiar el pedido ${order.id.slice(-6)} a ${status}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          try {
            await updateAdminOrderStatus(order.id, status);
            await refresh();
          } catch (updateError) {
            setError(updateError.message || 'No se pudo actualizar el pedido.');
          }
        },
      },
    ]);
  };

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
          } catch (deleteError) {
            setError(deleteError.message || 'No se pudo eliminar el pedido.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.heading}>
        <Text style={styles.title}>Pedidos</Text>
        <Pressable style={styles.refreshButton} onPress={refresh} disabled={isLoading}>
          <Text style={styles.refreshText}>{isLoading ? 'Actualizando...' : 'Actualizar'}</Text>
        </Pressable>
      </View>
      <Text style={styles.sectionTitle}>Pedidos por día · últimos 7 días</Text>
      <BarChart
        data={chartData}
        width={CHART_WIDTH}
        height={210}
        fromZero
        showValuesOnTopOfBars
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(31, 157, 117, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(51, 90, 109, ${opacity})`,
          propsForBackgroundLines: { stroke: '#e5edf2' },
        }}
        style={styles.chart}
      />
      <Text style={styles.sectionTitle}>Filtrar pedidos</Text>
      <TextInput style={styles.input} placeholder="Cliente, correo o UID" value={customerFilter} onChangeText={setCustomerFilter} autoCapitalize="none" />
      <View style={styles.dateFilters}>
        <TextInput style={[styles.input, styles.dateInput]} placeholder="Desde AAAA-MM-DD" value={startDate} onChangeText={setStartDate} />
        <TextInput style={[styles.input, styles.dateInput]} placeholder="Hasta AAAA-MM-DD" value={endDate} onChangeText={setEndDate} />
      </View>
      <Text style={styles.resultCount}>{visibleOrders.length} pedidos</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {visibleOrders.map((order) => (
        <View key={order.id} style={styles.order}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderTitle}>Pedido {order.id.slice(-6)}</Text>
            <Text style={styles.status}>{order.status}</Text>
          </View>
          <Text style={styles.customer}>{order.customer?.name} {order.customer?.surname} · {order.customer?.email}</Text>
          <Text style={styles.meta}>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Fecha pendiente'} · {order.userId}</Text>
          {order.items.map((item) => (
            <Text key={item.serviceId} style={styles.item}>{item.name} · {item.quantity} × S/ {item.unitPrice.toFixed(2)}</Text>
          ))}
          <Text style={styles.total}>Total estimado: S/ {order.total.toFixed(2)}</Text>
          <View style={styles.statusActions}>
            {ORDER_STATUSES.filter((status) => status !== order.status).map((status) => (
              <Pressable key={status} style={styles.statusButton} onPress={() => setStatus(order, status)}>
                <Text style={styles.statusButtonText}>{status}</Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.deleteButton}
              onPress={() => removeOrder(order)}
              accessibilityRole="button"
              accessibilityLabel={`Eliminar pedido ${order.id.slice(-6)}`}
            >
              <MaterialCommunityIcons name="delete-outline" size={19} color="#a33c3c" />
            </Pressable>
          </View>
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
  sectionTitle: { color: '#254a5a', fontSize: 16, fontWeight: '700', marginBottom: 10, marginTop: 12 },
  chart: { borderRadius: 8, marginLeft: -12 },
  input: { backgroundColor: '#fff', borderColor: '#d7e3ee', borderRadius: 8, borderWidth: 1, color: '#254a5a', fontSize: 14, marginBottom: 9, paddingHorizontal: 12, paddingVertical: 11 },
  dateFilters: { flexDirection: 'row', gap: 8 },
  dateInput: { flex: 1, fontSize: 12, paddingHorizontal: 8 },
  resultCount: { color: '#607783', fontSize: 13, marginBottom: 10 },
  order: { backgroundColor: '#fff', borderColor: '#dfe9f5', borderRadius: 8, borderWidth: 1, marginBottom: 12, padding: 14 },
  orderHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  orderTitle: { color: '#20495f', fontSize: 15, fontWeight: '700' },
  status: { color: '#176e57', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  customer: { color: '#254a5a', fontSize: 13, marginTop: 8 },
  meta: { color: '#607783', fontSize: 11, marginBottom: 8, marginTop: 4 },
  item: { color: '#365b6d', fontSize: 13, marginBottom: 4 },
  total: { color: '#176e57', fontSize: 15, fontWeight: '700', marginTop: 8 },
  statusActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  statusButton: { backgroundColor: '#eaf2f9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6 },
  statusButtonText: { color: '#315b6d', fontSize: 11, fontWeight: '600' },
  deleteButton: { alignItems: 'center', backgroundColor: '#f8eaea', borderRadius: 6, height: 30, justifyContent: 'center', width: 34 },
  error: { color: '#b42318', marginBottom: 12 },
});