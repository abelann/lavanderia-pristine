import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { deleteCustomerProfile, listCustomerProfiles } from '../services/firestoreOrders';

export default function AdminUsersScreen() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      setCustomers(await listCustomerProfiles());
    } catch (loadError) {
      setError(loadError.message || 'No se pudieron cargar los clientes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const visibleCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return customers.filter((customer) => (
      `${customer.name || ''} ${customer.surname || ''} ${customer.email || ''} ${customer.id}`
        .toLowerCase()
        .includes(term)
    ));
  }, [customers, search]);

  const removeProfile = (customer) => {
    Alert.alert(
      'Eliminar perfil de cliente',
        '¿Está seguro que quiere borrar esta cuenta? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar perfil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomerProfile(customer.id);
              await refresh();
            } catch (deleteError) {
              setError(deleteError.message || 'No se pudo eliminar el perfil.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.heading}>
        <Text style={styles.title}>Clientes</Text>
        <Pressable style={styles.refreshButton} onPress={refresh} disabled={isLoading}>
          <Text style={styles.refreshText}>{isLoading ? 'Actualizando...' : 'Actualizar'}</Text>
        </Pressable>
      </View>
      <TextInput style={styles.input} placeholder="Buscar por nombre, correo o UID" value={search} onChangeText={setSearch} autoCapitalize="none" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!isLoading && !visibleCustomers.length && !error ? <Text style={styles.empty}>No hay clientes que coincidan.</Text> : null}
      {visibleCustomers.map((customer) => (
        <View key={customer.id} style={styles.customer}>
          <Text style={styles.name}>{customer.name} {customer.surname}</Text>
          <Text style={styles.email}>{customer.email}</Text>
          <Text style={styles.uid}>UID: {customer.id}</Text>
          <Pressable style={styles.deleteButton} onPress={() => removeProfile(customer)}>
            <Text style={styles.deleteText}>Eliminar perfil</Text>
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
  input: { backgroundColor: '#fff', borderColor: '#d7e3ee', borderRadius: 8, borderWidth: 1, fontSize: 14, marginBottom: 12, paddingHorizontal: 12, paddingVertical: 12 },
  customer: { backgroundColor: '#fff', borderColor: '#dfe9f5', borderRadius: 8, borderWidth: 1, marginBottom: 10, padding: 14 },
  name: { color: '#20495f', fontSize: 16, fontWeight: '700' },
  email: { color: '#365b6d', fontSize: 13, marginTop: 4 },
  uid: { color: '#607783', fontSize: 10, marginTop: 4 },
  deleteButton: { alignSelf: 'flex-end', marginTop: 8, paddingVertical: 7 },
  deleteText: { color: '#a33c3c', fontSize: 13, fontWeight: '600' },
  empty: { color: '#607783', fontSize: 15, marginTop: 16 },
  error: { color: '#b42318', marginBottom: 12 },
});