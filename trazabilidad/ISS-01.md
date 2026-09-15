> **Workspace:** `backend-nest-ia` · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-01 — Esqueleto NestJS CA arrancable

**Naturaleza:** práctico (desarrollo de software backend)  
**Issue GitHub:** `dw-2026-Futbol-Total #1`  
**Responsable (desarrollador):** Oscar Vega  
**Revisor humano:** Oscar Vega  
**Dependencias:** ninguna (primer issue del proyecto)  
**Commit esperado:** `feat(iss-01): esqueleto NestJS CA arrancable` con `Refs #1`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, el desarrollador podrá arrancar un proyecto NestJS versionado en Git, con el árbol de Clean Architecture de la pista, para construir sobre él las features siguientes sin reorganizar carpetas.

**SPEC (qué debe quedar):**

- Proyecto NestJS (npm) generado **en la raíz del workspace**, conservando intactos `.git/`, `docs/` y `trazabilidad/`.
- Árbol `src/config/`, `src/common/`, `src/infrastructure/database/`, `src/features/business/` (vacío o con `business.module.ts` stub). Ver `docs/Prompt.md` §3.
- `main.ts` con prefijo global `/api`, CORS (`enableCors({ origin: 'http://localhost:4200', credentials: true })`), `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`) y `listen(PORT ?? 3002)`.
- Endpoint de salud `GET /api/health` → `200 { "status": "ok" }` (sirve para comprobar el arranque sin BD).
- Script `free:port` (`scripts/free-port.js`) y `start:dev` que lo invoque antes de `nest start --watch`.
- `.gitignore` con `node_modules/`, `dist/`, `.env`.

**REQ (restricciones):**

- Fuera de alcance: Sequelize, base de datos, `.env` de BD, Auth, Users, JWT Token, login. Eso es ISS-02 en adelante.
- No `sync({ force: true })` (aquí ni siquiera hay Sequelize).
- No adelantar ISS-02. No borrar ni reescribir `docs/` ni `trazabilidad/`.

**AC (Dado → Cuando → Entonces; deciden el Gate):**

- [x] **AC-1** Dado el workspace con `.git/`, `docs/` y `trazabilidad/`; cuando la IA termina; entonces existen `package.json` y `src/main.ts`, y `docs/` y `trazabilidad/` siguen intactos (`git status` no muestra borrados en esas carpetas).
- [x] **AC-2** Dado el proyecto con dependencias instaladas; cuando **el desarrollador** ejecuta `npm run start:dev`; entonces la app levanta sin error y el log muestra `Nest application successfully started` en el puerto `3002`.
- [x] **AC-3** Dado la app arriba; cuando se hace `GET http://localhost:3002/api/health`; entonces responde `200` con `{ "status": "ok" }`.
- [x] **AC-4** Dado `src/`; cuando se listan sus carpetas; entonces existen `config/`, `common/`, `infrastructure/database/`, `features/business/` y **no** existe `features/auth/`.

**Checklist interno (lo ejecuta la IA en En curso; no sale al tablero):**

- [x] Generar Nest sin borrar `.git`, `docs/` ni `trazabilidad/`
- [x] Árbol CA de la pista
- [x] `main.ts`: prefijo `/api`, CORS, `ValidationPipe`, puerto
- [x] `GET /api/health`
- [x] `scripts/free-port.js` + scripts npm
- [x] `.gitignore`

---

## 2. Revisión de AC — autoriza **En curso** (la escribe el revisor al final de Preparado)

| Fecha | Revisor | Actuación | AC revisados       | Evidencia consultada | Hallazgo | Decisión |
| ----- | ------- | ---------- | ------------------ | -------------------- | -------- | --------- |
| 2026-09-15 | Oscar Vega | aporte | OBJ, SPEC, REQ, AC | trazabilidad/ISS-01.md | Criterios verificables; alcance limitado a NestJS base, sin BD ni Auth. | AC aprobados — puede En curso |

