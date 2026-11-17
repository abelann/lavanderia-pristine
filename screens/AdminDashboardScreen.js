import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboardScreen({ navigation }) {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.accountBar}>
        <View style={styles.accountInfo}>
          <Text style={styles.greeting}>Hola, {user.name || 'administrador'}</Text>
          <Text style={styles.role}>Administración Pristine</Text>
        </View>
        <Pressable onPress={signOut} accessibilityRole="button">
          <Text style={styles.signOut}>Salir</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Panel administrador</Text>
      <Pressable style={styles.action} onPress={() => navigation.navigate('GestionPedidosAdmin')}>
        <Text style={styles.actionTitle}>Gestionar pedidos</Text>
        <Text style={styles.actionCaption}>Revisar pedidos, estados y actividad diaria</Text>
      </Pressable>
      <Pressable style={styles.action} onPress={() => navigation.navigate('GestionClientesAdmin')}>
        <Text style={styles.actionTitle}>Gestionar clientes</Text>
        <Text style={styles.actionCaption}>Buscar perfiles y administrar cuentas cliente</Text>
      </Pressable>
      <Pressable style={styles.profileButton} onPress={() => navigation.navigate('Perfil')}>
        <Text style={styles.profileText}>Mi perfil</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f5fbff', flex: 1, justifyContent: 'center', padding: 22 },
  accountBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', left: 20, position: 'absolute', right: 20, top: 22 },
  accountInfo: { flexShrink: 1, paddingRight: 12 },
  greeting: { color: '#20495f', fontSize: 15, fontWeight: '700' },
  role: { color: '#607783', fontSize: 12, marginTop: 3 },
  signOut: { color: '#176e57', fontSize: 14, fontWeight: '700', padding: 8 },
  title: { color: '#20495f', fontSize: 25, fontWeight: '700', marginBottom: 18 },
  action: { backgroundColor: '#fff', borderColor: '#dfe9f5', borderRadius: 8, borderWidth: 1, marginBottom: 12, padding: 18 },
  actionTitle: { color: '#20495f', fontSize: 17, fontWeight: '700' },
  actionCaption: { color: '#607783', fontSize: 13, marginTop: 5 },
  profileButton: { alignSelf: 'center', padding: 12 },
  profileText: { color: '#176e57', fontSize: 15, fontWeight: '600' },
});