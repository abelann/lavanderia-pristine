import AsyncStorage from '@react-native-async-storage/async-storage';

const CATALOG_CACHE_KEY = 'lavanderia-pristine:service-catalog:v2';

export const INITIAL_SERVICES = [
  { id: 'normal', nombre: 'Lavado + secado ', precio: 8, activo: true },
  { id: 'planchado', nombre: 'Lavado + secado + planchado', precio: 12, activo: true },
];

function isValidCatalog(value) {
  return (
    Array.isArray(value) &&
    value.every(
      (service) =>
        service &&
        typeof service.id === 'string' &&
        typeof service.nombre === 'string' &&
        Number.isFinite(Number(service.precio)) &&
        typeof service.activo === 'boolean'
    )
  );
}

async function readCachedCatalog() {
  try {
    const cachedValue = await AsyncStorage.getItem(CATALOG_CACHE_KEY);
    const cachedData = cachedValue ? JSON.parse(cachedValue) : null;
    const cachedCatalog = Array.isArray(cachedData)
      ? cachedData
      : cachedData?.services;
    return isValidCatalog(cachedCatalog) ? cachedCatalog : null;
  } catch {
    return null;
  }
}

async function writeCachedCatalog(catalog) {
  try {
    await AsyncStorage.setItem(
      CATALOG_CACHE_KEY,
      JSON.stringify({ services: catalog, savedAt: new Date().toISOString() })
    );
  } catch {
    // The remote catalog remains usable when local storage is unavailable.
  }
}

export async function loadServiceCatalog() {
  const cachedCatalog = await readCachedCatalog();
  if (cachedCatalog) return cachedCatalog;

  await writeCachedCatalog(INITIAL_SERVICES);
  return INITIAL_SERVICES;
}
