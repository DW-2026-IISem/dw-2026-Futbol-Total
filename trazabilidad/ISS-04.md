> **Workspace:** `backend-nest-ia` · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-04 — Feature product-types CA

**Naturaleza:** práctico (desarrollo de software backend)
**Issue GitHub:** `dw-2026-Futbol-Total #5`
**Responsable (desarrollador):** Oscar Vega
**Revisor humano:** Oscar Vega
**Dependencias:** ISS-03 en **Hecho**
**Commit esperado:** `feat(iss-04): feature product-types CA` con `Refs #5`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, cualquier consumidor HTTP podrá registrar y consultar tipos de producto persistidos, con validación, para clasificar los productos del issue siguiente.

**SPEC (qué debe quedar):**
- Feature `src/features/business/product-types/` con el **mismo patrón** de Clients (ISS-03).
- **Dominio:** entidad `ProductType` pura (`id`, `name` requerido y único, `description?`, `status`); `IProductTypeRepository`; excepciones `ProductTypeNotFoundException`, `ProductTypeNameAlreadyExistsException`.
- **Aplicación:** `CreateProductTypeDto`, mapper, use-cases `CreateProductType`, `ListProductTypes`, `GetProductTypeById`.
- **Infraestructura:** `ProductTypeModel` (tabla `product_types`) en `ALL_MODELS`; repositorio; seeder idempotente (`findOrCreate` por `name`) con al menos 1 tipo.
- **Presentación:** `GET /api/product-types`, `GET /api/product-types/:id`, `POST /api/product-types`; Swagger.
- Módulo registrado en `BusinessModule`.

**REQ (restricciones):**
- Entidad de dominio sin `Model` ni imports de Sequelize/NestJS.
- Códigos HTTP según `docs/Prompt.md` §5.
- Sin JWT Token ni Auth. No adelantar ISS-05 (Products).

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [x] **AC-1** Dado la app arrancada y `product_types` vacía; cuando corre el seeder; entonces `GET /api/product-types` responde `200` con al menos 1 tipo y arrancar de nuevo no duplica filas.
- [x] **AC-2** Dado un payload válido `{ "name": "...", "description": "..." }`; cuando `POST /api/product-types`; entonces responde `201` con el tipo creado y la fila existe en `product_types`.
- [x] **AC-3** Dado un payload sin `name`; cuando `POST /api/product-types`; entonces responde `400` y el conteo no cambia.
- [x] **AC-4** Dado un `name` ya registrado; cuando `POST /api/product-types` con ese nombre; entonces responde `409` y no crea fila.
- [x] **AC-5** Dado `domain/entities/product-type.entity.ts`; cuando se inspecciona; entonces es TypeScript puro.

**Checklist interno (IA, En curso):**
- [x] Entidad, interface, excepciones
- [x] DTO, mapper, use-cases
- [x] Model, repositorio, seeder + `ALL_MODELS`
- [x] Controller + Swagger
- [x] Módulo en `BusinessModule`

---

## 2. Revisión de AC — autoriza **En curso** (la escribe el revisor al final de Preparado)

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-09-15 | Oscar Vega | aporte | OBJ, SPEC, REQ, AC | trazabilidad/ISS-04.md | Se definió ProductTypes replicando el patrón validado de Clients, con nombre único, seeder idempotente y cinco criterios verificables; sin Products ni Auth. | AC aprobados — puede En curso |

Decisión posible: `AC aprobados — puede En curso` · `Ajustar AC` (indicar cuál y por qué).

---

## 3. IA usada — se diligencia en **En curso**, después de enviar el prompt

**Herramienta / modelo:** Cursor
**Fecha:** 2026-09-15
**Prompt enviado** (copiado **tal cual** de la ficha ISS-04 del Guion, sección «Prompt por issue»):

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-04, no del backend entero.

Implementa los AC de trazabilidad/ISS-04.md siguiendo docs/Prompt.md y el MISMO patrón de src/features/business/clients.

Feature src/features/business/product-types: entidad ProductType PURA (id, name requerido y único, description?, status);
IProductTypeRepository; ProductTypeModel (tabla product_types) en ALL_MODELS; use-cases CreateProductType, ListProductTypes,
GetProductTypeById; CreateProductTypeDto; controller GET /api/product-types, GET /api/product-types/:id, POST /api/product-types; Swagger.
Errores: 400 DTO inválido; 404 id inexistente; 409 name duplicado.
Seeder idempotente (findOrCreate por name) con al menos un tipo. Módulo en BusinessModule.

Prohibido: Auth, Users, JWT Token, guards; entidad que extienda Model; force: true. NO adelantes ISS-05 (Products).
NO toques docs/ ni trazabilidad/.

Al final entrega tres listas: archivos tocados; cómo verifico cada AC; qué quedó fuera de alcance.
```

**Ajustes o correcciones que hiciste a lo generado:** No se requirieron correcciones funcionales posteriores. Se validó el build, el arranque y las rutas antes de ejecutar los criterios de aceptación.

---

## 4. EVI — se diligencia en **Verificación** (después de ejecutar tú mismo)

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
| 2026-09-15 | arranque, conteos y GET 200 | AC-1 | Evidencias 27 y 28; conteo `2` antes/después del reinicio | `npm run start:dev`, `GET /api/product-types` y `SELECT COUNT(*) AS total_product_types FROM product_types;` |
| 2026-09-15 | respuesta HTTP 201 | AC-2 | POST creó `Bebidas Premium ISS04` con `id: 2` | POST válido a `/api/product-types` con `name` y `description` |
| 2026-09-15 | respuesta HTTP 400 y listado | AC-3 | POST sin `name` devolvió 400; listado final conservó total `2` | POST sin nombre y `GET /api/product-types` |
| 2026-09-15 | respuesta HTTP 409 | AC-4 | Nombre `Bebidas Premium ISS04` repetido devolvió 409 | Repetir POST con el mismo nombre |
| 2026-09-15 | inspección de código | AC-5 | Evidencia 28: entidad sin dependencias de framework u ORM | Buscar `sequelize`, `sequelize-typescript`, `@nestjs` y `extends Model`; sin resultados |

**Commit (hash):** pendiente — `feat(iss-04): feature product-types CA` · `Refs #5` · hecho `git push`
**Autoevaluación de AC:** AC-1: sí · AC-2: sí · AC-3: sí · AC-4: sí · AC-5: sí

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

Pregunta guía: «¿Qué copiaste de Clients y qué tuviste que cambiar? ¿Dónde está la regla de nombre único: en el dominio, en el use-case o en la BD?»

| Fecha | Revisor | Actuación (aporte · revisión conforme · devolución) | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------------------------------------------------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** pendiente (`aprobado` · `aprobado con observación` · `devuelto` · `cancelado`)
**Conclusión:**
**Trazabilidad final:** (hash del commit definitivo + enlace al Issue)
