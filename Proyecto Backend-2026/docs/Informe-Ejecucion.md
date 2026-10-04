# Informe de ejecución — Pedalibre

## Introducción

Este informe registra la ejecución individual del manual de ingeniería de sistemas para el proyecto **Pedalibre**. El trabajo comienza con **ISS-00 — Requisitos previos**. Se avanzará siguiendo el manual y registrando en orden qué se hizo, qué resultado se obtuvo y qué evidencia lo demuestra.

El manual de referencia es `Guia-unificada.md`, sección ISS-00 — Requisitos previos. El proyecto de referencia que aparece en el manual se llama `app-storelab-express-ii`; en este trabajo se aplica el procedimiento a Pedalibre. El contexto del proyecto contempla MySQL, PostgreSQL, Oracle y Microsoft SQL Server (MSSQL). Para el primer `sync`, el manual recomienda MySQL; por eso ISS-00 comprobará MySQL, sin afirmar que los otros motores están verificados.

## Forma de completar el informe

Una sola persona ejecuta el procedimiento y completa este informe de forma progresiva. Al inicio solo se documenta la introducción y el paso que se va a realizar. Después de ejecutar el paso, se incorporan su resultado real, fecha y captura; únicamente entonces se añade el siguiente paso. Así, las secciones futuras no aparecen como trabajo ya realizado ni se rellenan con resultados supuestos.

Para cada paso: consultar el manual, ejecutar la instrucción en orden, verificar el resultado, guardar una captura legible en [`trazabilidad/`](trazabilidad/) y completar su registro aquí antes de continuar. Usar nombres secuenciales como `E-ISS00-P01-01-version-node.png`. No mostrar credenciales, tokens, contraseñas ni datos personales.

Toda diferencia respecto al manual se registra cuando ocurre, indicando la instrucción de referencia, la adaptación, la justificación contextual o técnica y cómo se verificó. Si puede afectar un requisito obligatorio, no se avanza hasta resolverla o marcar el criterio como pendiente/bloqueado.

Al completar un ISS, se revisa su GATE. Los commits se realizan en hitos estables y se registran aquí cuando se creen.

## ISS-00 — Requisitos previos

**Objetivo del manual:** dejar listo el entorno para el laboratorio.  
**Dependencias:** ninguna.  
**Referencia:** `Guia-unificada.md`, sección ISS-00 — Requisitos previos.  
**Contexto:** Pedalibre contempla MySQL, PostgreSQL, Oracle y Microsoft SQL Server (MSSQL). Para el primer `sync`, el manual recomienda MySQL; se comprobará ese motor en ISS-00.

### Paso 1 — Comprobar Node.js *(completado)*

**Referencia:** ISS-00, “Pasos”; criterio de versión de Node.js.  
**Acción:** en una terminal del entorno donde se trabajará en Pedalibre, ejecutar:

```text
node -v
```

**Captura:** mostrar el comando y su salida completa y legible. La terminal debe permitir reconocer que la consulta se hizo en el entorno de trabajo; no incluir información sensible.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Hora:** no visible en la captura.
- **Resultado observado:** `node -v` respondió `v24.21.0`.
- **Criterio del manual:** Node.js v20 o superior (v24.x en el laboratorio).
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS00-P01-01-version-node.png`](trazabilidad/E-ISS00-P01-01-version-node.png).

![Captura de la ejecución de node -v con resultado v24.21.0](trazabilidad/E-ISS00-P01-01-version-node.png)

**Criterio de Node.js en ISS-00:** cumplido.

**Conclusión:** Comprobé la versión de Node.js y confirmé que `v24.21.0` cumple el requisito del manual.

### Paso 2 — Comprobar npm *(completado)*

**Referencia:** ISS-00, “Pasos”; criterio de que `npm -v` responda.  
**Acción:** en la misma terminal del entorno de trabajo, ejecutar:

```text
npm -v
```

**Captura:** mostrar el comando y la versión que devuelve npm, con texto legible.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `npm -v` respondió `12.1.0`.
- **Criterio del manual:** `npm -v` responde.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS00-P02-01-version-npm.png`](trazabilidad/E-ISS00-P02-01-version-npm.png).

