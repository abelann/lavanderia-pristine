import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, database } from './firebase';

const ordersCollection = collection(database, 'orders');
const adminCacheKey = 'lavanderia-pristine:admin-orders-cache:v1';

function toISOString(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  return value.toDate().toISOString();
}

function orderFromSnapshot(snapshot) {
  const data = snapshot.data();
  return {
    ...data,
    id: snapshot.id,
    createdAt: toISOString(data.createdAt),
    updatedAt: toISOString(data.updatedAt),
    archivedAt: toISOString(data.archivedAt),
    location: null,
  };
}

export function createOrderId() {
  return doc(ordersCollection).id;
}

export async function createCustomerOrder({ orderId, user, cart }) {
  if (!auth.currentUser || auth.currentUser.uid !== user.id) {
    throw new Error('La sesión cambió. Inicia sesión de nuevo antes de crear el pedido.');
  }
  if (!Array.isArray(cart) || cart.length === 0) {
    throw new Error('Agrega al menos un servicio al carrito.');
  }
  const items = cart.map((item) => ({
    serviceId: item.serviceId,
    name: item.nombre.trim(),
    unitPrice: Number(item.precio),
    quantity: Number(item.cantidad),
  }));
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const orderReference = doc(database, 'orders', orderId);
  const orderData = {
    userId: user.id,
    customer: {
      name: user.name || '',
      surname: user.surname || '',
      email: user.email || '',
    },
    items,
    total: Number(total.toFixed(2)),
    currency: 'PEN',
    status: 'pending',
    paymentStatus: 'unprocessed',
    location: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(orderReference, orderData);
  } catch (writeError) {
    if (writeError.code === 'permission-denied') {
      try {
        const existingOrder = await getDoc(orderReference);
        if (existingOrder.exists()) {
          const savedOrder = existingOrder.data();
          if (savedOrder.userId === user.id) {
            return { id: orderId, status: savedOrder.status, total: savedOrder.total };
          }
        }
      } catch {
        // Keep the original write error when a missing or foreign order is unreadable.
      }
    }
    throw writeError;
  }

  return { id: orderId, status: 'pending', total: Number(total.toFixed(2)) };
}

export async function loadCustomerOrders(userId) {
  const ordersQuery = query(
    ordersCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(ordersQuery);
  return snapshot.docs.map(orderFromSnapshot);
}

export async function archiveCustomerOrder(orderId) {
  const orderReference = doc(database, 'orders', orderId);
  await updateDoc(orderReference, {
    status: 'archived',
    archivedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteOrder(orderId) {
  await deleteDoc(doc(database, 'orders', orderId));
}

export async function loadAdminOrdersCache() {
  try {
    const storedOrders = await AsyncStorage.getItem(adminCacheKey);
    const orders = storedOrders ? JSON.parse(storedOrders) : [];
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

export async function loadAllAdminOrders() {
  const ordersQuery = query(ordersCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(ordersQuery);
  const orders = snapshot.docs.map(orderFromSnapshot);
  try {
    await AsyncStorage.setItem(adminCacheKey, JSON.stringify(orders.slice(0, 250)));
  } catch {
    // Keep Firestore as the source of truth if the local cache cannot be written.
  }
  return orders;
}

export async function updateAdminOrderStatus(orderId, status) {
  if (!['pending', 'processing', 'completed', 'cancelled', 'archived'].includes(status)) {
    throw new Error('Estado de pedido no válido.');
  }
  const orderReference = doc(database, 'orders', orderId);
  const currentOrder = await getDoc(orderReference);
  if (!currentOrder.exists()) throw new Error('No se encontró el pedido.');
  if (currentOrder.data().status === 'archived' && status !== 'archived') {
    throw new Error('Los pedidos archivados no se pueden reabrir.');
  }
  await updateDoc(orderReference, {
    status,
    ...(status === 'archived' ? { archivedAt: serverTimestamp() } : {}),
    updatedAt: serverTimestamp(),
  });
}

export async function listCustomerProfiles() {
  const usersQuery = query(collection(database, 'users'), where('role', '==', 'cliente'));
  const snapshot = await getDocs(usersQuery);
  return snapshot.docs.map((userSnapshot) => ({
    id: userSnapshot.id,
    ...userSnapshot.data(),
  }));
}

export async function deleteCustomerProfile(uid) {
  await deleteDoc(doc(database, 'users', uid));
}