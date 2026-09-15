# Informe de evidencias — Backend Business con SDD + Kanban

**Repositorio:** `DW-2026-IISem/dw-2026-Futbol-Total`  
**Workspace:** `~/ia-lab/projecs/desarrollo web/Pedalibre-Desarrollo Web/dw-2026-Futbol-Total`  
**Metodología:** SDD + Kanban + asistencia de IA + revisión humana  
**Estado:** configuración base de ISS-01 implementada y verificada; el tablero y los Issues de GitHub quedaron fuera del alcance por indicación docente.

## Día 0 — Preparación de trazabilidad y repositorio remoto

Se reorganizaron los materiales existentes en la carpeta `motores/` y se añadieron las siete plantillas de trazabilidad: `ISS-01.md` a `ISS-07.md`.

Se creó el commit inicial:

```text
f10a2e8 chore(dia-0): preparar trazabilidad inicial
```

El commit se envió correctamente al remoto `origin/main`.

### Evidencia 01 — Commit inicial y push exitoso

![Terminal: commit Día 0 y push a origin/main](evidencias/01-dia-0-commit-y-push.png)

**Cómo reproducir la verificación:**

```bash
git log -1 --oneline
git status --short
```

**Resultado esperado:** el historial debe incluir el commit `f10a2e8` y el repositorio debe sincronizarse con `origin/main`.

## Limpieza del workspace

Se eliminó el marcador obsoleto `proyecto/.gitkeep` y los metadatos de Windows `Zone.Identifier` asociados a las plantillas de trazabilidad. Se añadió este informe y su evidencia visual al repositorio.

### Evidencia 02 — Estado preparado para el commit de limpieza

![Terminal: archivos correctos preparados para commit](evidencias/02-limpieza-workspace.png)

**Resultado verificado:** se prepararon `Informe_Evidencias.md`, la evidencia del Día 0 y la eliminación de `proyecto/.gitkeep`; no quedaron archivos `Zone.Identifier`.

### Evidencia 03 — Push final del Día 0

![Terminal: DNS recuperado y push exitoso](evidencias/03-push-dia-0.png)

La resolución DNS de WSL fue restaurada y GitHub recibió el commit `2cd9bd3` en la rama `main`.

## Bloqueo temporal — Tablero Kanban

La creación del GitHub Project tipo Board no pudo realizarse debido a un error de la plataforma. El docente fue informado y está trabajando en su resolución.

**Decisión:** por indicación del docente, GitHub Projects y GitHub Issues no son requisitos de entrega. Se aplaza su configuración, pero el desarrollo técnico continúa. El informe de evidencias y las plantillas locales de trazabilidad se conservarán como respaldo del proceso.

## Creación del proyecto NestJS base

Se generó el proyecto temporal `futbol-total-api` mediante NestJS CLI en `/tmp/futbol-total-api`. Se seleccionó **No** para la observabilidad automática y **CJS (CommonJS)** como sistema de módulos.

### Evidencia 04 — Generación exitosa del proyecto NestJS

![Terminal: NestJS CLI crea futbol-total-api](evidencias/04-creacion-proyecto-nestjs.png)

La CLI confirmó `Successfully created project futbol-total-api`. El proyecto será trasladado a la raíz del repositorio conservando las carpetas de documentación y trazabilidad existentes.

## Dependencias de validación

Se instalaron `class-validator` y `class-transformer`, dependencias requeridas para validar y transformar las solicitudes HTTP mediante `ValidationPipe`.

### Evidencia 05 — Instalación de dependencias

![Terminal: instalación de class-validator y class-transformer](evidencias/05-dependencias-validacion.png)

La instalación añadió cinco paquetes y terminó correctamente. npm reportó vulnerabilidades transitivas; no se aplicó `npm audit fix --force` para evitar modificaciones incompatibles no revisadas.

## Estructura inicial de Clean Architecture

Se crearon las carpetas `src/config`, `src/common` y `src/infrastructure/database`. También se generó `BusinessModule`, registrado automáticamente en `AppModule`. El archivo `.gitignore` fue actualizado para excluir `node_modules/`, `dist/` y `.env`.

### Evidencia 06 — Módulo Business y estructura base

![Terminal: creación de BusinessModule y actualización de AppModule](evidencias/06-estructura-clean-architecture.png)

La salida confirma la creación de `src/features/business/business.module.ts` y la actualización de `src/app.module.ts`.

## Arranque y comprobación de la API

Se ejecutó `npm run start:dev`. El servidor inició sin errores, cargó `BusinessModule` y registró el endpoint `GET /api/health` bajo el prefijo global `/api`.

### Evidencia 07 — Servidor NestJS iniciado

![VS Code: NestJS iniciado y ruta health registrada](evidencias/07-servidor-nestjs-iniciado.png)

La consola confirma `Found 0 errors`, `Mapped {/api/health, GET}` y `Nest application successfully started`.

### Evidencia 08 — Endpoint de salud operativo

![VS Code: curl al endpoint health responde HTTP 200](evidencias/08-endpoint-health-200.png)

El comando `curl -i http://localhost:3002/api/health` respondió `HTTP/1.1 200 OK`, con CORS habilitado para `http://localhost:4200`.

## Revisión previa al commit técnico

Se revisó el estado de Git antes del primer commit técnico. Los archivos del esqueleto NestJS, las configuraciones, el código fuente, pruebas y evidencias están pendientes de registrar. Las dependencias y la carpeta `dist/` permanecen excluidas.

### Evidencia 09 — Revisión de archivos pendientes

![Terminal: git status antes del commit técnico](evidencias/09-revision-archivos-commit.png)

Como ajuste adicional, se excluirá `*.tsbuildinfo`, un archivo generado por TypeScript que no debe versionarse.

### Verificación de formato del script

La primera ejecución de `git diff --cached --check` detectó saltos de línea CRLF en `scripts/free-port.js`. Se corregirán a formato LF antes del commit para mantener compatibilidad con el entorno WSL/Linux.

![Terminal: detección de CRLF en free-port.js](evidencias/10-validacion-lineas-script.png)

### Evidencia 11 — Validación de Git sin errores

![Terminal: git diff cached check sin advertencias](evidencias/11-validacion-git-sin-errores.png)

Después de convertir el script a formato LF, `git diff --cached --check` terminó sin mensajes, confirmando que no hay errores de espacios finales.

Para conservar en Git las carpetas vacías de la estructura base (`src/config`, `src/common` y `src/infrastructure/database`), se añadirán archivos `.gitkeep`.

## Commit técnico — ISS-01

Se consolidó el esqueleto NestJS, la configuración de la API y las evidencias de verificación en el commit:

```text
959a4c4 feat(iss-01): esqueleto NestJS CA arrancable
```

El commit se envió correctamente a la rama remota `main`.

### Evidencia 12 — Commit y push de ISS-01

![Terminal: commit técnico ISS-01 y push exitoso](evidencias/12-commit-iss-01-push.png)