![Captura de la ejecución de npm -v con resultado 12.1.0](trazabilidad/E-ISS00-P02-01-version-npm.png)

**Conclusión:** Comprobé que npm responde y registré la versión `12.1.0`.

### Paso 3 — Comprobar acceso a MySQL *(completado)*

**Referencia:** ISS-00, criterio de motor de base de datos accesible.  
**Acción:** comprobar que el servicio MySQL que se usará con Pedalibre está accesible. No mostrar contraseñas ni datos de conexión secretos.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `mysql -h 127.0.0.1 -u root -p -e "SELECT 1;"` se ejecutó correctamente y devolvió `1`.
- **Criterio del manual:** un motor de base de datos es accesible; MySQL es el recomendado para el primer `sync`.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS00-P03-01-acceso-mysql.png`](trazabilidad/E-ISS00-P03-01-acceso-mysql.png).

![Captura de conexión MySQL con consulta SELECT 1 exitosa](trazabilidad/E-ISS00-P03-01-acceso-mysql.png)

**Conclusión:** Verifiqué que pude conectarme a MySQL y que la consulta `SELECT 1` devolvió `1`.

### Paso 4 — Verificación conjunta de Node.js y npm *(completado)*

**Referencia:** ISS-00, “Verificación del ISS”.  
**Acción:** ejecutar en la misma terminal:

```bash
node -v && npm -v
```

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `node -v` respondió `v24.21.0` y `npm -v` respondió `12.1.0`.
- **Criterio del manual:** verificar las versiones de Node.js y npm.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS00-P04-01-verificacion-node-npm.png`](trazabilidad/E-ISS00-P04-01-verificacion-node-npm.png).

![Captura de la verificación conjunta de Node.js y npm](trazabilidad/E-ISS00-P04-01-verificacion-node-npm.png)

**Conclusión:** Verifiqué en una sola ejecución que Node.js está en la versión `v24.21.0` y npm en la versión `12.1.0`; ambas respuestas coinciden con los resultados registrados en los pasos anteriores.

## Cierre de ISS-00

Completé los criterios de aceptación indicados por el manual: confirmé Node.js v20 o superior, verifiqué que npm responde y comprobé que MySQL es accesible mediante `SELECT 1`. La verificación conjunta de Node.js y npm también terminó correctamente.

**Resultado del GATE de ISS-00:** cumplido.  
**Desviaciones respecto al manual:** ninguna.  
**Evidencias:** `E-ISS00-P01-01` a `E-ISS00-P04-01`, guardadas en [`trazabilidad/`](trazabilidad/).

## ISS-01 — Esqueleto del proyecto

**Objetivo del manual:** preparar el proyecto npm con TypeScript, Express, estructura por features y servidor HTTP base.  
**Dependencia:** ISS-00, completado.  
**Referencia:** `Guia-unificada.md`, ISS-01, subítem 2.1 — Inicializar npm y scripts.

**Adaptación de ubicación:** el manual muestra crear una carpeta de ejemplo `app-storelab-express`. Como el espacio de trabajo para Pedalibre ya fue definido como `Proyecto Backend-2026`, la inicialización se realizará directamente ahí, sin crear una carpeta anidada con el nombre de ejemplo. Se conserva el objetivo del paso: inicializar npm en la raíz de trabajo.

### Paso 1 — Inicializar npm *(completado)*

**Acción:** abrir una terminal y ejecutar:

```bash
cd "/home/oscar_vega/ia-lab/projecs/desarrollo web/Pedalibre-Desarrollo Web/dw-2026-Futbol-Total/Proyecto Backend-2026"
npm init -y
```

