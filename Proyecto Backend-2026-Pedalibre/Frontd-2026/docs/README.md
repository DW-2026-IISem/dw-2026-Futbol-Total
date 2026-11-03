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
3. Ejecuta `npm run db:seed` para cargar los permisos RBAC y crear el usuario administrador inicial.
4. Inicia el servidor con `npm run dev`. La documentación OpenAPI queda disponible en `/api/docs`.

El backend no crea ni altera tablas automáticamente al arrancar. Para definir tarifas, `calculation_rule` admite `fixed`/`fijo`, `hourly`/`por_hora` y `daily`/`por_dia`. La penalidad se registra con el importe explícito aprobado por el negocio; no se automatiza una política que aún no está especificada.

## Construcción del frontend

- [Informe frontend paso a paso](./informe%20front-paso%20a%20paso.md): procedimiento, resultados, aprendizajes y evidencia visual, actualizado por etapas.
- [ISS-00 — Requisitos previos](./ISS-00-Requisitos-previos.md): preparación del entorno para comenzar el frontend de PedalLibre.
- [ISS-01 — Bootstrap Angular](./ISS-01-Bootstrap-Angular.md): guía para crear la aplicación PedalLibre con Angular, Tailwind y PrimeNG.
