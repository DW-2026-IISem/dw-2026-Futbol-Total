> **Workspace:** `backend-nest-ia` · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-02 — Entorno Sequelize y common

**Naturaleza:** práctico (desarrollo de software backend)
**Issue GitHub:** `dw-2026-Futbol-Total #3`
**Responsable (desarrollador):** Oscar Vega
**Revisor humano:** Oscar Vega
**Dependencias:** ISS-01 en **Hecho**
**Commit esperado:** `feat(iss-02): entorno Sequelize y common` con `Refs #3`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, la app validará su `.env` al arrancar y se conectará a la base de datos `Pedalibre` del motor indicado por `DB_DIALECT`, con logger y filtro de errores comunes, para que las features siguientes persistan datos sin configurar nada más.

**SPEC (qué debe quedar):**
- `src/config/environment/`: carga y **validación** del `.env` (falla rápido, con mensaje que **nombra la variable** faltante del bloque del dialecto activo).
- `src/infrastructure/database/sequelize/sequelize.factory.ts`: crea la instancia según `DB_DIALECT` leyendo **solo** el bloque `DB_<MOTOR>_*` correspondiente; `ALL_MODELS = []` (aún sin modelos); `sequelize.sync({ alter: false })`.
- `sequelize.module.ts` global que expone la instancia al resto de la app.
- `src/common/exceptions/` con la jerarquía `ApplicationException(statusCode)` → `EntityNotFoundException (404)`, `DomainException (400)`, `BusinessRuleException (409)`; `src/common/filters/global-exception.filter.ts` (lee `statusCode` de esas excepciones; el resto conserva su código o cae en 500) y `src/common/interceptors/` (`logging`, `timeout`, `response`).
- **Envelope de respuesta:** desde este issue, `ResponseInterceptor` envuelve toda respuesta exitosa en `{ statusCode, message, data, timestamp }`; los listados paginados van en `data.items[]` + `data.meta`. Por eso `GET /api/health` pasa a responder `{ …, "data": { "status": "ok" } }` y los AC de ISS-03…ISS-06 hablan de `data.<campo>`.
- **Fail-fast real:** el módulo de Sequelize inyecta el namespace tipado `envConfig.KEY` (no `ConfigService`) para que la validación del `.env` ocurra **antes** de intentar conectar. Si se inyecta `ConfigService`, Nest puede resolverlo antes de que `load` termine y el error de configuración se enmascara como `ECONNREFUSED`.
- `.env.example` **versionado** y `.env` **local** con el contrato completo de `docs/Prompt.md` §8.
- Base de datos vacía `Pedalibre` creada **por el desarrollador** antes de Verificación (`CREATE DATABASE IF NOT EXISTS Pedalibre CHARACTER SET utf8mb4;`).

**REQ (restricciones):**
- `sync({ alter: false })`. Nunca `force: true` ni `alter: true`.
- Contrato `.env`: `DB_DIALECT` + bloques `DB_MYSQL_*` / `DB_POSTGRES_*` / `DB_MSSQL_*` / `DB_ORACLE_*`. **No** `DB_HOST` / `DB_USERNAME` genéricos.
- Fuera de alcance: Clients, ProductTypes, Products, Sales, Auth, Users, JWT Token. No adelantar ISS-03.
- `.env` no se commitea (está en `.gitignore`). `.env.example` sí, sin credenciales reales.

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [x] **AC-1** Dado un `.env` con `DB_DIALECT=mysql`, bloque `DB_MYSQL_*` completo y la BD `Pedalibre` existente; cuando **el desarrollador** ejecuta `npm run start:dev`; entonces el log muestra la conexión a la BD como exitosa y la app queda escuchando en `3002`.
- [x] **AC-2** Dado una **copia** del `.env` a la que se le quitó una variable crítica del bloque activo (`DB_MYSQL_HOST`, `DB_MYSQL_USERNAME` o `DB_MYSQL_NAME`; la contraseña no es crítica porque puede ser vacía en instalaciones locales); cuando se arranca la app con esa copia; entonces el boot **falla antes de conectar** (no aparece ningún `ECONNREFUSED` ni `Conexión`) con un mensaje `Error de configuración: …` que nombra la variable faltante; y al restaurar el `.env` original vuelve a arrancar.
- [x] **AC-3** Dado el código fuente; cuando se busca `sync(`; entonces la única llamada es `sync({ alter: false })` y no existe `force: true` en ningún archivo.
- [x] **AC-4** Dado el repositorio; cuando se revisa `git status` y `.env.example`; entonces `.env` **no** aparece para commit y `.env.example` contiene `DB_DIALECT` y los cuatro bloques completos.

**Checklist interno (IA, En curso):**
- [x] Env tipado y validado (por dialecto activo)
- [x] `.env.example` multi-motor + `.env` local
- [x] Factory Sequelize multi-dialecto (`mysql2`, `pg`, `tedious`, `oracledb`)
- [x] Módulo Sequelize global
- [x] `HttpExceptionFilter` + `LoggingInterceptor` registrados en `main.ts`
- [x] Sin features de negocio ni Auth

