# Fase 0 — ISS-00: Requisitos previos

**Estado:** completado  
**Proyecto:** PedalLibre — frontend en `Frontd-2026`  
**Bloqueado por:** ninguno  
**Habilita:** ISS-01 — creación del workspace Angular

> **Alcance de las comprobaciones:** solo cuentan las indicadas en la sección adaptada a PedalLibre y las evidencias del backend de este repositorio. El texto original al final se conserva por solicitud, pero sus nombres, versiones, credenciales, puertos, rutas y cantidades de permisos no son instrucciones ni criterios de aceptación para PedalLibre.

## Contexto que tengo

Estoy preparando el frontend de PedalLibre, no el proyecto Storelab del ejemplo de referencia. El backend de este repositorio usa Express 5, TypeScript y Sequelize. Su contrato de sesión incluye `POST /api/sesion/login`, `GET /api/sesion/perfil` y `GET /api/permisos`; las rutas de negocio, como `/api/clientes`, requieren autenticación y autorización.

La carpeta `Frontd-2026` todavía no tiene `src/` ni `package.json`. El material de referencia propone Angular 22, PrimeNG 22, Tailwind CSS 4 y TypeScript 6; comprobaré la compatibilidad al crear el workspace en ISS-01, porque esas dependencias todavía no están instaladas en esta carpeta.

El backend toma el puerto de `PORT`. La plantilla `.env.example` declara `3002` y la aplicación usa `4000` si `PORT` no está definido. En las capturas de esta etapa se observa el servidor escuchando en el puerto `3002`. La contraseña del usuario `admin` se define localmente mediante `SEED_ADMIN_PASSWORD`; no la escribiré aquí.

## Objetivo

Dejar comprobado el entorno necesario para empezar el frontend: Node.js, npm, Angular CLI, navegador y backend de PedalLibre accesible. En este ISS no crearé código Angular.

## Criterios de aceptación

### 0.1 Node.js, npm y Angular CLI

- [x] `node -v` responde con Node.js `v24.21.0`, compatible con los requisitos mostrados para Angular CLI `22.2.5`.
- [x] `npm -v` responde con npm `12.2.1`.
- [x] `ng version` identifica Angular CLI `22.2.5`.
- [x] `command -v ng` apunta a `/home/oscar_vega/.nvm/versions/node/v24.21.0/bin/ng`.

Desde una terminal en `Frontd-2026`:

```bash
node -v
npm -v
ng version
```

Antes de instalar un CLI global, consultaré la versión y sus requisitos de Node:

```bash
npm view @angular/cli@22 version engines --json
```

No usaré `--force` para omitir incompatibilidades. Confirmaré el stack efectivo al generar el proyecto en ISS-01.

### 0.2 Backend y base de datos

- [x] Confirmo que la configuración local usa MySQL, puerto `3306`, base `Proyecto-Pedalibre-DW`, y que el esquema contiene las tablas de PedalLibre.
- [x] `npm run db:seed` termina sin error; el log muestra `PedalLibre RBAC seeders finalizados`.
- [x] `npm run dev` inicia el backend y muestra el puerto `3002`.
- [x] `GET /api/clientes` sin token devuelve `401 Unauthorized`.

Desde una terminal en `Frontd-2026`, el backend está en la carpeta padre:

```bash
cd ..
npm ci
npm run db:seed
npm run dev
```

El esquema SQL está en `Frontd-2026/trazabilidad/pedalibre/pedalibre.sql` y se ejecuta siguiendo [`trazabilidad/pedalibre/README.md`](../trazabilidad/pedalibre/README.md); el backend no lo aplica automáticamente al arrancar. El seeder de npm carga roles, recursos, permisos y el usuario administrador. Antes de ejecutarlo, comprobaré que estoy apuntando a mi base de desarrollo: el seeder escribe en ella.

La captura de la comprobación HTTP usa el puerto `3002`:

```bash
curl -i http://localhost:3002/api/clientes
```

Sin token, la respuesta observada `401 Unauthorized` confirma que la ruta protegida responde. `ECONNREFUSED` indicaría que no hay un servidor escuchando en ese puerto.

