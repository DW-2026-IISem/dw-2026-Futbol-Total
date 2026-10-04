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

**Commit del hito ISS-02:** `6e97ba1bde83c4dbc6fe2a56181f8cb84851d1e7` — `feat(pedalibre): completar ISS-02 infraestructura de base de datos` (creado y enviado por el responsable).

## ISS-03-A — Feature Client: fundación

**Objetivo:** preparar el feature Client con arquitectura por capas.  
**Dependencia:** ISS-02, completado y enviado a `origin/main`.  
**Referencia:** `Guia-unificada.md`, ISS-03-A, subítem 4.0.1 — `src/shared/errors/app-error.ts`.

### Paso 1 — Crear `AppError` *(completado)*

**Acción:** desde `Proyecto Backend-2026`, crear `src/shared/errors/app-error.ts`:

```bash
cat > src/shared/errors/app-error.ts <<'EOF'
/**
 * Error de aplicación con código HTTP asociado.
 *
 * Lo lanzan los services cuando una regla de negocio no se cumple.
 * Los controllers lo traducen a una respuesta HTTP.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  public constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}
EOF
```

**Captura:** mostrar el archivo en `src/shared/errors/`.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `src/shared/errors/app-error.ts` define `AppError`, que extiende `Error` y expone `statusCode`.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS03A-P01-01-app-error.png`](trazabilidad/E-ISS03A-P01-01-app-error.png).

![Captura de AppError en src/shared/errors/app-error.ts](trazabilidad/E-ISS03A-P01-01-app-error.png)

**Conclusión:** Creé el error de aplicación con su código HTTP para que los controllers puedan convertir errores de negocio en respuestas HTTP.

### Paso 2 — Crear `BaseController` *(completado)*

**Referencia:** ISS-03-A, subítem 4.0.2 — `src/shared/http/base-controller.ts`.  
**Acción:** crear `src/shared/http/base-controller.ts`:

```bash
cat > src/shared/http/base-controller.ts <<'EOF'
import { Request, Response } from "express";
import { AppError } from "../errors/app-error";

export abstract class BaseController {
  protected async run(res: Response, work: () => Promise<void>): Promise<void> {
    try {
      await work();
    } catch (error) {
      this.handleError(res, error);
    }
  }

  protected paramId(req: Request): number {
    const raw = req.params.id;
    const value = Array.isArray(raw) ? raw[0] : raw;

    if (!value || !/^\d+$/.test(value) || Number(value) < 1) {
      throw new AppError(400, "Invalid id: must be a positive integer");
    }
    return Number(value);
  }

  protected handleError(res: Response, error: unknown): void {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Internal server error", detail: String(error) });
  }
}
EOF
```

**Captura:** mostrar el archivo en `src/shared/http/`.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `src/shared/http/base-controller.ts` define `run`, valida `:id` como entero positivo en `paramId` y traduce `AppError` a su código HTTP en `handleError`.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS03A-P02-01-base-controller.png`](trazabilidad/E-ISS03A-P02-01-base-controller.png).

![Captura de BaseController con el manejo común de errores y parámetros HTTP](trazabilidad/E-ISS03A-P02-01-base-controller.png)

**Conclusión:** Creé la clase base que centraliza el manejo de errores y la validación de identificadores de los controllers.

### Paso 3 — Crear el helper de transacciones *(completado)*

**Referencia:** ISS-03-A, subítem 4.0.3 — `src/shared/database/with-transaction.ts`.  
**Acción:** crear `src/shared/database/with-transaction.ts`:

```bash
cat > src/shared/database/with-transaction.ts <<'EOF'
import { Transaction } from "sequelize";
import { sequelize } from "../../database/db";

export async function withTransaction<T>(
  work: (transaction: Transaction) => Promise<T>
): Promise<T> {
  const transaction = await sequelize.transaction();
  let committed = false;

  try {
    const result = await work(transaction);
    await transaction.commit();
    committed = true;
    return result;
  } catch (error) {
    if (!committed) {
      await transaction.rollback().catch(() => undefined);
    }
    throw error;
  }
}
EOF
```

