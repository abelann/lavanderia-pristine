# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [2.0.0] - 2026-11-18

### Added (Agregado)
- **Catálogo y Calculadora (F-05):** Implementación de servicios de lavado normal (S/ 3) y planchado (S/ 4) con cálculo estimado por prenda (`services/serviceCatalog.js`).
- **Carrito de Compras Local (F-06):** Gestión de prendas agregadas, modificación de cantidades y persistencia por usuario en `AsyncStorage` (`services/localCommerce.js`).
- **Gestión de Pedidos en Firestore (F-07):** Registro transaccional en `orders/{orderId}` con identificador persistido para evitar duplicados por reintentos (`services/firestoreOrders.js`).
- **Historial y Panel Administrativo (F-08, F-09, F-10):** Consulta de pedidos por cliente, filtros globales, cambio de estados, caché local, gráfica diaria de 7 días y gestión de perfiles de clientes.
- **Seguridad y Consultas (F-11):** Reglas de acceso en `firestore.rules` e índice compuesto (`userId` + `createdAt`) en `firestore.indexes.json`.

### Changed (Cambiado)
- **Alcance de Ubicación (B-03):** Se retiró el flujo de mapa y GPS en la creación de pedidos debido a errores en emuladores Android; los pedidos nuevos registran `location: null`.

### Fixed (Corregido)
- **Permisos al crear pedidos (B-01):** Se corrigió el error `permission-denied` en Firestore invirtiendo el flujo para escribir el documento antes de consultarlo.
- **Integración de ramas (B-02):** Resolución de conflicto en `.gitignore` tras el *merge* de la rama `feature/calculadora-lavado`.

---

## [1.0.0] - 2026-10-15

### Added (Agregado)
- **Estructura Inicial:** Configuración base del proyecto móvil y web en Expo / React Native.
- **Autenticación y Roles (F-01, F-02, F-04):** Registro, inicio de sesión, recuperación de contraseña con Firebase Auth y navegación separada para roles `cliente` y `admin` (`services/firebaseAuth.js`, `contexts/AuthContext.js`).
- **Perfil de Usuario (F-03):** Edición de nombre y apellido en Firestore (`users/{uid}`), junto con almacenamiento local de foto y preferencia biométrica.