### 0.3 Login y permisos

- [x] Envío `POST /api/sesion/login` con `identifier: "admin"` y la contraseña que configuré localmente en `SEED_ADMIN_PASSWORD`; la respuesta fue HTTP 200.
- [x] La respuesta incluye `access_token` y `refresh_token`.
- [x] Con el token consulto `GET /api/sesion/perfil` y recibo `{ "user": ... }` con HTTP 200.
- [x] Con el token consulto `GET /api/permisos` y recibo `{ "permissions": [...] }` con HTTP 200; la respuesta contiene 84 permisos.

El contrato que revisaré es:

```json
{
  "identifier": "admin",
  "password": "<SEED_ADMIN_PASSWORD configurada localmente>"
}
```

No guardaré tokens, contraseñas ni respuestas con datos sensibles en las capturas o en el repositorio. La captura entregada muestra las respuestas exitosas del backend de PedalLibre: HTTP 200 para login, perfil y permisos; recibí 84 permisos. No usaré cantidades del ISS original como expectativa para este proyecto.

### 0.4 Usuario de prueba

- [x] Confirmo que el usuario administrador existe en la base activa y que las credenciales locales permiten iniciar sesión.
- [ ] Si necesito probar permisos de otro rol, verifico primero que ese usuario exista y que su contraseña provenga de una configuración local segura.

El seeder revisado define un usuario canónico `admin`. No asumiré usuarios `seller`, contraseñas de ejemplo ni cantidades de permisos de otro proyecto.

### 0.5 Navegador y herramientas

- [x] Abro `http://localhost:3002/api/clientes` en el navegador de Windows y recibo el mensaje de token ausente o inválido.
- [x] Abro DevTools y confirmo que tengo disponibles Console y Network.

Intenté abrir `/api/clientes` con `xdg-open` desde WSL, pero el comando no encontró un navegador instalado en ese entorno. Después abrí la dirección en el navegador de Windows; la página muestra `{"error":"Missing or invalid Bearer token"}`. Esa respuesta confirma que el backend respondió a la petición sin token. Abrí DevTools y comprobé que Console y Network están disponibles. Recargué la página con Network abierto y el contador registró una solicitud.

La tabla de Network no muestra los detalles de la solicitud en la captura, así que no afirmo que haya inspeccionado sus cabeceras. Revisaré `Authorization` cuando el frontend realice solicitudes autenticadas.

### 0.6 Estructura de trabajo

- [x] Existe la carpeta `Frontd-2026`.
- [x] Existe `docs/`.
- [x] Existe `trazabilidad/`.
- [x] No hay `src/` ni `package.json` de Angular todavía.
- [x] La carpeta existente está lista para crear el workspace en ISS-01 sin generar una subcarpeta accidental.

## Procedimiento, verificación y resultado

Las capturas recibidas documentan estos pasos y resultados:

1. Consulté `node -v`, `npm -v` y `ng version`. La terminal muestra Node.js `v24.21.0`, npm `12.2.1` y Angular CLI `22.2.5`.
2. Consulté `npm view @angular/cli@22 version engines --json`. La salida incluye Angular CLI `22.2.5` y requisitos de Node que admiten `24.21.0`.
3. En la terminal del backend ejecuté `npm ci` y `npm run db:seed`. La evidencia intermedia muestra la instalación y la siembra en curso; la captura siguiente muestra que el seeder RBAC finalizó.
4. Inicié el backend con `npm run dev`. El log muestra la conexión a MySQL y el servidor escuchando en el puerto `3002`.
5. Consulté `GET /api/clientes` sin token y obtuve `HTTP/1.1 401 Unauthorized`.
6. Ejecuté `command -v ng` y confirmé que apunta al `ng` de la instalación npm administrada por `nvm`; `ng version` muestra Angular CLI `22.2.5`. La misma evidencia muestra `PORT=3002`, `DB_DIALECT=mysql`, `DB_MYSQL_PORT=3306` y `DB_MYSQL_NAME=Proyecto-Pedalibre-DW`.
7. Consulté las tablas de `Proyecto-Pedalibre-DW` mediante el contenedor MySQL. La salida muestra las tablas del esquema de PedalLibre.
8. Abrí DevTools y comprobé Console y Network. Recargué la página con Network seleccionado; el contador registró una solicitud. La captura no muestra detalles suficientes para afirmar que inspeccioné las cabeceras.