**Captura:** mostrar que la terminal está en `Proyecto Backend-2026` y el resultado de `npm init -y`.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `npm init -y` creó `package.json` con el nombre `proyecto-backend-2026` y `"type": "commonjs"`.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS01-P01-01-inicializar-npm.png`](trazabilidad/E-ISS01-P01-01-inicializar-npm.png).

![Captura de npm init -y en Proyecto Backend-2026](trazabilidad/E-ISS01-P01-01-inicializar-npm.png)

**Conclusión:** Inicialicé npm dentro de `Proyecto Backend-2026` y confirmé que se creó `package.json`.

**Adaptación:** inicialicé el proyecto en la carpeta existente `Proyecto Backend-2026` en lugar de crear `app-storelab-express` como muestra el manual. La carpeta `docs/` ya existía, por lo que no fue necesario crearla de nuevo.

### Paso 2 — Configurar scripts y tipo de módulo *(completado)*

**Referencia:** ISS-01, subítem 2.1 — Inicializar npm y scripts.  
**Acción:** desde `Proyecto Backend-2026`, ejecutar:

```bash
npm pkg set "scripts.build=tsc" "scripts.dev=nodemon --watch src --ext ts --exec ts-node -- src/server.ts" "type=commonjs"
node -e "const p=require('./package.json'); console.log(JSON.stringify({scripts:p.scripts,type:p.type},null,2))"
```

**Captura:** mostrar los comandos y confirmar que `build`, `dev` y `type: commonjs` aparecen en la salida.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `package.json` contiene los scripts `build: tsc` y `dev: nodemon --watch src --ext ts --exec ts-node -- src/server.ts`, además de `"type": "commonjs"`.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS01-P02-01-scripts-package.png`](trazabilidad/E-ISS01-P02-01-scripts-package.png).

![Captura de la configuración y verificación de scripts y tipo de módulo](trazabilidad/E-ISS01-P02-01-scripts-package.png)

**Conclusión:** Configuré y verifiqué los scripts `build` y `dev` y confirmé que el proyecto usa módulos CommonJS.

### Paso 3 — Crear la estructura de carpetas *(completado)*

**Referencia:** ISS-01, subítem 2.2 — Estructura de carpetas (features).  
**Acción:** desde `Proyecto Backend-2026`, ejecutar:

```bash
mkdir -p src/config src/database/seeders src/routes src/shared/errors src/shared/http src/shared/database src/features/business/clients
find src -type d | sort
```

