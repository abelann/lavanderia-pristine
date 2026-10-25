import AsyncStorage from '@react-native-async-storage/async-storage';

const cartKey = (userId) => `lavanderia-pristine:cart:${userId}:v1`;
const ordersKey = (userId) => `lavanderia-pristine:orders:${userId}:v1`;

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
  return nextCart;
}

export async function createLocalOrder(userId) {
  const cart = await loadCart(userId);
  if (!cart.length) {
    throw new Error('Agrega al menos un servicio al carrito.');
  }

  const items = cart.map((item) => ({ ...item }));
  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const order = {
    id: `pedido-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    items,
    total: Number(total.toFixed(2)),
    status: 'pendiente',
    paymentStatus: 'no procesado',
    createdAt: new Date().toISOString(),
  };

  const orders = await readArray(ordersKey(userId));
  await writeArray(ordersKey(userId), [order, ...orders]);
  await writeArray(cartKey(userId), []);
  return order;
}

export async function loadOrders(userId) {
  return readArray(ordersKey(userId));
}