Decisión posible: `AC aprobados — puede En curso` · `Ajustar AC` (indicar cuál y por qué).

---

## 3. IA usada — se diligencia en **En curso**, después de enviar el prompt

**Herramienta / modelo:** Cursor  
**Fecha:** 2026-09-15  

**Prompt enviado:**

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-01, no del backend entero.

Implementa los AC de trazabilidad/ISS-01.md siguiendo docs/Prompt.md (Clean Architecture, solo Business).

Contexto del directorio: ya tiene .git/, docs/ y trazabilidad/. NO los borres ni los modifiques.
Genera el proyecto NestJS con npm en un directorio temporal
(nest new backend-nest-ia --skip-git --package-manager npm) y mueve su contenido a la raíz del workspace,
fusionando .gitignore (debe incluir node_modules/, dist/, .env).

Crea el árbol src/config, src/common, src/infrastructure/database, src/features/business (con business.module.ts stub).
En main.ts: setGlobalPrefix('api'), enableCors({ origin: 'http://localhost:4200', credentials: true }), ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
listen(process.env.PORT ?? 3002). Endpoint GET /api/health → 200 { "status": "ok" }.
Crea scripts/free-port.js y los scripts npm free:port y start:dev (free:port && nest start --watch).

Prohibido: Sequelize, base de datos, .env de BD, Auth, Users, JWT Token, login. NO adelantes ISS-02.

Al final entrega tres listas: archivos tocados; cómo verifico cada AC (comandos exactos); qué quedó fuera de alcance.
```

**Ajustes o correcciones que hiciste a lo generado:** Se generó NestJS en un directorio temporal y se trasladó al workspace. Se desactivó la observabilidad automática. Se instalaron `class-validator` y `class-transformer`; se corrigieron saltos CRLF en `scripts/free-port.js`; se añadieron `.gitkeep` para conservar carpetas vacías.

---

## 4. EVI — se diligencia en **Verificación** (después de ejecutar tú mismo)

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|---|---|---|---|---|
| 2026-09-15 | log de arranque | AC-2 | `evidencias/07-servidor-nestjs-iniciado.png` | `npm run start:dev` |
| 2026-09-15 | respuesta HTTP | AC-3 | `evidencias/08-endpoint-health-200.png` | `curl -i http://localhost:3002/api/health` |
| 2026-09-15 | árbol de carpetas | AC-1, AC-4 | Salida de `find src -type d \| sort`; `evidencias/06-estructura-clean-architecture.png` | `find src -type d \| sort` y `test ! -d src/features/auth && echo "OK: no existe src/features/auth"` |

**Commit (hash):** `959a4c4` — `feat(iss-01): esqueleto NestJS CA arrancable` · `Refs #1` · `git push` realizado.

**Autoevaluación de AC:** AC-1: sí · AC-2: sí · AC-3: sí · AC-4: sí.

---

## 5. Revisión humana

| Fecha | Revisor | Tipo | Alcance revisado | Evidencia revisada | Observaciones | Decisión |
|---|---|---|---|---|---|---|
| 2026-09-15 | Oscar Vega | revisión conforme | ISS-01: esqueleto NestJS CA | `Informe_Evidencias.md`, endpoint `GET /api/health`, commit `959a4c4` | La API inicia sin errores; `/api/health` responde 200 con `{"status":"ok"}`; CORS, ValidationPipe, puerto 3002 y estructura CA base fueron comprobados. No se implementó Auth ni base de datos. | Aprobado para Gate |

**Respuesta del autor (ajuste o justificación):**

No aplica ajustes. La evidencia confirma que el esqueleto cumple el alcance de ISS-01 y no avanza a autenticación ni persistencia.

---

## 6. Gate

| Fecha | Revisor | Decisión | Justificación |
|---|---|---|---|
| 2026-09-15 | Oscar Vega | aprobado | Se cumplen los criterios de ISS-01 y la evidencia es reproducible. |
