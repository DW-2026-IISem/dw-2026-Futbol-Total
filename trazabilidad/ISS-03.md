> **Workspace:** `backend-nest-ia` · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-03 — Feature clients CA

**Naturaleza:** práctico (desarrollo de software backend)  
**Issue GitHub:** `backend-nest-ia #__` (número que asigna GitHub al crear el Issue; anótalo aquí y en el cuerpo del Issue)  
**Responsable (desarrollador):**  
**Revisor humano:**  
**Dependencias:** ISS-02 en **Hecho**  
**Commit esperado:** `feat(iss-03): feature clients CA` con `Refs #__`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.  
> Este es el issue **lento**: aquí se aprende el patrón de una feature completa. Los tres siguientes lo repiten.

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, cualquier consumidor HTTP podrá registrar y consultar clientes persistidos en `tecnogua_ia`, con validación de entrada, para contar con la primera feature completa que sirve de patrón a las siguientes.

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
- [ ] **AC-1** Dado la app arrancada y la tabla `clients` vacía; cuando corre el seeder al arrancar; entonces `GET /api/clients` responde `200` con al menos 1 cliente en `data.items` (`data.meta.total` ≥ 1), y **arrancar de nuevo no duplica** filas (mismo conteo).
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
|       |         |           | OBJ, SPEC, REQ, AC | este archivo   |          | pendiente |

Decisión posible: `AC aprobados — puede En curso` · `Ajustar AC` (indicar cuál y por qué).

---

## 3. IA usada — se diligencia en **En curso**, después de enviar el prompt

**Herramienta / modelo:** (pendiente)  
**Fecha:** (pendiente)  
**Prompt enviado** (copiado **tal cual** de la ficha ISS-03 del Guion, sección «Prompt por issue»):

```text
(pendiente — pegar aquí el prompt exacto)
```

**Ajustes o correcciones que hiciste a lo generado:** (pendiente)

---

## 4. EVI — se diligencia en **Verificación** (después de ejecutar tú mismo)

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | log de arranque + conteo | AC-1 | (log del seeder + `SELECT COUNT(*) FROM clients` antes/después de 2 arranques) | `npm run start:dev` ×2 |
|       | respuesta HTTP 201 | AC-2 | (pegar respuesta) | `curl -i -X POST localhost:3002/api/clients -H 'Content-Type: application/json' -d '{"name":"Ana","email":"ana@demo.com"}'` |
|       | respuesta HTTP 400 | AC-3 | (pegar respuesta + conteo) | `curl -i -X POST localhost:3002/api/clients -H 'Content-Type: application/json' -d '{"email":"x@demo.com"}'` |
|       | respuesta HTTP 409 | AC-4 | (pegar respuesta) | repetir el POST de AC-2 |
|       | respuesta HTTP 404 | AC-5 | (pegar respuesta) | `curl -i localhost:3002/api/clients/999999` |
|       | archivo fuente | AC-6 | `src/features/business/clients/domain/entities/client.entity.ts` | `rg -n "sequelize|@nestjs|extends Model" <ruta>` → sin resultados |

**Commit (hash):** pendiente — `feat(iss-03): feature clients CA` · `Refs #__` · hecho `git push`  
**Autoevaluación de AC:** pendiente (AC-1 … AC-6: sí/no)

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