**Captura:** mostrar el archivo en `src/shared/database/`.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `withTransaction` abre una transacción, confirma al completar el trabajo y revierte si ocurre un error antes del commit.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS03A-P03-01-with-transaction.png`](trazabilidad/E-ISS03A-P03-01-with-transaction.png).

![Captura del helper withTransaction con commit y rollback](trazabilidad/E-ISS03A-P03-01-with-transaction.png)

**Conclusión:** Creé el helper para ejecutar operaciones dentro de una transacción y asegurar commit o rollback según el resultado.

### Paso 4 — Instalar bcryptjs *(completado)*

**Referencia:** ISS-03-A, subítem 4.1 — Modelo Client.  
**Acción:** desde `Proyecto Backend-2026`, ejecutar:

```bash
npm install bcryptjs@^3.0.3
npm install -D @types/bcryptjs@^3.0.0
```

**Captura:** mostrar el resultado de la instalación.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** npm instaló `bcryptjs` y `@types/bcryptjs`. npm reportó 19 vulnerabilidades (12 moderadas y 7 altas) y volvió a advertir que los scripts de `tedious` y `oracledb` están bloqueados.
- **Estado:** Cumple la instalación solicitada; las advertencias quedan registradas, sin ejecutar reparaciones automáticas.
- **Evidencia:** [`E-ISS03A-P04-01-bcryptjs.png`](trazabilidad/E-ISS03A-P04-01-bcryptjs.png).

![Captura de instalación de bcryptjs y sus advertencias npm](trazabilidad/E-ISS03A-P04-01-bcryptjs.png)

**Conclusión:** Instalé bcryptjs y sus tipos para proteger las contraseñas del modelo Client. Registré las advertencias de npm sin aplicar correcciones automáticas.

### Paso 5 — Crear el modelo Client *(completado)*

**Referencia:** ISS-03-A, subítem 4.1 — Modelo Client.  
**Acción:** crear `src/features/business/clients/client.model.ts`:

```bash
cat > src/features/business/clients/client.model.ts <<'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";
import bcrypt from "bcryptjs";

export interface ClientI {
  id?: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  password: string;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export class Client extends Model {
  public id!: number;
  public name!: string;
  public address!: string;
  public phone!: string;
  public email!: string;
  public password!: string;
  public status!: "active" | "inactive";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Client.init(
  {
    name: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { notEmpty: { msg: "Phone cannot be empty" } },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: { isEmail: { msg: "Email must be a valid email address" } },
    },
    password: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "inactive",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Client",
    tableName: "clients",
    timestamps: true,
    hooks: {
      beforeCreate: async (client: Client) => {
        if (client.password) {
          const salt = await bcrypt.genSalt(10);
          client.password = await bcrypt.hash(client.password, salt);
        }
      },
      beforeUpdate: async (client: Client) => {
        if (client.changed("password") && client.password) {
          const salt = await bcrypt.genSalt(10);
          client.password = await bcrypt.hash(client.password, salt);
        }
      },
      beforeBulkCreate: async (clients: Client[]) => {
        for (const client of clients) {
          if (client.password) {
            const salt = await bcrypt.genSalt(10);
            client.password = await bcrypt.hash(client.password, salt);
          }
        }
      },
    },
  },
);
EOF
```

**Captura:** mostrar el modelo en `src/features/business/clients/`.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** se creó `client.model.ts` con la interfaz y el modelo Client, estado `active`/`inactive`, timestamps y hooks bcrypt para creación, actualización y creación masiva.
- **Estado:** Archivo creado; falta verificar la compilación TypeScript.
- **Evidencia:** [`E-ISS03A-P05-01-modelo-client.png`](trazabilidad/E-ISS03A-P05-01-modelo-client.png).

![Captura del modelo Client en Visual Studio Code](trazabilidad/E-ISS03A-P05-01-modelo-client.png)

**Conclusión:** Creé el modelo Client con los campos, el estado predeterminado inactivo, las marcas de tiempo y el hash de contraseña previsto para sus operaciones de escritura. La compilación queda pendiente de verificación.

### Paso 6 — Verificar compilación TypeScript *(completado)*

**Acción:** desde `Proyecto Backend-2026`, ejecutar:

```bash
npx tsc --noEmit
```

**Captura:** mostrar el comando y su resultado en la terminal. Si aparecen errores, no registrar este paso como cumplido; corregirlos y repetir la verificación.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `npx tsc --noEmit` terminó y devolvió el prompt sin mostrar errores.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS03A-P06-01-compilacion-modelo-client.png`](trazabilidad/E-ISS03A-P06-01-compilacion-modelo-client.png).