**Captura:** mostrar el comando y el árbol de directorios creado.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** se crearon las carpetas `config`, `database/seeders`, `routes`, `shared` y `features/business/clients`, incluidas las subcarpetas solicitadas.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS01-P03-01-estructura-carpetas.png`](trazabilidad/E-ISS01-P03-01-estructura-carpetas.png).

![Captura del árbol de directorios creado para ISS-01](trazabilidad/E-ISS01-P03-01-estructura-carpetas.png)

**Conclusión:** Creé y verifiqué la estructura base de `src/` requerida por el manual.

### Paso 4 — Instalar dependencias base *(completado; auditoría pendiente)*

**Referencia:** ISS-01, subítem 2.3 — Dependencias base (Express + TypeScript).  
**Acción:** desde `Proyecto Backend-2026`, ejecutar:

```bash
npm install express@^5.2.1 cors@^2.8.6 dotenv@^17.4.2 morgan@^1.12.1
npm install -D typescript@~5.9.2 ts-node@^10.9.2 nodemon@^3.1.14 @types/node@^22.20.3 @types/express@^5.0.6 @types/cors@^2.8.19 @types/morgan@^1.9.10
npm ls --depth=0
```

**Captura:** mostrar la instalación y la salida de `npm ls --depth=0`.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** se instalaron las dependencias y `npm ls --depth=0` mostró el árbol esperado. npm informó 3 vulnerabilidades de severidad alta.
- **Estado del criterio de dependencias:** Cumple.
- **Estado de revisión de vulnerabilidades:** Pendiente; no ignorar ni remediar automáticamente.
- **Evidencia:** [`E-ISS01-P04-01-dependencias-base.png`](trazabilidad/E-ISS01-P04-01-dependencias-base.png).

![Captura de instalación y árbol de dependencias; npm reporta tres vulnerabilidades altas](trazabilidad/E-ISS01-P04-01-dependencias-base.png)

**Conclusión:** Instalé y comprobé las dependencias base. También registré que npm reporta tres vulnerabilidades altas, cuya causa y alcance aún debo revisar.

### Paso 5 — Revisar vulnerabilidades de dependencias *(registrado)*

**Acción:** ejecuté `npm audit` para identificar las vulnerabilidades reportadas durante la instalación.

**Resultado observado:** npm reportó **17 vulnerabilidades: 7 altas y 10 moderadas**. La salida identifica, entre otras, alertas altas en `braces` (consumo no controlado de recursos) y `cross-spawn` (ReDoS), y alertas moderadas relacionadas con `decode-uri-component`, `got` y `undici`. La salida indica que existen correcciones disponibles con `npm audit fix`; no se aplicó ninguna corrección en esta revisión.

**Evidencia:** [`E-ISS01-P05-01-npm-audit.png`](trazabilidad/E-ISS01-P05-01-npm-audit.png).

![Captura de npm audit con el detalle y resumen de vulnerabilidades](trazabilidad/E-ISS01-P05-01-npm-audit.png)

**Conclusión:** Revisé el informe de npm y confirmé que hay vulnerabilidades transitivas en el árbol de dependencias. No ejecuté una corrección automática; dejo registrado el hallazgo para decidir su tratamiento sin introducir cambios no verificados.

### Paso 6 — Configurar TypeScript *(archivo creado; verificación pendiente)*

**Referencia:** ISS-01, subítem 2.4 — TypeScript (`tsconfig.json`).  
**Acción:** desde `Proyecto Backend-2026`, ejecutar:

```bash
cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "commonjs",
    "target": "ES2020",
    "lib": ["ES2020"],
    "types": ["node"],
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "sourceMap": true,
    "strict": true,
    "skipLibCheck": true,
    "moduleDetection": "force",
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
test -f tsconfig.json && npx tsc --showConfig | head -20
```

**Captura:** mostrar la creación de `tsconfig.json` y las opciones principales reportadas, especialmente `rootDir`, `outDir` y `strict`.

**Registro de ejecución — completar después de realizar el paso:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `tsconfig.json` existe con las opciones requeridas. La primera comprobación devolvió `TS18003` porque todavía no había archivos TypeScript en `src/`. Después de crear `src/server.ts`, `npx tsc --showConfig` mostró la configuración efectiva, incluyendo `rootDir`, `outDir` y `strict`, sin ese error.
- **Estado:** Cumple; configuración reconocida por TypeScript después de crear el primer archivo fuente.
- **Evidencia:** configuración inicial en [`E-ISS01-P06-01-tsconfig.png`](trazabilidad/E-ISS01-P06-01-tsconfig.png); verificación posterior al añadir los archivos fuente en [`E-ISS01-P09-01-typescript.png`](trazabilidad/E-ISS01-P09-01-typescript.png).

![Captura de tsconfig.json y TS18003 por no existir aún archivos fuente en src](trazabilidad/E-ISS01-P06-01-tsconfig.png)

**Conclusión:** Creé `tsconfig.json` con `rootDir`, `outDir` y `strict` según el manual. Tras crear los archivos fuente, comprobaré que TypeScript los compile.

### Paso 7 — Crear `src/server.ts` *(completado)*

**Referencia:** ISS-01, subítem 2.5.1 — Servidor y App (esqueleto HTTP).  
**Acción:** desde `Proyecto Backend-2026`, ejecutar:

```bash
cat > src/server.ts <<'EOF'
import { App } from './config/index';

async function main() {
    const app = new App();
    await app.listen();
}