La captura también muestra que `GET /` responde `Cannot GET /`; esa ruta raíz no es la prueba de la API. La comprobación de la ruta protegida `/api/clientes` sí se documenta por separado.

En un primer intento, recibí `ConnectionRefusedError: [Errno 111] Connection refused`, porque no había un servidor escuchando en ese momento; ese intento no comprobó las credenciales. Después de iniciar de nuevo el backend, ejecuté la prueba contra `http://localhost:3002`. La evidencia muestra `Login: HTTP 200` con los campos de tokens esperados, `Perfil: HTTP 200` con respuesta que contiene `user` y `Permisos: HTTP 200` con 84 permisos.

La evidencia de que `xdg-open` no encontró navegador en WSL confirma que ese intento no abrió la página; después abrí la API en el navegador de Windows. La inspección de cabeceras de autorización queda para las solicitudes autenticadas del frontend en ISS posteriores.

## Evidencia

Las capturas de evidencia se presentan únicamente en el [informe paso a paso](./informe%20front-paso%20a%20paso.md). Los archivos originales se conservan en `../trazabilidad/`.

## Cierre

ISS-00 completado: están verificadas las condiciones previas de PedalLibre y Console y Network están disponibles. No creé código Angular en esta fase. El paso siguiente es ISS-01.

---

# Texto original recibido (sin adaptar; solo referencia, no ejecutar para PedalLibre)

🛠 Unidad ISS-00 · Requisitos previos — capa 🛠 CONSTRUIR🧠 Comprender este bloque → · ↑ Ruta Frontend-ExpressCapaPáginaPara qué🧠 AprenderRequisitos previoscomprender, explicar y relacionar🛠 Construiresta páginaejecutar, verificar y entregarFase 0: Preparación — ISS-00 — Requisitos previosVigencia · revisión local del 23-oct-2026. La copia usa Angular 22, PrimeNG 22, Tailwind 4 y TypeScript 6 según sus manifiestos. Los servicios inspeccionados declaran @Injectable, no @Service. La ruta /construir permite iniciar el recorrido visual sin API. La conexión, siembra y credenciales activas requieren evidencia funcional separada. Los bloques de código de la guía pueden representar incrementos; los archivos locales citados son la referencia consolidada.Vigencia · revisión local del 23-oct-2026. Los pasos describen una construcción incremental en una copia de práctica. El código consolidado puede incluir fases posteriores. Los resultados importados son reportes de la fuente, no pruebas repetidas en esta actualización. Véase estado y trazabilidad.

## Contexto mínimo (autosuficiente)

Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que hay que saber antes de ejecutarlo.

- Proyecto: front-storelab-express-ii — Angular 22 (standalone + signals), PrimeNG 22 en modo styled con Aura y Tailwind CSS 4. Sin CSS propio ni PrimeFlex.
- Backend de referencia: app-storelab-express-ii — Express 5 + TypeScript + Sequelize, arquitectura por features. Sus ISS están en docs/manual/.
- Recorrido obligatorio de una petición: Componente → Service → HttpClient → Interceptor → API → Controller → Service → Repository → Model → BD. La UI no conoce Sequelize ni la base de datos.
- Contrato REST (endpoints, respuestas y códigos): ../README.md#contrato-rest-del-backend.
- Patrón visual y convenciones: PATRON-VISUAL.md.

## Este ISS

- Título: Requisitos previos
- Feature / tabla: —
- API: —
- Depende de: ninguno (es el primero)
- Habilita: ISS-01 — Bootstrap Angular 22 con CLI

## Contenido de este ISS

- Criterios de aceptación (ISS-00) — consolidados
- 0.1 Node, npm y Angular CLI
- 0.2 Backend en marcha
- 0.3 Login y permisos
- 0.4 Credenciales del seeder
- 0.5 Navegador y herramientas
- 0.6 Estructura de trabajo
- Verificación del ISS
- Cierre del ISS