![Captura de la compilación TypeScript sin errores](trazabilidad/E-ISS03A-P06-01-compilacion-modelo-client.png)

**Conclusión:** Verifiqué el modelo Client con el compilador TypeScript; el comando terminó sin reportar errores.

### Paso 7 — Crear carpetas HTTP y DTO *(completado)*

**Referencia:** ISS-03-A, subítem 4.2 — DTO + esqueletos.  
**Acción:** desde `Proyecto Backend-2026`, ejecutar:

```bash
mkdir -p src/features/business/clients/http src/features/business/clients/dto
```

**Captura:** mostrar el árbol del proyecto con ambas carpetas bajo `src/features/business/clients/`.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** se crearon las carpetas `http/` y `dto/` dentro de `src/features/business/clients/`.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS03A-P07-01-carpetas-http-dto.png`](trazabilidad/E-ISS03A-P07-01-carpetas-http-dto.png).

![Captura de las carpetas http y dto del feature Clients](trazabilidad/E-ISS03A-P07-01-carpetas-http-dto.png)

**Conclusión:** Creé las carpetas reservadas para las solicitudes HTTP de prueba y los objetos de transferencia de datos del feature Clients.

### Paso 8 — Crear DTO de creación *(completado)*

**Referencia:** ISS-03-A, subítem 4.2 — DTO `CreateClientDto`.  
**Acción:** desde `Proyecto Backend-2026`, ejecutar:

```bash
cat > src/features/business/clients/dto/create-client.dto.ts <<'EOF'
/** Datos de entrada de `POST /api/clientes`. */
export interface CreateClientDto {
  name: string;
  address: string;
  phone: string;
  email: string;
  password: string;
  /** Opcional: por defecto `active`. Tras crearlo, el estado sólo cambia con el borrado lógico. */
  status?: "active" | "inactive";
}
EOF
```

**Captura:** mostrar el archivo completo `create-client.dto.ts` en el editor.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** se creó `CreateClientDto` con los datos de entrada requeridos y el estado opcional `active`/`inactive`.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS03A-P08-01-create-client-dto.png`](trazabilidad/E-ISS03A-P08-01-create-client-dto.png).

![Captura del DTO CreateClientDto](trazabilidad/E-ISS03A-P08-01-create-client-dto.png)

**Conclusión:** Definí los datos aceptados para crear un cliente y dejé el estado como campo opcional, conforme al contrato del manual.

### Paso 9 — Crear DTO de actualización *(completado)*

**Referencia:** ISS-03-A, subítem 4.2 — DTO `UpdateClientDto`.  
**Acción:** crear el archivo desde `Proyecto Backend-2026`:

```bash
cat > src/features/business/clients/dto/update-client.dto.ts <<'EOF'
/**
 * Datos de entrada de `PUT /api/clientes/:id` (reemplazo completo).
 *
 * `status` no se incluye: el estado sólo cambia con el borrado lógico.
 */
export interface UpdateClientDto {
  name: string;
  address: string;
  phone: string;
  email: string;
  /** Si no se envía, el service conserva el hash actual. */
  password?: string;
}
EOF
```

