# Base de datos PedalLibre

## Alcance

Este directorio contiene el esquema inicial completo para MySQL 8.0+:

- [`pedalibre.sql`](./pedalibre.sql): crea `Proyecto-Pedalibre-DW`, crea las tablas de negocio y seguridad, y carga roles, recursos y permisos iniciales.
- El script puede ejecutarse varias veces. Usa `CREATE DATABASE/TABLE IF NOT EXISTS` y operaciones `ON DUPLICATE KEY UPDATE`; no elimina bases, tablas ni registros.

## Requisitos

- MySQL 8.0 o posterior.
- Un usuario MySQL con permisos para crear la base de datos, tablas, índices, claves foráneas e insertar los datos iniciales.
- Cliente de terminal `mysql`.

## Ejecución desde la raíz del backend

```bash
mysql -h localhost -P 3306 -u root -p < "Frontd-2026/trazabilidad/pedalibre/pedalibre.sql"
```

Reemplaza `localhost`, `3306` y `root` según la conexión de tu servidor. La opción `-p` solicita la contraseña de forma interactiva; no la escribas en el comando.

También se puede abrir el cliente MySQL y ejecutar el archivo así:

```sql
SOURCE Frontd-2026/trazabilidad/pedalibre/pedalibre.sql;
```

## Verificación

Después de ejecutar el script:

```bash
mysql -h localhost -P 3306 -u root -p -e \
  "USE \`Proyecto-Pedalibre-DW\`; SHOW TABLES;"
```

Se deben encontrar estas 17 tablas: `roles`, `resources`, `role_resources`, `users`, `refresh_tokens`, `clients`, `stations`, `bicycles`, `docking_points`, `rates`, `reservations`, `rentals`, `rental_events`, `bicycle_dockings`, `penalties`, `maintenances` y `payments`. `refresh_tokens` es la tabla complementaria que utiliza la autenticación por sesiones del backend.

```bash
mysql -h localhost -P 3306 -u root -p -e \
  "USE \`Proyecto-Pedalibre-DW\`; SELECT name FROM roles ORDER BY role_id; SELECT method, path FROM resources ORDER BY resource_id;"
```

## Entidades y relaciones

| Proyecto / imagen | Tabla SQL | Relación principal |
|---|---|---|
| Cliente | `clients` | Un cliente puede tener muchas reservas y alquileres; puede vincularse opcionalmente a un usuario. |
| Bicicleta | `bicycles` | Puede participar en reservas y alquileres, y tener historial de anclajes y mantenimiento. |
| Estación | `stations` | Una estación contiene muchos puntos de anclaje (`docking_points`). |
| Anclaje | `docking_points` | Pertenece a una estación. `bicycle_dockings` registra el historial de anclaje y desanclaje de bicicletas. |
| Reserva | `reservations` | Pertenece a un cliente y puede asociarse a una bicicleta y estación. |
| Alquiler | `rentals` | Pertenece a cliente, bicicleta y tarifa; puede originarse en una reserva. |
| EventoAlquiler | `rental_events` | Muchos eventos pueden pertenecer a un alquiler. |
| Tarifa | `rates` | Una tarifa puede utilizarse en muchos alquileres. |
| Penalidad | `penalties` | `reference_id` referencia el alquiler al que se aplica. |
| Mantenimiento | `maintenances` | `resource_id` referencia la bicicleta mantenida. |
| Pago | `payments` | `reference_type` identifica el tipo de referencia y `reference_id` referencia el alquiler. |
| Roles y recursos RBAC | `roles`, `resources`, `role_resources` | Relación muchos-a-muchos entre roles y recursos protegidos. |
| Usuario | `users` | Pertenece a un rol y opcionalmente se vincula a un cliente. |

El inventario por estación debe derivarse de los movimientos confirmados. `bicycle_dockings` conserva el historial: un movimiento activo es aquel cuyo `undocked_at` es `NULL`; los cierres y devoluciones deben registrarse como movimientos/eventos, no como ajustes manuales de inventario. Índices únicos sobre columnas generadas impiden más de un alquiler activo por bicicleta y más de una bicicleta en el mismo anclaje activo.

Las claves foráneas de `rentals.bicycle_id`, `bicycle_dockings.bicycle_id` y `bicycle_dockings.docking_point_id` usan `ON UPDATE RESTRICT`: esas columnas alimentan índices únicos de columnas generadas y MySQL no permite propagarles una actualización en cascada.

## Roles y permisos cargados

El script crea de forma idempotente `ADMIN`, `OPERACIONES`, `MANTENIMIENTO`, `SOPORTE` y `CLIENTE`, más los recursos de referencia para consultar bicicletas, crear reservas, iniciar/finalizar alquileres y registrar mantenimientos. También asigna permisos iniciales mediante `role_resources`.

El script no crea usuarios de acceso ni inserta contraseñas. Los usuarios deben crearse posteriormente utilizando el flujo de autenticación del backend y guardando hashes seguros.

## Configuración del backend

El backend lee su conexión desde variables de entorno. Para MySQL, establece:

```env
DB_DIALECT=mysql
DB_MYSQL_NAME=Proyecto-Pedalibre-DW
```

Usa [`.env.example`](../../../.env.example) como plantilla y copia sus valores a `.env`; completa host, puerto, usuario y contraseña de acuerdo con tu servidor, y no publiques credenciales. `.env` no se debe incluir en control de versiones.

## API PedalLibre

El backend expone los módulos de clientes, estaciones, bicicletas, anclajes, tarifas, reservas, alquileres, eventos, movimientos de anclaje, penalidades, mantenimientos y pagos. Los flujos operativos son `GET /api/bicycles/available`, `POST /api/reservations`, `POST /api/rentals/start`, `POST /api/rentals/finish`, y `POST /api/maintenances`. Los endpoints protegidos usan JWT y permisos RBAC; los permisos se pueden volver a sembrar con `npm run db:seed`.

El cierre del alquiler calcula `total` con `calculation_rule` `fixed`/`fijo`, `hourly`/`por_hora` o `daily`/`por_dia`. Para evitar inventar políticas comerciales, los importes de penalidad se registran explícitamente en `penalties.amount`; no se infiere automáticamente una multa sin una regla definida por el negocio.

El servidor no ejecuta `sequelize.sync()` al arrancar: el esquema se crea y versiona mediante este script. Ejecuta el SQL antes de iniciar el backend.
