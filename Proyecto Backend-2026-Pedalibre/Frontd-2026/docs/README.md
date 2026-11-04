# Documentación de PedalLibre

## Alcance del backend

El backend implementa los módulos de clientes, estaciones, bicicletas, anclajes, tarifas, reservas, alquileres, eventos de alquiler, movimientos de anclaje, penalidades, mantenimientos y pagos. La autenticación JWT y RBAC se conserva con los roles `ADMIN`, `OPERACIONES`, `MANTENIMIENTO`, `SOPORTE` y `CLIENTE`.

Los flujos más importantes son:

- `GET /api/bicycles/available`: bicicletas activas y disponibles.
- `POST /api/reservations`: crear una reserva.
- `POST /api/rentals/start`: iniciar un alquiler desde una reserva pendiente y una tarifa vigente.
- `POST /api/rentals/finish`: cerrar el alquiler, registrar el evento y calcular el total.
- `POST /api/maintenances`: programar mantenimiento y retirar la bicicleta de disponibilidad.

Los clientes con rol `CLIENTE` sólo pueden crear y consultar sus propias reservas. El inventario se mantiene por movimientos de anclaje y eventos confirmados; no se permite ajustar manualmente el estado de alquiler de una bicicleta.

## Puesta en marcha

1. Copia `.env.example` a `.env` y configura la conexión MySQL y el secreto JWT.
2. Ejecuta el esquema descrito en [`../trazabilidad/pedalibre/README.md`](../trazabilidad/pedalibre/README.md).
3. En una base local de pruebas, define `SEED_ADMIN_PASSWORD` (mínimo 12 caracteres) y ejecuta `npm run db:seed`; el seeder carga el catálogo RBAC y crea/actualiza el usuario `admin`. No guardes esa contraseña en el repositorio ni uses esa cuenta fuera del entorno de pruebas.
4. Inicia el servidor con `npm run dev`. La documentación OpenAPI queda disponible en `/api/docs`.

El backend no crea ni altera tablas automáticamente al arrancar. Para definir tarifas, `calculation_rule` admite `fixed`/`fijo`, `hourly`/`por_hora` y `daily`/`por_dia`. La penalidad se registra con el importe explícito aprobado por el negocio; no se automatiza una política que aún no está especificada.

## Construcción del frontend

- [Informe frontend paso a paso](./informe%20front-paso%20a%20paso.md): procedimiento, resultados, aprendizajes y evidencia visual, actualizado por etapas.
- [ISS-00 — Requisitos previos](./ISS-00-Requisitos-previos.md): preparación del entorno para comenzar el frontend de PedalLibre.
- [ISS-01 — Bootstrap Angular](./ISS-01-Bootstrap-Angular.md): guía para crear la aplicación PedalLibre con Angular, Tailwind y PrimeNG.
- [ISS-02 — Núcleo: environment, modelos, servicios y layout](./ISS-02-Nucleo-Frontend.md): completado; incluye el Shell, Header, Aside, Footer, navegación responsive, servicios y componentes compartidos.
- [ISS-03 — CRUD de clientes con Signals](./ISS-03-CRUD-Clientes-Signals.md): ruta `/clientes` inspeccionada (API 401 sin sesión), 43 pruebas aprobadas y build completado con advertencia de presupuesto; respuesta vacía y CRUD autenticado pendientes de ISS-08; [evidencia](../trazabilidad/E-FRONT-ISS-03-01-estructura-y-plantillas.md).
- [ISS-04 — Estaciones y puntos de anclaje](./ISS-04-CRUD-Estaciones-y-Anclajes.md): preparación de las entidades y la relación estación → anclaje.
- [ISS-05 — Bicicletas y movimientos de anclaje](./ISS-05-Bicicletas-y-Movimientos-de-Anclaje.md): catálogo de flota y operaciones transaccionales de dock/undock.
- [ISS-06 — Tarifas y reservas](./ISS-06-Tarifas-y-Reservas.md): reglas de cálculo, vigencia y reservas de clientes.
- [ISS-07 — Alquileres y cierre de negocio](./ISS-07-Alquileres-y-Cierre-de-Negocio.md): inicio/fin transaccional, auditoría y operación.
- [ISS-08 — Sesión JWT y permisos efectivos](./ISS-08-Sesion-JWT-y-Permisos.md): login, refresh, perfil y almacenamiento de sesión PedalLibre.
- [ISS-09 — Guards y RBAC en la UI](./ISS-09-Guards-y-RBAC-UI.md): rutas, acciones y navegación filtradas por permisos efectivos.
- [ISS-10 — Administración RBAC PedalLibre](./ISS-10-Administracion-RBAC-PedalLibre.md): usuarios, roles, recursos y concesiones role-resource.
- [ISS-11 — Verificación, calidad y cierre](./ISS-11-Verificacion-Calidad-y-Cierre.md): pruebas reales del workspace, integración y despliegue.