main();
EOF
```

**Captura:** mostrar el explorador del proyecto con `server.ts` dentro de `src/` y la verificación de configuración TypeScript que se ejecutó después de crearlo.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** existe `src/server.ts` con la importación de `App`, la función `main` y la llamada a `app.listen()` indicadas por el manual.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS01-P07-01-server-ts.png`](trazabilidad/E-ISS01-P07-01-server-ts.png).

![Captura del explorador con src/server.ts y la configuración efectiva de TypeScript](trazabilidad/E-ISS01-P07-01-server-ts.png)

**Conclusión:** Creé `src/server.ts` con la importación de `App` y el arranque de `app.listen()`.

### Paso 8 — Crear el esqueleto de `src/config/index.ts` *(completado)*

**Referencia:** ISS-01, subítem 2.5.2 — `src/config/index.ts` (esqueleto).  
**Acción:** desde `Proyecto Backend-2026`, crear `src/config/index.ts` con:

```bash
cat > src/config/index.ts <<'EOF'
import dotenv from "dotenv";
import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";

dotenv.config();

export class App {
  public app: Application;

  constructor(private port?: number | string) {
    this.app = express();
    this.settings();
    this.middlewares();
    this.routes();
  }

  private settings(): void {
    this.app.set("port", this.port || process.env.PORT || 4000);
  }

  private middlewares(): void {
    this.app.use(morgan("dev"));
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  private routes(): void {}

  private async dbConnection(): Promise<void> {}

  async listen(): Promise<void> {
    await this.dbConnection();
    await this.app.listen(this.app.get("port"));
    console.log(`Servidor ejecutándose en puerto ${this.app.get("port")}`);
  }
}
EOF
```

Este esqueleto incluye los métodos exigidos para ISS-01. La conexión real a la base de datos y el registro de rutas quedan como placeholders para los ISS siguientes.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `src/config/index.ts` contiene la clase `App` y los métodos `settings`, `middlewares`, `routes`, `dbConnection` y `listen`. La conexión y las rutas permanecen como placeholders.
- **Estado:** Cumple el esqueleto de ISS-01.
- **Evidencia:** [`E-ISS01-P08-01-app-esqueleto.png`](trazabilidad/E-ISS01-P08-01-app-esqueleto.png).

**Conclusión:** Creé la clase `App` y dejé como placeholders las rutas y la conexión real a la base de datos, tal como corresponde al esqueleto inicial.

### Paso 9 — Verificar TypeScript y la estructura *(completado)*

**Referencia:** Verificación del ISS-01.  
**Acción:** ejecutar dentro de `Proyecto Backend-2026`:

```bash
npx tsc --noEmit
find src -type f | sort
```