**Captura:** mostrar el archivo completo `update-client.dto.ts` en el editor.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** se creó `UpdateClientDto` para reemplazo completo; incluye los datos requeridos y contraseña opcional, sin permitir cambiar el estado mediante PUT.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS03A-P09-01-update-client-dto.png`](trazabilidad/E-ISS03A-P09-01-update-client-dto.png).

![Captura del DTO UpdateClientDto](trazabilidad/E-ISS03A-P09-01-update-client-dto.png)

**Conclusión:** Definí el contrato de actualización completa. Dejé fuera el estado para que su modificación quede reservada al borrado lógico.

### Paso 10 — Crear DTO de actualización parcial *(completado)*

**Referencia:** ISS-03-A, subítem 4.2 — DTO `PatchClientDto`.  
**Acción:** crear desde `Proyecto Backend-2026`:

```bash
cat > src/features/business/clients/dto/patch-client.dto.ts <<'EOF'
import { UpdateClientDto } from "./update-client.dto";

/** Datos de entrada de `PATCH /api/clientes/:id` (actualización parcial). */
export type PatchClientDto = Partial<UpdateClientDto>;
EOF
```

**Captura:** mostrar el archivo completo `patch-client.dto.ts` en el editor.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** se creó `PatchClientDto` como `Partial<UpdateClientDto>`. La captura muestra el comando y el resultado en la terminal, y el archivo en el árbol del proyecto.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS03A-P10-01-patch-client-dto.png`](trazabilidad/E-ISS03A-P10-01-patch-client-dto.png).

![Captura de la creación de PatchClientDto](trazabilidad/E-ISS03A-P10-01-patch-client-dto.png)

**Conclusión:** Definí el DTO para actualizar parcialmente un cliente reutilizando los campos permitidos por `UpdateClientDto`.

### Paso 11 — Crear DTO de respuesta *(completado)*

**Referencia:** ISS-03-A, subítem 4.2 — DTO `ClientResponseDto`.  
**Acción:** crear el archivo desde `Proyecto Backend-2026`:

```bash
cat > src/features/business/clients/dto/client-response.dto.ts <<'EOF'
import { Client, ClientI } from "../client.model";

/**
 * Respuesta HTTP de un cliente. Lo usan GET de clientes y las respuestas de
 * creación, actualización y borrado lógico.
 * La contraseña nunca se expone.
 */
export type ClientResponseDto = Omit<ClientI, "password">;

/** Convierte el modelo en un objeto plano sin la contraseña. */
export function toClientResponse(client: Client): ClientResponseDto {
  const { password, ...safe } = client.toJSON() as ClientI & { password?: string };
  return safe;
}
EOF
```

**Captura:** mostrar el archivo completo `client-response.dto.ts` en el editor.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** se creó `ClientResponseDto` y el mapper `toClientResponse`, que devuelve los datos del modelo sin la contraseña.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS03A-P11-01-client-response-dto.png`](trazabilidad/E-ISS03A-P11-01-client-response-dto.png).

![Captura del DTO de respuesta que excluye la contraseña](trazabilidad/E-ISS03A-P11-01-client-response-dto.png)

**Conclusión:** Definí el DTO de respuesta y su mapper; comprobé visualmente que la contraseña se excluye de la salida prevista para HTTP.

### Paso 12 — Crear el índice de exportación de DTOs *(completado)*

**Referencia:** ISS-03-A, subítem 4.2 — `dto/index.ts`.  
**Acción:** crear el archivo desde `Proyecto Backend-2026`:

```bash
cat > src/features/business/clients/dto/index.ts <<'EOF'
export * from "./create-client.dto";
export * from "./update-client.dto";
export * from "./patch-client.dto";
export * from "./client-response.dto";
EOF
```

**Captura:** mostrar el archivo completo `dto/index.ts` en el editor.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `dto/index.ts` exporta los DTOs de creación, actualización completa, actualización parcial y respuesta.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS03A-P12-01-dto-index.png`](trazabilidad/E-ISS03A-P12-01-dto-index.png).