Objetivo: dejar el equipo listo para construir el frontend: Node, npm, Angular CLI, navegador, backend Express corriendo y base de datos sembrada. Al terminar este ISS no se ha escrito código de Angular todavía; solo se comprueba el entorno.

Bloqueado por: ninguno.

Evidencia de aprendizaje: explica qué ejecuta WSL y qué abre el navegador de Windows.

## Criterios de aceptación (ISS-00) — consolidados

- [ ] 0.1 node -v cumple los engines del CLI consultado y npm -v responde
- [ ] 0.1 ng version identifica Angular CLI 22.x (y no otro programa llamado ng)
- [ ] 0.2 npm run db:seed termina sin error y npm run dev deja el puerto 4000 escuchando
- [ ] 0.3 POST /api/sesion/login con admin / Admin123! devuelve access_token y refresh_token
- [ ] 0.3 GET /api/permisos con ese token devuelve permissions (58 para admin)
- [ ] 0.4 seller / Seller123! inicia sesión y /api/permisos devuelve 7 permisos
- [ ] 0.5 DevTools con Console y Network disponibles para revisar cada petición
- [ ] 0.6 La carpeta del frontend existe y está vacía de código: sin src/ ni package.json; solo docs/ y configuración del repositorio
- [ ] curl -i http://localhost:4000/api/clientes responde 401 (backend final) o 200 (backend en Fase I)

## 0.1 Node, npm y Angular CLI

### Criterios de este sub-ítem

- [ ] node -v cumple engines.node de @angular/cli
- [ ] npm -v cumple engines.npm
- [ ] ng version muestra Angular CLI 22.x
- [ ] command -v ng apunta a la instalación npm y no a otro programa

En Ubuntu WSL, antes de crear el proyecto:

```bash
node --version
npm --version
npm view @angular/cli version engines --json
npm install -g @angular/cli
ng version
```

npm install -g @angular/cli instala la versión publicada como latest, sin fijar una versión mayor. No se escribe @22 ni se usa npx en el recorrido principal. Si el CLI ya está instalado, ng version permite comprobarlo antes de decidir actualizar. Usa un Node compatible con engines del paquete consultado. No uses --force para ignorar incompatibilidades.

Este workspace se verificó con Angular y CLI 22.2.4, Node 24.20.0 y npm 11.19.1. La consulta del 23 de octubre de 2026 reportó engines.node ^22.22.3 || ^24.15.0 || >=26.0.0, cumplido por Node 24.20.0. Son datos de la copia existente, no una orden para fijar la versión de una instalación nueva. Si latest cambia de versión mayor, vuelve a revisar compatibilidad con PrimeNG y los flags antes de usar el material sin ajustes.

ng version debe mostrar Angular CLI. En algunos Ubuntu existe otro programa llamado ng: comprueba command -v ng si abre un editor o falla antes de mostrar el CLI. No cambies archivos de /usr/bin; revisa el PATH y la instalación npm.

Para inspeccionar este proyecto ya construido, sin instalar un CLI global:

```bash
cd ~/ia-lab/projects/dw/pry-jquintero/front-storelab-express-ii
npm ci
npm run ng -- version
```

npm ci restaura las dependencias de package-lock.json; es la opción para reproducir esta copia. npm install se usa al incorporar o actualizar paquetes. npm run ng -- ... utiliza siempre el CLI local del proyecto. Un CLI global Angular válido también delega al local cuando ejecutas ng dentro del workspace.

PARCHE — antes de ISS-01: todavía no existe package.json, así que npm run ng no aplica en este ISS. La comprobación del CLI local se hace en ISS-01, después de ng new. Aquí basta con el CLI global de ng version.

## 0.2 Backend en marcha (preparación para integrar HTTP)

### Criterios de este sub-ítem

- [ ] npm run db:seed del backend termina sin error
- [ ] npm run dev deja el puerto 4000 escuchando
- [ ] El log muestra conexión a la BD y sync exitoso
- [ ] curl -i http://localhost:4000/api/clientes responde 401 (protegido) o 200 (Fase I)