**Captura:** mostrar que TypeScript termina sin errores y el listado de archivos fuente.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `npx tsc --noEmit` terminó sin errores y `find src -type f | sort` listó `src/config/index.ts` y `src/server.ts`.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS01-P09-01-verificacion-typescript.png`](trazabilidad/E-ISS01-P09-01-verificacion-typescript.png).

![Captura de la compilación TypeScript sin errores y el listado de archivos fuente](trazabilidad/E-ISS01-P09-01-verificacion-typescript.png)

**Conclusión:** Verifiqué que TypeScript compila sin errores y que los dos archivos fuente están en las rutas esperadas.

### Paso 10 — Probar el arranque del servidor *(completado)*

**Referencia:** ISS-01, “Cierre del ISS”.  
**Acción:** ejecutar desde `Proyecto Backend-2026`:

```bash
npm run dev
```

Confirmar que el servidor arranca sin errores y detenerlo con `Ctrl+C`.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `npm run dev` inició nodemon/ts-node y mostró `Servidor ejecutándose en puerto 4000`.
- **Estado:** Cumple. Después de la captura detuve el servidor con `Ctrl+C`, según indica el manual.
- **Evidencia:** [`E-ISS01-P10-01-arranque-servidor.png`](trazabilidad/E-ISS01-P10-01-arranque-servidor.png).

![Captura de npm run dev con el servidor ejecutándose en el puerto 4000](trazabilidad/E-ISS01-P10-01-arranque-servidor.png)

**Conclusión:** Inicié el servidor con `npm run dev`, confirmé que se ejecutó en el puerto 4000 y luego lo detuve con `Ctrl+C`.

**Commit del hito ISS-01:** `74e35364b03b0eb8c7804166433bc15e3953bf4d` — `feat(pedalibre): completar ISS-01 esqueleto` (creado y enviado por el responsable).

## ISS-02 — Infraestructura de base de datos

**Objetivo del manual:** instalar los drivers, configurar `.env`, crear el módulo Sequelize y reservar `seeders/` para un ISS posterior.  
**Dependencia:** ISS-01, completado y enviado a `origin/main`.  
**Referencia:** `Guia-unificada.md`, ISS-02, subítem 3.1 — Drivers Sequelize y `.env`.

### Paso 1 — Instalar Sequelize y drivers *(paquetes instalados; advertencias pendientes de revisar)*

**Acción:** desde `Proyecto Backend-2026`, ejecutar:

```bash
npm install sequelize@^6.37.8 mysql2@^3.24.4 pg@^8.23.0 pg-hstore@^2.3.4 tedious@^20.0.0 oracledb@^7.0.1
npm install -D @types/sequelize@^6.12.0
npm ls sequelize mysql2 pg pg-hstore tedious oracledb @types/sequelize --depth=0
```

**Captura:** mostrar la instalación y el listado de paquetes instalados.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `npm ls` muestra Sequelize `6.37.8`, `mysql2` `3.24.4`, `pg` `8.23.1`, `pg-hstore` `2.3.4`, `tedious` `20.0.3`, `oracledb` `7.0.1` y `@types/sequelize` `6.12.0`.
- **Advertencias:** npm bloqueó los scripts de instalación de `tedious` y `oracledb`, que requieren revisión/aprobación explícita. npm también informó 19 vulnerabilidades (12 moderadas y 7 altas).
- **Estado:** Los paquetes están instalados; queda pendiente revisar los scripts bloqueados y el informe de auditoría antes de afirmar que los drivers están listos para conectarse.
- **Evidencia:** [`E-ISS02-P01-01-drivers.png`](trazabilidad/E-ISS02-P01-01-drivers.png).

![Captura del listado de drivers instalados y las advertencias de npm](trazabilidad/E-ISS02-P01-01-drivers.png)

**Conclusión:** Instalé y confirmé la presencia de los drivers requeridos. También registré los scripts bloqueados de `tedious` y `oracledb` y las vulnerabilidades reportadas; no ejecuté aprobaciones ni reparaciones automáticas.

### Paso 2 — Crear la configuración local `.env` *(configurado; evidencia pendiente)*

**Referencia:** ISS-02, subítem 3.1 — Drivers Sequelize y `.env`.  
**Acción:** crear `.env` con los valores de entorno proporcionados para Pedalibre y bloques separados para MySQL, PostgreSQL, MSSQL y Oracle.

**Adaptación respecto al manual:** el ejemplo del ISS usa `DB_ENGINE` y nombres genéricos por motor. Para Pedalibre se usa `DB_DIALECT` y variables namespaced (`DB_MYSQL_*`, `DB_POSTGRES_*`, `DB_MSSQL_*`, `DB_ORACLE_*`), de acuerdo con la configuración proporcionada para seleccionar y validar el dialecto activo.

**Protección:** `.env` está excluido por `.gitignore`; mantenerlo local y no agregarlo al commit. Cualquier captura debe mostrar solo los nombres de variables y el dialecto activo, nunca sus valores de credenciales.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `.env` local creado con `PORT=3002`, `NODE_ENV=development`, `DB_DIALECT=mysql` y bloques de configuración para los cuatro motores.
- **Estado:** Configuración creada; `.env` permanece local e ignorado por Git. La lectura de las variables se verificará al probar el módulo de base de datos.
- **Evidencia:** sin captura para proteger los valores secretos; se confirmó con `git check-ignore` que `.env` está ignorado.

**Nota de seguridad:** las credenciales compartidas en la conversación quedaron expuestas. Cambiarlas por credenciales fuertes y únicas en los servidores y actualizar el `.env` local antes de usar el entorno fuera de pruebas.

### Paso 3 — Crear `src/database/db.ts` *(archivo creado y compilado)*

**Referencia:** ISS-02, subítem 3.2 — Configuración Sequelize.  
**Adaptación:** usar `DB_DIALECT` y los bloques `DB_<MOTOR>_*` definidos para Pedalibre, y validar únicamente las variables del motor seleccionado. El Sequelize 6 instalado incluye dialectos para MySQL, PostgreSQL, MSSQL y Oracle; Oracle utilizará `DB_ORACLE_CONNECT_STRING`.

**Acción:** crear `src/database/db.ts` exportando `sequelize`, `getDatabaseInfo` y `testConnection`. El código debe fallar explícitamente si falta `DB_DIALECT`, si un valor de configuración requerido del dialecto activo está ausente o si se selecciona un motor no soportado. `getDatabaseInfo` no debe devolver contraseñas.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `src/database/db.ts` exporta `sequelize`, `getDatabaseInfo` y `testConnection`; requiere `DB_DIALECT` y las variables del motor seleccionado, y `getDatabaseInfo` no incluye la contraseña. `npx tsc --noEmit` terminó sin errores.
- **Estado:** Cumple el criterio de creación y compilación del módulo.
- **Evidencia:** [`E-ISS02-P03-01-db-ts-typescript.png`](trazabilidad/E-ISS02-P03-01-db-ts-typescript.png).

![Captura del módulo Sequelize db.ts y de la compilación TypeScript sin errores](trazabilidad/E-ISS02-P03-01-db-ts-typescript.png)

**Conclusión:** Implementé el módulo de Sequelize para los dialectos configurados, oculté la contraseña en la información de diagnóstico y comprobé que el archivo compila.

**Pendiente:** probar que la configuración activa de `.env` se carga correctamente y comprobar la conexión al MySQL configurado para Pedalibre.

### Paso 4 — Validar la configuración MySQL seleccionada *(completado)*

**Acción:** cargar el módulo y confirmar el dialecto activo sin mostrar datos de conexión ni credenciales.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** el módulo cargó 24 variables de `.env` y `getDatabaseInfo().engine` devolvió `mysql`, sin mostrar credenciales.
- **Estado:** Cumple la validación de configuración del motor seleccionado.
- **Evidencia:** [`E-ISS02-P04-01-config-mysql-validada.png`](trazabilidad/E-ISS02-P04-01-config-mysql-validada.png).

![Captura de la configuración cargada con MySQL seleccionado, sin exponer secretos](trazabilidad/E-ISS02-P04-01-config-mysql-validada.png)

**Conclusión:** Comprobé que el módulo leyó la configuración local y seleccionó MySQL sin imprimir credenciales.

### Paso 5 — Probar conexión al MySQL de Pedalibre *(completado)*

**Acción:** desde `Proyecto Backend-2026`, ejecutar:

```bash
npx ts-node -e 'import { sequelize } from "./src/database/db"; sequelize.authenticate().then(async () => { console.log("Conexión MySQL exitosa"); await sequelize.close(); }).catch(async () => { console.error("No fue posible conectar con MySQL"); await sequelize.close(); process.exitCode = 1; });'
```

**Captura:** mostrar solo el resultado de conexión. Revisar que no aparezcan credenciales antes de guardarla.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** Sequelize autenticó contra MySQL y ejecutó `SELECT 1+1 AS result`; la terminal mostró `Conexión MySQL exitosa`.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS02-P05-01-conexion-mysql.png`](trazabilidad/E-ISS02-P05-01-conexion-mysql.png).