![Captura del índice de exportación de DTOs](trazabilidad/E-ISS03A-P12-01-dto-index.png)

**Conclusión:** Centralicé las exportaciones de los cuatro DTOs en el punto de entrada de la carpeta.

### Paso 13 — Crear esqueleto del repository *(completado)*

**Referencia:** ISS-03-A, subítem 4.2 — Repository.  
**Acción:** crear desde `Proyecto Backend-2026`:

```bash
cat > src/features/business/clients/clients.repository.ts <<'EOF'
import { Client } from "./client.model";

/**
 * Capa Repository del feature Clients.
 * Única responsable de hablar con Sequelize (el modelo `Client`).
 */
export class ClientsRepository {
  // ================== READ ==================
  // (rellenar en ISS-03-B) findAllActive, findById

  // ================== CREATE ==================
  // (rellenar en ISS-03-C) create

  // ================== UPDATE ==================
  // (rellenar en ISS-03-D) update

  // ================== DELETE ==================
  // (rellenar en ISS-03-E) delete
}
EOF
```

**Captura:** mostrar el archivo completo `clients.repository.ts` en el editor.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** se creó `ClientsRepository` con la importación de `Client` y secciones reservadas para READ, CREATE, UPDATE y DELETE de las siguientes ISS.
- **Estado:** Cumple el criterio de esqueleto.
- **Evidencia:** [`E-ISS03A-P13-01-clients-repository.png`](trazabilidad/E-ISS03A-P13-01-clients-repository.png).

![Captura del esqueleto de ClientsRepository](trazabilidad/E-ISS03A-P13-01-clients-repository.png)

**Conclusión:** Creé el esqueleto del repository con la separación por operaciones definida para completar el CRUD en las ISS posteriores.

### Paso 14 — Crear esqueleto del service *(completado)*

**Referencia:** ISS-03-A, subítem 4.2 — Service.  
**Acción:** crear desde `Proyecto Backend-2026`:

```bash
cat > src/features/business/clients/clients.service.ts <<'EOF'
import { ClientsRepository } from "./clients.repository";

/**
 * Capa Service del feature Clients.
 * Reglas de negocio; no conoce req/res ni Sequelize (delega en el repository).
 */
export class ClientsService {
  public constructor(
    private readonly repository: ClientsRepository = new ClientsRepository()
  ) {}

  // ================== READ ==================
  // (rellenar en ISS-03-B) getAll, getOne

  // ================== CREATE ==================
  // (rellenar en ISS-03-C) create

  // ================== UPDATE ==================
  // (rellenar en ISS-03-D) updatePut, updatePatch

  // ================== DELETE ==================
  // (rellenar en ISS-03-E) deletePhysical, deleteLogical
}
EOF
```

**Captura:** mostrar el archivo completo `clients.service.ts` en el editor.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** se creó `ClientsService`, que recibe `ClientsRepository` y reserva secciones para las operaciones CRUD que se completarán en ISS-03-B a ISS-03-E.
- **Estado:** Cumple el criterio de esqueleto.
- **Evidencia:** [`E-ISS03A-P14-01-clients-service.png`](trazabilidad/E-ISS03A-P14-01-clients-service.png).

![Captura del esqueleto de ClientsService](trazabilidad/E-ISS03A-P14-01-clients-service.png)

**Conclusión:** Creé el esqueleto del service con inyección del repository y reservé las operaciones de negocio para las ISS posteriores.

### Paso 15 — Crear esqueleto del controller *(completado)*

**Referencia:** ISS-03-A, subítem 4.2 — Controller.  
**Acción:** crear desde `Proyecto Backend-2026`:

```bash
cat > src/features/business/clients/clients.controller.ts <<'EOF'
import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import { ClientsService } from "./clients.service";

/**
 * Capa Controller del feature Clients.
 * Solo HTTP: lee req, llama al service y arma res.
 */
export class ClientsController extends BaseController {
  public constructor(
    private readonly service: ClientsService = new ClientsService()
  ) {
    super();
  }

  // ================== READ ==================
  // (rellenar en ISS-03-B) getAll, getOne

  // ================== CREATE ==================
  // (rellenar en ISS-03-C) create

  // ================== UPDATE ==================
  // (rellenar en ISS-03-D) updatePut, updatePatch

  // ================== DELETE ==================
  // (rellenar en ISS-03-E) deletePhysical, deleteLogical
}
EOF
```

**Captura:** mostrar el archivo completo `clients.controller.ts` en el editor.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** se creó `ClientsController`, que extiende `BaseController`, recibe `ClientsService` y reserva las operaciones para ISS-03-B a ISS-03-E.
- **Estado:** Cumple el criterio de esqueleto.
- **Evidencia:** [`E-ISS03A-P15-01-clients-controller.png`](trazabilidad/E-ISS03A-P15-01-clients-controller.png).

![Captura del esqueleto de ClientsController](trazabilidad/E-ISS03A-P15-01-clients-controller.png)

**Conclusión:** Creé el esqueleto del controller con su dependencia del service y las áreas de operaciones pendientes.

### Paso 16 — Crear esqueleto de rutas *(completado)*

**Referencia:** ISS-03-A, subítem 4.2 — Routes.  
**Acción:** crear desde `Proyecto Backend-2026`:

```bash
cat > src/features/business/clients/clients.routes.ts <<'EOF'
import { Application } from "express";
import { ClientsController } from "./clients.controller";

export class ClientsRoutes {
  public clientsController: ClientsController = new ClientsController();

  public routes(app: Application): void {
    // Rutas del feature, sin autenticación ni middleware JWT en esta fase.
    // Se completarán en ISS-03-B a ISS-03-E.
  }
}
EOF
```

**Captura:** mostrar el archivo completo `clients.routes.ts` en el editor.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** se creó `ClientsRoutes` con una instancia de `ClientsController` y el método `routes(app)` reservado, sin endpoints ni middleware JWT en esta fase.
- **Estado:** Cumple el criterio de esqueleto.
- **Evidencia:** [`E-ISS03A-P16-01-clients-routes.png`](trazabilidad/E-ISS03A-P16-01-clients-routes.png).

![Captura del esqueleto de ClientsRoutes](trazabilidad/E-ISS03A-P16-01-clients-routes.png)

**Conclusión:** Reservé la estructura de rutas del feature para completarla en las ISS siguientes, manteniendo la indicación del manual de no añadir autenticación en esta fase.

### Paso 17 — Crear agregador de rutas *(completado)*

**Referencia:** ISS-03-A, subítem 4.3 — Agregador Routes.  
**Acción:** crear desde `Proyecto Backend-2026`:

```bash
cat > src/routes/index.ts <<'EOF'
import { ClientsRoutes } from "../features/business/clients/clients.routes";

export class Routes {
  public clientsRoutes: ClientsRoutes = new ClientsRoutes();
}
EOF
```

**Captura:** mostrar `src/routes/index.ts` completo y el árbol de archivos.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** se creó `src/routes/index.ts` con la clase `Routes` y una instancia de `ClientsRoutes`.
- **Estado:** Cumple el criterio del subítem 4.3.
- **Evidencia:** [`E-ISS03A-P17-01-routes-index.png`](trazabilidad/E-ISS03A-P17-01-routes-index.png).

![Captura del agregador Routes](trazabilidad/E-ISS03A-P17-01-routes-index.png)

**Conclusión:** Creé el agregador del feature Clients; queda pendiente cablearlo a `App`.

