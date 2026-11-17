import AsyncStorage from '@react-native-async-storage/async-storage';

const cartKey = (userId) => `lavanderia-pristine:cart:${userId}:v1`;
const pendingOrderKey = (userId) => `lavanderia-pristine:pending-order:${userId}:v1`;

async function readArray(key) {
  try {
    const value = await AsyncStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeArray(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function loadCart(userId) {
  return readArray(cartKey(userId));
}

export async function clearCart(userId) {
  await writeArray(cartKey(userId), []);
}

export async function getOrCreatePendingOrderId(userId, createId) {
  const existingId = await AsyncStorage.getItem(pendingOrderKey(userId));
  if (existingId) return existingId;
  const nextId = createId();
  await AsyncStorage.setItem(pendingOrderKey(userId), nextId);
  return nextId;
}

export async function clearPendingOrderId(userId) {
  await AsyncStorage.removeItem(pendingOrderKey(userId));
}

export async function addItemToCart(userId, service, quantity) {
  const parsedQuantity = Number(quantity);
  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    throw new Error('La cantidad debe ser un entero mayor que cero.');
  }

  const cart = await loadCart(userId);
  const existing = cart.find((item) => item.serviceId === service.id);
  const nextCart = existing
    ? cart.map((item) => item.serviceId === service.id
      ? { ...item, cantidad: item.cantidad + parsedQuantity }
      : item)
    : [...cart, {
      serviceId: service.id,
      nombre: service.nombre,
      precio: Number(service.precio),
      cantidad: parsedQuantity,
    }];

  await writeArray(cartKey(userId), nextCart);
  await clearPendingOrderId(userId);
  return nextCart;
}

export async function updateCartQuantity(userId, serviceId, quantity) {
  const parsedQuantity = Number(quantity);
  const cart = await loadCart(userId);
  const nextCart = parsedQuantity <= 0
    ? cart.filter((item) => item.serviceId !== serviceId)
    : cart.map((item) => item.serviceId === serviceId
      ? { ...item, cantidad: Math.floor(parsedQuantity) }
      : item);
  await writeArray(cartKey(userId), nextCart);
  await clearPendingOrderId(userId);
  return nextCart;
}