![Captura de autenticación exitosa contra MySQL](trazabilidad/E-ISS02-P05-01-conexion-mysql.png)

**Conclusión:** Comprobé que Pedalibre puede conectarse al servidor MySQL configurado y que Sequelize ejecuta una consulta de prueba.

### Paso 6 — Confirmar carpeta `seeders/` reservada *(completado)*

**Referencia:** ISS-02, subítem 3.3 — Carpeta seeders (reservada).  
**Acción:** comprobar que existe la carpeta y que todavía no contiene seeders ni runner:

```bash
test -d src/database/seeders && find src/database/seeders -maxdepth 1 -type f -print
```

La carpeta debe existir y el comando no debe listar archivos. No crear lógica de seeders en ISS-02.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** la carpeta `src/database/seeders/` existe; `find` no listó archivos en ella.
- **Estado:** Cumple; reservada y sin lógica de seeders.
- **Evidencia:** [`E-ISS02-P06-01-seeders-reservada.png`](trazabilidad/E-ISS02-P06-01-seeders-reservada.png).

![Captura de la carpeta seeders vacía y la comprobación ejecutada](trazabilidad/E-ISS02-P06-01-seeders-reservada.png)

**Conclusión:** Confirmé que `seeders/` está creada y permanece vacía, tal como requiere ISS-02.

