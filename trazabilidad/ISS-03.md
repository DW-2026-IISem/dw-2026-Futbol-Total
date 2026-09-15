> **Workspace:** `backend-nest-ia` · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-03 — Feature clients CA

**Naturaleza:** práctico (desarrollo de software backend)
**Issue GitHub:** `dw-2026-Futbol-Total #4`
**Responsable (desarrollador):** Oscar Vega
**Revisor humano:** Oscar Vega
**Dependencias:** ISS-02 en **Hecho**
**Commit esperado:** `feat(iss-03): feature clients CA` con `Refs #4`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.
> Este es el issue **lento**: aquí se aprende el patrón de una feature completa. Los tres siguientes lo repiten.

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, cualquier consumidor HTTP podrá registrar y consultar clientes persistidos en `Pedalibre`, con validación de entrada, para contar con la primera feature completa que sirve de patrón a las siguientes.

**SPEC (qué debe quedar):**
- Feature `src/features/business/clients/` con las cuatro capas de `docs/Prompt.md` §2.
- **Dominio:** entidad `Client` pura con los campos de `docs/Prompt.md` §4 (`id`, `name`, `address?`, `phone?`, `email?`, `status`); interfaz `IClientRepository`; excepciones `ClientNotFoundException`, `ClientEmailAlreadyExistsException`.
- **Aplicación:** `CreateClientDto` (`name` requerido; `email` opcional con formato; `phone`, `address` opcionales), mapper, use-cases `CreateClient`, `ListClients`, `GetClientById`.
- **Infraestructura:** `ClientModel` (tabla `clients`) registrado en `ALL_MODELS`; `ClientRepository` (Sequelize); seeder idempotente (`findOrCreate` por `email`) que deja al menos 1 cliente.
- **Presentación:** `ClientsController` con `GET /api/clients`, `GET /api/clients/:id`, `POST /api/clients`; Swagger (en este issue solo decoradores en el controller; el arranque de `SwaggerModule` en `main.ts` y la ruta `/api/docs` se materializan en ISS-07).
- `ClientsModule` registrado en `BusinessModule`.

**REQ (restricciones):**
- La entidad de dominio **no** extiende `Model` ni importa `sequelize`/`sequelize-typescript`/`@nestjs/*`.
- Códigos HTTP según `docs/Prompt.md` §5.
- Sin JWT Token, Auth ni guards. No adelantar ISS-04 (ProductTypes).

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [ ] **AC-1** Dado la app arrancada y la tabla `clients` vacía; cuando corre el seeder al arrancar; entonces `GET /api/clients` responde `200` con al menos 1 cliente en `data.items` (`data.meta.total` ≥ 1), y **arrancar de nuevo no duplica** filas (mismo conteo) en la base `Pedalibre`.
- [ ] **AC-2** Dado un payload válido `{ "name": "...", "email": "...", "phone": "...", "address": "..." }`; cuando `POST /api/clients`; entonces responde `201` con el cliente creado en `data` (con `id`) y la fila existe en la tabla `clients`.
- [ ] **AC-3** Dado un payload sin `name` (o con un campo no permitido); cuando `POST /api/clients`; entonces responde `400` y el conteo de filas **no cambia**.
- [ ] **AC-4** Dado un `email` ya registrado; cuando `POST /api/clients` con ese email; entonces responde `409` y no crea fila.
- [ ] **AC-5** Dado un `id` inexistente; cuando `GET /api/clients/999999`; entonces responde `404`.
- [ ] **AC-6** Dado `domain/entities/client.entity.ts`; cuando se inspecciona; entonces es TypeScript puro: sin decoradores de Sequelize, sin `extends Model`, sin imports de NestJS.

**Checklist interno (IA, En curso):**
- [ ] Entidad, interface, excepciones (domain)
- [ ] DTO, mapper, use-cases (application)
- [ ] Model, repositorio, seeder (infrastructure) + `ALL_MODELS`
- [ ] Controller + Swagger (presentation)
- [ ] Módulo registrado en `BusinessModule`

---

## 2. Revisión de AC — autoriza **En curso** (la escribe el revisor al final de Preparado)

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-09-15 | Oscar Vega | aporte | OBJ, SPEC, REQ, AC | trazabilidad/ISS-03.md | Se definió la primera feature completa con las capas CA, seeder idempotente y seis criterios verificables; sin Auth ni ProductTypes. | AC aprobados — puede En curso |