---

## 2. Revisión de AC — autoriza **En curso** (la escribe el revisor al final de Preparado)

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-09-15 | Oscar Vega | aporte | OBJ, SPEC, REQ, AC | trazabilidad/ISS-02.md | Criterios verificables; conexión multi-motor, fail-fast, sin features Business ni Auth. | AC aprobados — puede En curso |

Decisión posible: `AC aprobados — puede En curso` · `Ajustar AC` (indicar cuál y por qué).

---

## 3. IA usada — se diligencia en **En curso**, después de enviar el prompt

**Herramienta / modelo:** Cursor
**Fecha:** 2026-09-15

**Prompt enviado:**

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-02, no del backend entero.

Implementa los AC de trazabilidad/ISS-02.md siguiendo docs/Prompt.md (secciones 2, 3, 7 y 8).

Entorno: src/config/environment con validación al arrancar (class-validator sobre process.env) que exige SOLO las variables del bloque del DB_DIALECT activo y falla con un mensaje "Error de configuración: …" que nombra la variable faltante.
Sequelize: src/infrastructure/database/sequelize/sequelize.factory.ts multi-dialecto (mysql | postgres | mssql | oracle) con ALL_MODELS = [] y sequelize.sync({ alter: false }); sequelize.module.ts global cuyo useFactory inyecta el namespace tipado envConfig.KEY (NO ConfigService) para que la validación ocurra ANTES de intentar conectar.
Common: src/common/exceptions (ApplicationException con statusCode; EntityNotFoundException 404, DomainException 400, BusinessRuleException 409), src/common/filters/global-exception.filter.ts que lee ese statusCode, src/common/interceptors/{logging,timeout,response}.interceptor.ts. ResponseInterceptor envuelve toda respuesta exitosa en { statusCode, message, data, timestamp }. Todo registrado en main.ts.
Escribe .env.example Y actualiza el .env local con el contrato de docs/Prompt.md §8 (DB_DIALECT + bloques DB_MYSQL_*, DB_POSTGRES_*, DB_MSSQL_*, DB_ORACLE_*). NO uses DB_HOST / DB_USERNAME genéricos.
Instala los drivers: mysql2, pg, tedious, oracledb.

Prohibido: force: true, alter: true, modelos de negocio, Clients, Auth, Users, JWT Token. NO adelantes ISS-03.
NO toques docs/ ni trazabilidad/. NO commitees .env.

Al final entrega tres listas: archivos tocados; cómo verifico cada AC (comandos exactos); qué quedó fuera de alcance.
```

**Ajustes o correcciones que hiciste a lo generado:** Se configuró el `.env` local para MySQL y la base `Pedalibre` sin versionarlo. Se corrigió el error de compilación TS2441 en `sequelize.factory.ts`, renombrando la constante local `require` a `nodeRequire`. Se verificó el build desde una terminal WSL nativa.

---

## 4. EVI — se diligencia en **Verificación** (después de ejecutar tú mismo)

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
| 2026-09-15 | log de arranque con conexión OK | AC-1 | Consola WSL: conexión exitosa a MySQL y `Nest application successfully started` | `npm run start:dev` |
| 2026-09-15 | log de fallo explícito | AC-2 | Consola WSL: `Error de configuración: falta la variable DB_MYSQL_HOST` | Copiar `.env`, quitar temporalmente `DB_MYSQL_HOST`, ejecutar `npm run start:dev` y restaurar `.env` |
| 2026-09-15 | búsqueda en código | AC-3 | `src/infrastructure/database/sequelize/sequelize.factory.ts:67` contiene `sync({ alter: false })`; no existe `force: true` ni `alter: true` | `grep -RIn "sync(" src` y búsqueda de valores prohibidos |
| 2026-09-15 | estado de Git y contrato | AC-4 | `.gitignore:5:.env .env`; validación sin variables faltantes y `DB_DIALECT` presente en `.env.example` | `git check-ignore -v .env` y verificación de los cuatro bloques |

**Commit (hash):** pendiente — se registrará después de terminar la verificación.

**Autoevaluación de AC:** AC-1: sí · AC-2: sí · AC-3: sí · AC-4: sí.

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

Preguntas guía del revisor: abrir el factory y pedir «muéstrame dónde se elige el dialecto y dónde está `alter: false`»; «¿qué pasa si `DB_DIALECT=postgres` y falta `DB_POSTGRES_HOST`?».

| Fecha | Revisor | Actuación (aporte · revisión conforme · devolución) | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------------------------------------------------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** pendiente (`aprobado` · `aprobado con observación` · `devuelto` · `cancelado`)
**Conclusión:**
**Trazabilidad final:** (hash del commit definitivo + enlace al Issue)