### Paso 7 — Verificar ISS-02 *(completado)*

**Acción:** desde `Proyecto Backend-2026`, ejecutar:

```bash
npx tsc --noEmit
test -f src/database/db.ts && test -f .env && test -d src/database/seeders && echo "Verificación ISS-02 correcta"
```

**Captura:** mostrar que TypeScript no reporta errores y aparece `Verificación ISS-02 correcta`. No mostrar el contenido de `.env`.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `npx tsc --noEmit` terminó sin errores; existen `src/database/db.ts`, `.env` y `src/database/seeders/`. La terminal imprimió `Verificación ISS-02 correcta`.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS02-P07-01-verificacion.png`](trazabilidad/E-ISS02-P07-01-verificacion.png).

![Captura de la compilación y verificación de archivos de ISS-02](trazabilidad/E-ISS02-P07-01-verificacion.png)

**Conclusión:** Verifiqué que el módulo compila, que existen los archivos requeridos y que `seeders/` está creada.

### Paso 8 — Arrancar el servidor para cerrar ISS-02 *(completado)*

**Acción:** ejecutar desde `Proyecto Backend-2026`:

```bash
npm run dev
```

Confirmar que inicia sin errores y que usa el puerto `3002` indicado por `.env`; luego detenerlo con `Ctrl+C`. Si falla, guardar la salida sin secretos y registrar el error antes de corregir.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `npm run dev` inició nodemon/ts-node y mostró `Servidor ejecutándose en puerto 3002`.
- **Estado:** Cumple. Después de tomar la captura, detuve el servidor con `Ctrl+C`.
- **Evidencia:** [`E-ISS02-P08-01-arranque-servidor.png`](trazabilidad/E-ISS02-P08-01-arranque-servidor.png).

![Captura del servidor Pedalibre ejecutándose en el puerto 3002](trazabilidad/E-ISS02-P08-01-arranque-servidor.png)

**Conclusión:** Inicié el servidor, confirmé que tomó el puerto 3002 de la configuración y lo detuve con `Ctrl+C`.

### Cierre y GATE de ISS-02

Completé la instalación de drivers, la configuración local de `.env`, el módulo Sequelize y la comprobación de la carpeta `seeders/`. TypeScript compila sin errores, la conexión al MySQL configurado tuvo éxito y el servidor inició en el puerto 3002.

**Resultado del GATE de ISS-02:** cumplido para el alcance verificado.  
**Pendientes técnicos registrados:** advertencias de scripts bloqueados de instalación y vulnerabilidades npm; Oracle está configurado en el módulo, pero su conexión no se ha probado. `.env` permanece local y excluido de Git.

**Commit del hito ISS-02:** pendiente; el responsable decidirá cuándo crearlo y enviarlo.