Decisión posible: `AC aprobados — puede En curso` · `Ajustar AC` (indicar cuál y por qué).

---

## 3. IA usada — se diligencia en **En curso**, después de enviar el prompt

**Herramienta / modelo:** Cursor
**Fecha:** 2026-09-15
**Prompt enviado** (copiado **tal cual** de la ficha ISS-03 del Guion, sección «Prompt por issue»):

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-03, no del backend entero.

Implementa los AC de trazabilidad/ISS-03.md siguiendo docs/Prompt.md (arquitectura §2, campos §4, HTTP §5).

Feature src/features/business/clients con las cuatro capas. Entidad Client PURA (sin Sequelize ni NestJS).
IClientRepository en domain/interfaces; ClientRepository (Sequelize) y ClientModel (tabla clients) en infrastructure;
registra ClientModel en ALL_MODELS. Use-cases CreateClient, ListClients, GetClientById.
CreateClientDto: name requerido; email opcional con formato; phone y address opcionales.
Controller: GET /api/clients, GET /api/clients/:id, POST /api/clients. Swagger.
Errores: DTO inválido → 400 (ValidationPipe); id inexistente → 404; email duplicado → 409 (excepción de dominio mapeada por el filtro).
Seeder idempotente (findOrCreate por email) con al menos un cliente, ejecutado al arrancar. ClientsModule en BusinessModule.

Prohibido: Auth, Users, JWT Token, guards; entidad que extienda Model; force: true. NO adelantes ISS-04 (ProductTypes).
NO toques docs/ ni trazabilidad/.

Al final entrega tres listas: archivos tocados; cómo verifico cada AC (comandos curl exactos y SQL de conteo); qué quedó fuera de alcance.
```

**Ajustes o correcciones que hiciste a lo generado:** Se corrigió `client.model.ts` de `timestamps: false` a `timestamps: true`, porque la tabla existente exige `createdAt` y `updatedAt`. También se instaló `@nestjs/swagger@^12.0.1`, compatible con NestJS 12; la versión 11 generaba un conflicto de dependencias.

---

## 4. EVI — se diligencia en **Verificación** (después de ejecutar tú mismo)

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
| 2026-09-15 | arranque, conteo SQL y GET 200 | AC-1 | Evidencias 20 y 21; conteo `8` antes/después del reinicio | `npm run start:dev` y `SELECT COUNT(*) AS total_clients FROM clients;` |
| 2026-09-15 | respuesta HTTP 201 | AC-2 | POST válido creó `Ana ISS03` con `id: 8` | POST válido a `/api/clients` con nombre, email, teléfono y dirección |
| 2026-09-15 | respuestas HTTP 400 y listado | AC-3 | POST sin `name` y con campo no permitido devolvieron 400; listado conservó total `8` | Ejecutar ambos POST inválidos y `GET /api/clients` |
| 2026-09-15 | respuesta HTTP 409 | AC-4 | Email `ana.iss03@pedalibre.test` repetido devolvió 409 | Repetir POST con el mismo email |
| 2026-09-15 | respuesta HTTP 404 | AC-5 | `GET /api/clients/999999` devolvió 404 | `curl -i http://localhost:3002/api/clients/999999` |
| 2026-09-15 | inspección de código | AC-6 | Evidencia 20: entidad sin dependencias de framework u ORM | Buscar `sequelize`, `sequelize-typescript`, `@nestjs` y `extends Model` en la entidad; sin resultados |

**Commit (hash):** pendiente — `feat(iss-03): feature clients CA` · `Refs #4` · hecho `git push`
**Autoevaluación de AC:** AC-1: sí; AC-2: sí; AC-3: sí; AC-4: sí; AC-5: sí; AC-6: sí

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

Revisión **estricta** (es el patrón): el desarrollador debe **señalar y explicar** entidad, interfaz, model, use-case y controller, y decir por qué el use-case recibe `IClientRepository` y no `ClientRepository` (Sequelize). Si no puede explicarlo → **devolución**.

| Fecha | Revisor | Actuación (aporte · revisión conforme · devolución) | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------------------------------------------------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** pendiente (`aprobado` · `aprobado con observación` · `devuelto` · `cancelado`)
**Conclusión:**
**Trazabilidad final:** (hash del commit definitivo + enlace al Issue)
