# Fase II: Frontend — ISS-11: Verificación, calidad y cierre de PedalLibre

**Estado:** frontend: 26 archivos y 71 pruebas aprobadas; build de producción exitoso con advertencia de presupuesto. Backend: build aprobado y flujo real de registro→login verificado contra la base local; flujos de alquiler/anclaje y despliegue siguen pendientes.  
**Proyecto:** PedalLibre, `Frontd-2026`  
**Depende de:** ISS-10 — Administración de RBAC  
**Cierra:** recorrido frontend PedalLibre  
**Revisión del workspace:** 3-nov-2026

> Este documento separa las verificaciones medibles del trabajo pendiente. Los resultados reportados para otras copias o para ISS-02 no son resultados de esta ISS.

## Scripts disponibles en este workspace

El `package.json` actual incluye `npm start`, `npm run build`, `npm run watch`, `npm test` (con aislamiento de archivos) y `npm run ng -- ...`. **No** existe el script `docs:check`, ni `tools/check-docs.mjs`, ni configuración documentada de `maxWorkers`/`runnerConfig`; no uses esos comandos como si ya estuvieran instalados.

Desde `Frontd-2026`:

```bash
npm ci
npm test -- --watch=false
npm run build
npm start
```

### Puertos locales y registro de clientes

En esta copia el backend usa `1704` (`PORT` en `.env`) y permite CORS para `http://localhost:2704` y `http://127.0.0.1:2704`. El frontend inicia en `2704` y consume `http://localhost:1704/api`. Para iniciar ambos, usa dos terminales:

```bash
# Terminal 1: desde 2026-Pedalibre
npm run dev

# Terminal 2: desde 2026-Pedalibre/Frontd-2026
npm start
```

La documentación OpenAPI queda en `http://localhost:1704/api/docs`. El registro público `POST /api/sesion/registro` crea atómicamente un usuario con rol `CLIENTE` y su ficha asociada; requiere que el catálogo RBAC ya tenga sembrado el rol `CLIENTE`. La interfaz de registro está en `http://localhost:2704/register`.

Instala/restaura dependencias solo si el lockfile cambió o el comando falla porque falta un paquete. Para ejecutar CLI local:

```bash
npm run ng -- version
npm run ng -- generate component features/example/example --standalone
```

El build usa los budgets que realmente aparecen en `angular.json` (initial warning 500 kB, error 1 MB; estilo warning 4 kB, error 8 kB). Registra el aviso si ocurre; no subas el límite sin justificarlo ni ocultes warnings.

## Integración local

1. Verifica que MySQL usa el esquema PedalLibre documentado en `trazabilidad/pedalibre/pedalibre.sql`.
2. Desde el backend, revisa `.env.example`, configura un `.env local ignorado por Git` y confirma el puerto real. Esta copia del frontend apunta a `http://localhost:1704/api`.
3. Ejecuta las instrucciones de seed del backend y arráncalo con su script `npm run dev`. No asumas seed de usuarios: el esquema SQL inicial crea roles/recursos, no contraseñas.
4. Usa credenciales de prueba configuradas por el equipo; no las pongas en documentación ni terminal compartida.
5. Prueba login, perfil, permisos, rutas de negocio permitidas, `401`, `403`, conflictos `409` y cierre de sesión. No uses un backend abierto como sustituto de RBAC.
6. Comprueba los flujos que cambian estado: anclar/desanclar y alquiler inicio/fin. Contrasta antes/después en API/BD de prueba y registra solo IDs/datos no sensibles.

Las pruebas unitarias con `HttpTestingController` validan el cliente, no el backend ni transacciones reales. Marca por separado los resultados simulados y los recorridos E2E.

### Comandos concretos de integración

En Ubuntu WSL, inicia el backend en una terminal desde su carpeta:

```bash
cd "$HOME/ia-lab/projecs/desarrollo web/Pedalibre-Desarrollo Web/dw-2026-Futbol-Total/Proyecto Backend-2026-Pedalibre"
npm run build
read -r -s -p "Contraseña temporal para el admin local (mínimo 12 caracteres): " SEED_ADMIN_PASSWORD
export SEED_ADMIN_PASSWORD
printf '\n'
npm run db:seed
unset SEED_ADMIN_PASSWORD
npm run dev
```

El seeder crea/actualiza el usuario `admin` y exige `SEED_ADMIN_PASSWORD` de al menos 12 caracteres. Úsalo solo en una base local de pruebas; no pongas el valor en el comando, `.env` compartido ni documentación. Si el seed falla, no continúes con pruebas de login.

En otra terminal, desde `Frontd-2026`, comprueba el endpoint de documentación y que frontend/backend comparten host y puerto:

```bash
cd "$HOME/ia-lab/projecs/desarrollo web/Pedalibre-Desarrollo Web/dw-2026-Futbol-Total/Proyecto Backend-2026-Pedalibre/Frontd-2026"
grep -R "apiUrl" src/environments
curl -sS -o /dev/null -w 'OpenAPI HTTP %{http_code}\n' http://localhost:1704/api/docs
npm start
```

Si `.env` configura otro puerto, sustituye `1704` en las comprobaciones y en ambos environments. No imprimas el `.env` completo: puede contener secretos.

Este bloque solicita credenciales sin mostrarlas, crea el JSON de login con `node` (evita interpolar la contraseña en argumentos de `curl`) y no imprime los tokens:

```bash
read -r -p "Usuario PedalLibre de prueba: " PEDALIBRE_USER
read -r -s -p "Contraseña: " PEDALIBRE_PASSWORD
printf '\n'
LOGIN_JSON=$(PEDALIBRE_USER="$PEDALIBRE_USER" PEDALIBRE_PASSWORD="$PEDALIBRE_PASSWORD" node -e \
  'process.stdout.write(JSON.stringify({identifier:process.env.PEDALIBRE_USER,password:process.env.PEDALIBRE_PASSWORD}))' \
  | curl -fsS -X POST http://localhost:1704/api/sesion/login \
      -H 'Content-Type: application/json' --data-binary @-)
unset PEDALIBRE_PASSWORD
unset PEDALIBRE_USER
ACCESS_TOKEN=$(printf '%s' "$LOGIN_JSON" | node -e \
  'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).access_token))')
REFRESH_TOKEN=$(printf '%s' "$LOGIN_JSON" | node -e \
  'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).refresh_token))')
unset LOGIN_JSON
api() {
  curl --config <(printf 'header = "Authorization: Bearer %s"\n' "$ACCESS_TOKEN") -fsS "$@"
}
export REFRESH_TOKEN
api http://localhost:1704/api/sesion/perfil | node -e \
  'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.stringify(JSON.parse(s).user)))'
api http://localhost:1704/api/permisos | node -e \
  'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log("Permisos:",JSON.parse(s).permissions.length))'
```

Al finalizar, cierra la sesión del token de refresh y limpia las variables:

```bash
REFRESH_TOKEN="$REFRESH_TOKEN" node -e \
  'process.stdout.write(JSON.stringify({refresh_token:process.env.REFRESH_TOKEN}))' \
  | curl -fsS -X POST http://localhost:1704/api/sesion/logout \
      -H 'Content-Type: application/json' --data-binary @-
unset ACCESS_TOKEN REFRESH_TOKEN PEDALIBRE_USER
```

No agregues estas variables a archivos `.http`, scripts versionados, capturas ni documentos. Para comprobar un permiso funcional se usa exactamente el método/ruta que apareció en `permissions`; un resultado `403` debe registrarse como falta de autorización y no ocultarse.

### Prueba del flujo de alquiler contra la API

Solo sobre una base aislada de pruebas con reserva y tarifa válidas. Define `api()` como en el bloque de login, identifica IDs reales con rutas permitidas y solicita los IDs; no copies IDs inventados. El helper mantiene el token fuera de los argumentos de `curl`.

```bash
read -r -p "ID numérico de reserva pendiente: " RESERVATION_ID
read -r -p "ID numérico de tarifa vigente: " RATE_ID
START_JSON=$(node -e '
  const [reservation_id, rate_id] = process.argv.slice(1).map(Number);
  if (!Number.isSafeInteger(reservation_id) || reservation_id < 1 ||
      !Number.isSafeInteger(rate_id) || rate_id < 1) process.exit(2);
  process.stdout.write(JSON.stringify({ reservation_id, rate_id }));
' "$RESERVATION_ID" "$RATE_ID" | api -i -X POST http://localhost:1704/api/rentals/start \
  -H 'Content-Type: application/json' --data-binary @-)
printf '%s\n' "$START_JSON" | node -e \
  'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.stringify(JSON.parse(s.split(/\r?\n\r?\n/).pop()).rental)))'
RENTAL_ID=$(printf '%s' "$START_JSON" | node -e '
  let s = "";
  process.stdin.on("data", d => s += d).on("end", () => {
    const body = s.slice(s.indexOf("\r\n\r\n") + 4);
    process.stdout.write(String(JSON.parse(body).rental.id));
  });
')
unset START_JSON RESERVATION_ID RATE_ID
```

Completa el cierre únicamente después de revisar la respuesta de inicio. El ID extraído se usa como referencia; el frontend no calcula total ni estado:

```bash
FINISH_JSON=$(node -e \
  'process.stdout.write(JSON.stringify({rental_id:Number(process.env.RENTAL_ID)}))' \
  | api -i -X POST http://localhost:1704/api/rentals/finish \
      -H 'Content-Type: application/json' --data-binary @-)
printf '%s\n' "$FINISH_JSON"
unset FINISH_JSON RENTAL_ID
```

Antes del bloque de cierre, exporta el ID obtenido para el `node` que construye el cuerpo: `export RENTAL_ID`. Contrasta `GET /api/rentals`, `/api/bicycles`, `/api/reservations` y `/api/rental-events` después: el total lo calcula el servidor, la reserva/alquiler y el estado de la bicicleta deben corresponder al flujo. No ejecutes estas escrituras contra datos reales o compartidos sin autorización.

## Calidad de UI y navegador

- Consola sin errores Angular; inspecciona fallos de red en Network.
- Prueba navegación directa y recarga en rutas anidadas del Shell.
- Viewports mínimos: escritorio y móvil estrecho (por ejemplo 375 × 667); comprueba menú, tablas con scroll y ausencia de desbordes horizontales de página.
- Labels para entradas, nombres accesibles para botones de icono, estados de foco y no depender solo del color.
- Errores de API visibles; los estados de carga, vacío, error y éxito no deben confundirse.
- Revisa `npm test -- --watch=false` y `npm run build` tras los últimos cambios; guarda evidencia de esa ejecución concreta.

## Publicación

```bash
npm run build
```

Publica únicamente la carpeta de salida indicada por el propio log de Angular. El hosting debe servir `index.html` como fallback para rutas SPA; configura `apiUrl` de producción mediante el mecanismo aprobado para el despliegue y habilita CORS en backend para el origen publicado. No incluyas `.env`, refresh tokens, JWT ni credenciales en artefactos estáticos.

Ejemplo de fallback para Nginx (sustituye el directorio por la ruta de publicación real):

```nginx
server {
    listen 80;
    server_name pedalibre.example;
    root /srv/www/pedalibre;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Después de publicar, ejecuta `curl -I https://<dominio>/` y `curl -I https://<dominio>/stations`; ambos deben devolver el documento SPA. Completa CORS con el origen exacto del frontend en la configuración del backend, no con `*` para una sesión autenticada.

## Resultado de esta ejecución

- `npm test -- --watch=false`: 26 archivos y 71 pruebas aprobadas. El script aplica `--isolate` para evitar interferencia entre archivos.
- `npm run build` frontend: completado; bundle inicial de 550.15 kB, 50.15 kB sobre el presupuesto de 500 kB. Es advertencia, no fallo.
- `npm run build` backend: completado.
- Registro público, login, perfil, permisos efectivos y logout reales: HTTP 201; las cuatro consultas devolvieron HTTP 200. Verifiqué el permiso de dashboard para el rol CLIENTE y borré la cuenta temporal al terminar.
- OpenAPI respondió HTTP 200; el preflight CORS para `http://127.0.0.1:2704` respondió HTTP 204.
- Login y formulario de registro se visualizaron; `/stations` redirige a login cuando no existe sesión.
- Las verificaciones anteriores contra el puerto 3002 son históricas; la configuración actual usa backend `1704` y frontend `2704`.
- No se verificaron contra el backend los flujos de reservas, anclaje, alquiler, autorización de rutas de negocio ni despliegue productivo.

## Checklist de cierre

- [x] ISS-03 a ISS-10 están implementados en el workspace PedalLibre y cubiertos por pruebas frontend.
- [x] `npm test -- --watch=false` y `npm run build` completan en el estado final.
- [x] Registro público real crea usuario/ficha CLIENTE en transacción y permite iniciar sesión.
- [ ] Rutas de negocio autenticadas recorren el Shell contra backend real.
- [x] La renovación de sesión y la protección de rutas están cubiertas por pruebas frontend.
- [x] La UI usa permisos efectivos PedalLibre, no una matriz de roles importada.
- [ ] Integridad bicicleta/anclaje/reserva/alquiler se verifica en API de prueba tras los flujos transaccionales.
- [ ] Pruebas visuales desktop/móvil y accesibilidad básica de todas las pantallas quedan registradas.
- [x] Errores, limitaciones y resultados pendientes se distinguen de los verificados.
- [ ] El `dist` de producción funciona con fallback SPA y CORS del entorno de destino.

**Cierre:** ISS-04 a ISS-10 están implementadas; el registro y login funcionan contra la base local. ISS-11 sigue parcialmente cerrada hasta probar los flujos de negocio y el despliegue de destino.  
**Ruta de lectura:** ← ISS-10 · ↑ [índice de guías](./README.md)
