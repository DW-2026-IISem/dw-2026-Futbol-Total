# Fase II: Frontend — ISS-11: Verificación, calidad y cierre de PedalLibre

**Estado:** preparado; no equivale a cierre funcional ni E2E.  
**Proyecto:** PedalLibre, `Frontd-2026`  
**Depende de:** ISS-10 — Administración de RBAC  
**Cierra:** recorrido frontend PedalLibre  
**Revisión del workspace:** 3-nov-2026

> Este documento separa las verificaciones medibles del trabajo pendiente. Los resultados reportados para otras copias o para ISS-02 no son resultados de esta ISS.

## Scripts disponibles en este workspace

El `package.json` actual incluye `npm start`, `npm run build`, `npm run watch`, `npm test` y `npm run ng -- ...`. **No** existe el script `docs:check`, ni `tools/check-docs.mjs`, ni configuración documentada de `maxWorkers`/`runnerConfig`; no uses esos comandos como si ya estuvieran instalados.

Desde `Frontd-2026`:

```bash
npm ci
npm test -- --watch=false
npm run build
npm start
```

Instala/restaura dependencias solo si el lockfile cambió o el comando falla porque falta un paquete. Para ejecutar CLI local:

```bash
npm run ng -- version
npm run ng -- generate component features/example/example --standalone
```

El build usa los budgets que realmente aparecen en `angular.json` (initial warning 500 kB, error 1 MB; estilo warning 4 kB, error 8 kB). Registra el aviso si ocurre; no subas el límite sin justificarlo ni ocultes warnings.

## Integración local

1. Verifica que MySQL usa el esquema PedalLibre documentado en `trazabilidad/pedalibre/pedalibre.sql`.
2. Desde el backend, revisa `.env.example`, configura un `.env local ignorado por Git` y confirma el puerto real. El frontend de esta copia apunta a `http://localhost:3002/api`; cambia ambos lados si la API escucha en otro puerto.
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
curl -sS -o /dev/null -w 'OpenAPI HTTP %{http_code}\n' http://localhost:3002/api/docs
npm start
```

Si `.env` configura otro puerto, sustituye `3002` en las comprobaciones y en ambos environments. No imprimas el `.env` completo: puede contener secretos.

Este bloque solicita credenciales sin mostrarlas, crea el JSON de login con `node` (evita interpolar la contraseña en argumentos de `curl`) y no imprime los tokens:

```bash
read -r -p "Usuario PedalLibre de prueba: " PEDALIBRE_USER
read -r -s -p "Contraseña: " PEDALIBRE_PASSWORD
printf '\n'
LOGIN_JSON=$(PEDALIBRE_USER="$PEDALIBRE_USER" PEDALIBRE_PASSWORD="$PEDALIBRE_PASSWORD" node -e \
  'process.stdout.write(JSON.stringify({identifier:process.env.PEDALIBRE_USER,password:process.env.PEDALIBRE_PASSWORD}))' \
  | curl -fsS -X POST http://localhost:3002/api/sesion/login \
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
api http://localhost:3002/api/sesion/perfil | node -e \
  'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.stringify(JSON.parse(s).user)))'
api http://localhost:3002/api/permisos | node -e \
  'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log("Permisos:",JSON.parse(s).permissions.length))'
```

Al finalizar, cierra la sesión del token de refresh y limpia las variables:

```bash
REFRESH_TOKEN="$REFRESH_TOKEN" node -e \
  'process.stdout.write(JSON.stringify({refresh_token:process.env.REFRESH_TOKEN}))' \
  | curl -fsS -X POST http://localhost:3002/api/sesion/logout \
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
' "$RESERVATION_ID" "$RATE_ID" | api -i -X POST http://localhost:3002/api/rentals/start \
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
  | api -i -X POST http://localhost:3002/api/rentals/finish \
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

## Checklist de cierre

- [ ] ISS-03 a ISS-10 están implementados en el workspace PedalLibre y sus criterios están respaldados por pruebas propias.
- [ ] `npm test -- --watch=false` y `npm run build` pasan en el estado final.
- [ ] Rutas de clientes, estaciones, anclajes, bicicletas, tarifas, reservas y operación de alquiler recorren el Shell correctamente.
- [ ] La sesión se renueva de forma controlada y las peticiones protegen las rutas.
- [ ] Los roles PedalLibre se comprueban con permisos efectivos, no por una matriz importada.
- [ ] Integridad de bicicleta/anclaje/reserva/alquiler se verifica en API de prueba tras flujos transaccionales.
- [ ] Pruebas visuales desktop/móvil y accesibilidad básica quedan registradas.
- [ ] Errores, limitaciones y resultados pendientes se distinguen de los verificados.
- [ ] El dist de producción funciona con fallback SPA y configuración de API/CORS de destino.

### Estado de evidencia inicial

ISS-02 reportó 12 archivos de prueba y 30 casos aprobados, además de un build correcto. Ese resultado solo acredita el núcleo de esa ISS y no sustituye la suite final del recorrido. Para el trabajo nuevo, no se ha ejecutado aquí ninguna prueba del CRUD de negocio, autenticación, permisos ni integración real; se mantienen pendientes hasta ejecutar los comandos y recorridos anteriores.

**Cierre:** esta ISS se completa cuando cada casilla aplicable tiene evidencia de PedalLibre y los resultados se actualizaron en el informe paso a paso.  
**Ruta de lectura:** ← ISS-10 · ↑ [índice de guías](./README.md)