### Paso 18 — Cablear rutas e inicialización de base de datos *(completado)*

**Referencia:** ISS-03-A, subítem 4.3 — integración con `src/config/index.ts`.

El manual indica importar el modelo y la configuración Sequelize, registrar `Routes` en la aplicación y ejecutar `sequelize.sync({ force: false, alter: true })` durante el arranque. La opción `alter: true` puede alterar el esquema existente de la base de datos. El usuario autorizó seguir el manual con esta opción; debe ejecutarse únicamente sobre una base de desarrollo respaldada.

**Adaptación aplicada:** el manual parte de una variante de `src/config/index.ts` con `var cors = require(...)`; el proyecto ya utiliza imports ES (`import cors from "cors"`). Se conservó la estructura e imports actuales y se añadieron el registro de rutas y la inicialización Sequelize.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** Sequelize autenticó correctamente en MySQL; `sequelize.sync({ force: false, alter: true })` sincronizó `clients`, incluida la incorporación de `createdAt` y `updatedAt`; el servidor inició en el puerto 3002.
- **Estado:** Cumple. La opción `alter: true` se ejecutó con autorización del usuario; las modificaciones observables del esquema quedan registradas.
- **Evidencia:** [`E-ISS03A-P18-01-db-sync-server.png`](trazabilidad/E-ISS03A-P18-01-db-sync-server.png).

![Captura de conexión MySQL, sincronización de clients e inicio del servidor](trazabilidad/E-ISS03A-P18-01-db-sync-server.png)

**Conclusión:** Conecté la aplicación a la base seleccionada, sincronicé el modelo Client y comprobé que el servidor inició en el puerto 3002.

### Paso 19 — Detener el servidor de desarrollo *(completado)*

**Acción:** en la terminal donde se ejecuta `npm run dev`, presionar `Ctrl+C` una vez y esperar a que vuelva el prompt.

**Captura:** mostrar la terminación del proceso y el prompt de la terminal.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** se presionó `Ctrl+C`; el proceso terminó y la terminal devolvió el prompt.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS03A-P19-01-detener-servidor.png`](trazabilidad/E-ISS03A-P19-01-detener-servidor.png).

![Captura de la detención del servidor con Ctrl+C](trazabilidad/E-ISS03A-P19-01-detener-servidor.png)

**Conclusión:** Detuve el servidor después de comprobar la conexión a la base de datos y el inicio exitoso.

### Paso 20 — Verificación final TypeScript de ISS-03-A *(completado)*

**Acción:** desde `Proyecto Backend-2026`, ejecutar:

```bash
npx tsc --noEmit
```

**Captura:** mostrar el comando y su resultado final en la terminal.

**Registro de ejecución:**

- **Fecha:** 2026-10-04.
- **Resultado observado:** `npx tsc --noEmit` terminó y devolvió el prompt sin reportar errores.
- **Estado:** Cumple.
- **Evidencia:** [`E-ISS03A-P20-01-verificacion-final.png`](trazabilidad/E-ISS03A-P20-01-verificacion-final.png).

![Captura de la compilación final sin errores](trazabilidad/E-ISS03A-P20-01-verificacion-final.png)

**Conclusión:** Verifiqué la compilación de ISS-03-A con TypeScript y el comando terminó sin mostrar errores.

### Criterios de cierre ISS-03-A

- [x] Carpetas `dto/` y `http/` creadas.
- [x] DTOs create/update/patch/response e índice de exportación creados.
- [x] Esqueletos de repository, service, controller y routes creados.
- [x] Agregador de rutas conectado a `App`.
- [x] Modelo Client importado y sincronización de base verificada.
- [x] Servidor detenido y compilación TypeScript verificada.

**Estado de ISS-03-A:** completado según verificaciones ejecutadas. La implementación de operaciones CRUD queda para ISS-03-B a ISS-03-E.