El esqueleto y /construir funcionan solos. Para operaciones de negocio el frontend consume la API en http://localhost:4000/api. Levanta el backend correcto:

```bash
cd ~/ia-lab/projects/dw/pry-jquintero/app-storelab-express-ii
npm ci
npm run db:seed
npm run dev
```

Debe aparecer:

```text
🔗 Intentando conectar a: MYSQL
📦 Base de datos sincronizada exitosamente
🚀 Servidor ejecutándose en puerto 4000
```

Si falla la conexión, revisa .env (DB_ENGINE, MYSQL_* o POSTGRES_*) y que el motor esté escuchando. El backend no arranca sin base de datos.

No ejecutes db:seed sobre una base con datos que deban conservarse. El seeder reconcilia catálogos y omite las entidades que ya tienen registros, pero es una operación sobre la base real del laboratorio.

### Las tres modalidades del backend

| Modalidad | Qué exige | Ejemplos |
|---|---|---|
| OPEN | nada | POST /api/sesion/login, /refresh, /logout, /api/docs |
| JWT | access token válido | GET /api/sesion/perfil, GET /api/permisos, /api/sesiones/* |
| JWT + RBAC | token + concesión (method, path) | todo el CRUD de negocio y de administración |

Importante para la Fase I. En el backend final (app-storelab-express-ii) las rutas de negocio ya llevan authenticate + authorize. Por eso el frontend de la Fase I (Business, ISS-03…07) se construye de una de estas tres formas: contra la versión del backend antes de su ISS-13 (rutas sin middlewares), contra un stub con el mismo contrato, o contra el backend consolidado con AUTH_ENABLED=false (deja OPEN solo las 5 rutas de negocio). Al comenzar la Fase II (ISS-08) hay que emparejar los dos interruptores: requireAuth = true en el frontend y AUTH_ENABLED=true en el .env del backend.

### Comprobación de la matriz de permisos

```bash
curl -i http://localhost:4000/api/clientes
```

401 Unauthorized → el backend está protegido (estado final y de entrega). Correcto.

200 con { "clients": [...] } → el backend está en modo laboratorio (AUTH_ENABLED=false) o en una copia anterior a su ISS-13.

ECONNREFUSED → el backend no está escuchando en el puerto 4000.

## 0.3 Login y permisos

### Criterios de este sub-ítem

- [ ] El login (OPEN) devuelve access_token, refresh_token, expires_in y refresh_expires_in
- [ ] GET /api/sesion/perfil (JWT) devuelve { user }
- [ ] GET /api/permisos (JWT) devuelve una fila por permiso efectivo
- [ ] admin obtiene 58 permisos

El login del backend devuelve solo el par de tokens. El perfil y los permisos se piden aparte:

```bash
# 1. Login (OPEN)
curl -s -X POST http://localhost:4000/api/sesion/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"Admin123!"}'
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_token": "9f2c...",
  "refresh_expires_in": 604800
}
# 2. Perfil (JWT)
curl -s http://localhost:4000/api/sesion/perfil \
  -H "Authorization: Bearer $TOKEN"

# 3. Permisos efectivos (JWT)
curl -s http://localhost:4000/api/permisos \
  -H "Authorization: Bearer $TOKEN"
```

GET /api/permisos devuelve una fila por permiso efectivo:

```json
{
  "permissions": [
    {
      "resource_id": 1,
      "method": "GET",
      "path": "/api/clientes",
      "description": "Listar clientes",
      "role_id": 1,
      "role_name": "ADMIN"
    }
  ]
}
```

Esa forma es la que consumirá SessionStore en ISS-08. El frontend no recibe user, roles ni resources en el login.

## 0.4 Credenciales del seeder

### Criterios de este sub-ítem

- [ ] admin / Admin123! inicia sesión y recibe 58 permisos
- [ ] seller / Seller123! inicia sesión y recibe 7 permisos
- [ ] Un usuario sin rol se autentica pero recibe 403 en recursos RBAC

| Usuario | Password | Rol | Permisos |
|---|---|---|---|
| admin | Admin123! | ADMIN | 58 recursos |
| seller | Seller123! | SELLER | 7 recursos |

El seeder de backend crea además usuarios aleatorios sin rol: sirven para comprobar que estar autenticado no basta (recibirán 403).

Los permisos no están hardcodeados en el frontend: salen de /api/permisos, que ejecuta la misma consulta que el middleware authorize (role_users → roles → resource_roles → resources, todos los eslabones activos).

## 0.5 Navegador y herramientas

### Criterios de este sub-ítem

- [ ] DevTools (F12) con Console y Network disponibles
- [ ] Las peticiones permiten comprobar Authorization: Bearer ...
- [ ] No hay bloqueadores que intercepten localhost

Abre DevTools (F12) → Console y Network. En cada ISS comprobarás que las peticiones llevan Authorization: Bearer ....

Instala Angular DevTools (opcional) para inspeccionar componentes y signals.

Desactiva bloqueadores que intercepten localhost si el login falla sin motivo.

## 0.6 Estructura de trabajo

### Criterios de este sub-ítem

- [ ] La carpeta del frontend existe
- [ ] No contiene src/ ni package.json antes de ISS-01
- [ ] Solo contiene docs/ y archivos de configuración del repositorio

El proyecto se crea dentro de la carpeta existente:

```text
~/ia-lab/projects/dw/pry-jquintero/front-storelab-express-ii
```

No se debe crear una subcarpeta adicional. En ISS-01 se explica el comando exacto (ng new front-storelab-express-ii --directory .) y por qué ng new . falla en Angular CLI 22.Workspace. Todas las ISS usan este proyecto: carpeta front-storelab-express-ii en ~/ia-lab/projects/dw/pry-jquintero/front-storelab-express-ii. Antes de cada bloque de comandos, haz cd a esa ruta (la misma que aparece arriba).

## Verificación del ISS

```bash
# 1. Versiones
node -v && npm -v && ng version

# 2. Backend vivo (401 = protegido, 200 = Fase I)
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:4000/api/clientes

# 3. Login + permisos de admin
TOKEN=$(curl -s -X POST http://localhost:4000/api/sesion/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"Admin123!"}' \
  | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

curl -s http://localhost:4000/api/permisos \
  -H "Authorization: Bearer $TOKEN" | head -c 300

# 4. Permisos de seller
STOKEN=$(curl -s -X POST http://localhost:4000/api/sesion/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"seller","password":"Seller123!"}' \
  | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

curl -s http://localhost:4000/api/permisos \
  -H "Authorization: Bearer $STOKEN" | head -c 300
```

## Resultado reportado por la fuente (23-oct-2026)

| Comprobación | Resultado |
|---|---|
| node -v | 24.20.0 — cumple ^24.15.0 |
| npm -v | 11.19.1 — cumple >=8.0.0 |
| ng version | Angular CLI 22.2.4 |
| curl -i /api/clientes | 401 — backend final protegido |
| Login admin | access_token + refresh_token (token de 299 caracteres) |
| /api/permisos como admin | 58 permisos |
| Login seller | access_token (token de 300 caracteres) |
| /api/permisos como seller | 7 permisos |
| src/ y package.json | ausentes — listo para ISS-01 |

Si el paso 3 imprime "permissions", la integración HTTP está preparada. El recorrido visual de ISS-01 y la construcción del Shell dentro de ISS-02 no dependen de esta comprobación.

## Cierre del ISS

Entorno listo. No hay código que compilar todavía: el primer archivo de Angular se crea en ISS-01. Mantén el backend en ejecución en una terminal aparte para las ISS que consumen HTTP (ISS-02 en adelante); ISS-01 y la construcción visual inicial de ISS-02 no lo necesitan.

## Correspondencia con el código

Este ISS no produce archivos de src/. Las comprobaciones se hacen con los comandos anteriores y con el backend de referencia. El primer archivo consolidado es package.json, que se crea en ISS-01; hasta entonces no existen enlaces a src/.

Navegación de la ruta: ← ↑ Ruta Frontend-Express · ↑ Ruta Frontend-Express · → ISS-01 · 🛠 Construir
