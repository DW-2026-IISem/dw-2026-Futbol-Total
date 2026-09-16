> **Workspace:** `backend-nest-ia` · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-05 — Feature products CA

**Naturaleza:** práctico (desarrollo de software backend)
**Issue GitHub:** `dw-2026-Futbol-Total #6`
**Responsable (desarrollador):** Oscar Vega
**Revisor humano:** Oscar Vega
**Dependencias:** ISS-04 en **Hecho** (Products necesita ProductTypes)
**Commit esperado:** `feat(iss-05): feature products CA` con `Refs #6`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, cualquier consumidor HTTP podrá registrar y consultar productos persistidos, ligados a un tipo de producto existente y con su stock (`quantity`), para que el issue de ventas pueda descontarlo.

**SPEC (qué debe quedar):**

- Feature `src/features/business/products/` con el patrón de Clients.
- **Dominio:** entidad `Product` pura (`id`, `name`, `brand`, `price`, `minStock`, `quantity`, `productTypeId`, `status`) con método `reduceStock(n)` que lanza `InsufficientStockException` si `quantity − n < 0` (se **usa** en ISS-06, pero la regla **vive** aquí, en la entidad); `IProductRepository`; excepciones `ProductNotFoundException` (404) y `ProductTypeInactiveException` (409; tipo existente pero inactivo).
- **Aplicación:** `CreateProductDto` (`name` requerido; `price` > 0; `quantity` ≥ 0 y `minStock` ≥ 0, por defecto 0; `productTypeId` requerido), mapper, use-cases `CreateProduct` (verifica que el `productTypeId` exista **y esté activo** a través de `IProductTypeRepository` —rechaza inexistente o inactivo—, no del model), `ListProducts`, `GetProductById`.
- **Infraestructura:** `ProductModel` (tabla `products`) con `@ForeignKey(() => ProductTypeModel)` y `@BelongsTo`; en `ALL_MODELS`; repositorio; seeder idempotente que crea al menos 1 producto **con un tipo existente** (el seeder consulta el tipo vía `IProductTypeRepository`, no asume orden en memoria; ISS-07 formaliza el orden `clients → product-types → products` para BD vacía).
- **Presentación:** `GET /api/products`, `GET /api/products/:id`, `POST /api/products`; la respuesta incluye `quantity`.

**REQ (restricciones):**

- La **relación** (FK, `BelongsTo`) vive en el **model de infraestructura**; la entidad de dominio solo tiene `productTypeId: number`.
- Códigos HTTP según `docs/Prompt.md` §5: FK inexistente → `404`.
- Sin JWT Token ni Auth. No adelantar ISS-06 (Sales).

**AC (Dado → Cuando → Entonces; deciden el Gate):**

- [x] **AC-1** Dado la app arrancada con al menos un tipo de producto; cuando corre el seeder; entonces `GET /api/products` responde `200` con al menos 1 producto cuyo `productTypeId` existe, y arrancar de nuevo no duplica.
- [x] **AC-2** Dado un payload válido `{ "name": "...", "brand": "...", "price": 10.5, "quantity": 5, "minStock": 1, "productTypeId": <id existente> }`; cuando `POST /api/products`; entonces responde `201` y la fila existe con `quantity = 5`.
- [x] **AC-3** Dado un payload con `productTypeId` inexistente **o inactivo**; cuando `POST /api/products`; entonces responde `404` (inexistente) o `409` (inactivo) y **no** crea fila.
- [x] **AC-4** Dado un payload con `price: 0` (o negativo) o sin `name`; cuando `POST /api/products`; entonces responde `400` y no crea fila.
- [x] **AC-5** Dado `domain/entities/product.entity.ts`; cuando se inspecciona; entonces es TypeScript puro y contiene `reduceStock` con su invariante.

**Checklist interno (IA, En curso):**

- [x] Entidad con `reduceStock`, interface, excepciones
- [x] DTO con validaciones numéricas, mapper, use-cases (`CreateProduct` verifica tipo existente y activo)
- [x] Model con FK/BelongsTo, repositorio, seeder (orden tras ProductTypes) + `ALL_MODELS`
- [x] Controller + Swagger
- [x] Módulo en `BusinessModule` (importa `ProductTypesModule` para el repositorio)

---

## 2. Revisión de AC — autoriza **En curso** (la escribe el revisor al final de Preparado)

| 2026-09-15 | Oscar Vega | aporte | OBJ, SPEC, REQ, AC | trazabilidad/ISS-05.md | Se definió Products con FK en infraestructura, validación de ProductType existente y activo, stock y cinco criterios verificables; sin Sales ni Auth. | AC aprobados — puede En curso |

Decisión posible: `AC aprobados — puede En curso` · `Ajustar AC` (indicar cuál y por qué).

---

## 3. IA usada — se diligencia en **En curso**, después de enviar el prompt

**Herramienta / modelo:** Cursor
**Fecha:** 2026-09-15
**Prompt enviado** (copiado **tal cual** de la ficha ISS-05 del Guion, sección «Prompt por issue»):

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-05, no del backend entero.

Implementa los AC de trazabilidad/ISS-05.md siguiendo docs/Prompt.md y el patrón de clients/product-types.

Feature src/features/business/products: entidad Product PURA (id, name, brand, price, minStock, quantity, productTypeId, status)
con método reduceStock(n) que lanza InsufficientStockException si quantity - n < 0. IProductRepository; ProductNotFoundException, ProductTypeInactiveException (409).
ProductModel (tabla products) con @ForeignKey/@BelongsTo a ProductTypeModel, en ALL_MODELS. La relación vive SOLO en el model.
CreateProductDto: name requerido; price > 0; quantity ≥ 0 y minStock ≥ 0 (default 0); productTypeId requerido.
Use-case CreateProduct verifica que productTypeId exista usando IProductTypeRepository (→ 404 si no existe; → 409 si está inactivo).
ListProducts, GetProductById.
Controller GET /api/products, GET /api/products/:id, POST /api/products (la respuesta incluye quantity). Swagger.
Seeder idempotente que crea al menos un producto con un tipo existente; debe ejecutarse después del seeder de product-types.
ProductsModule importa ProductTypesModule (para el repositorio) y se registra en BusinessModule.

Prohibido: Auth, JWT Token, guards; entidad que extienda Model; force: true. NO adelantes ISS-06 (Sales).
NO toques docs/ ni trazabilidad/.

Al final entrega tres listas: archivos tocados; cómo verifico cada AC; qué quedó fuera de alcance.
```

**Ajustes o correcciones que hiciste a lo generado:** No se requirieron correcciones funcionales posteriores; build, arranque y los cinco AC fueron verificados manualmente.

---

## 4. EVI — se diligencia en **Verificación** (después de ejecutar tú mismo)

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
| ----- | ---- | ---------------- | ------------- | --------------- |
| 2026-09-15 | log + conteo estable `2` | AC-1 | | `npm run start:dev` ×2 + `SELECT COUNT(*) FROM products` → `2`; `GET /api/products` responde `200` |
| 2026-09-15 | HTTP 201 | AC-2 | | `curl -i -X POST localhost:3002/api/products -H 'Content-Type: application/json' -d '{"name":"Agua 600ml","brand":"Cristal","price":2500,"quantity":5,"minStock":1,"productTypeId":1}'` → `201`, con `quantity = 5` |
| 2026-09-15 | HTTP 404 / 409 | AC-3 | | mismo POST con `"productTypeId": 999999` → `404`; y con un tipo inactivo (`UPDATE product_types SET status='inactive' WHERE id=<id>;`) → `409`, sin crear fila |
| 2026-09-15 | dos HTTP 400 + total estable `2` | AC-4 | | mismo POST con `"price": 0` y sin `name` → dos `400`; `SELECT COUNT(*) FROM products` permanece en `2` |
| 2026-09-15 | entidad pura + `reduceStock` | AC-5 | `src/features/business/products/domain/entities/product.entity.ts` | `rg -n "sequelize|@nestjs|extends Model" <ruta>` → sin resultados; `rg -n "reduceStock" <ruta>` → resultado con invariante de stock |

**Commit (hash):** pendiente — `feat(iss-05): feature products CA` · `Refs #__` · hecho `git push`
**Autoevaluación de AC:** pendiente (AC-1 … AC-5: sí/no)

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

Pregunta guía: «¿Dónde vive la relación con ProductType: en el dominio o en el model? ¿Por qué?» «¿Quién comprueba que el tipo existe: el controller, el use-case o la BD?»

| Fecha | Revisor | Actuación (aporte · revisión conforme · devolución) | AC revisados | Evidencia consultada | Hallazgo | Decisión |
| ----- | ------- | -------------------------------------------------------- | ------------ | -------------------- | -------- | --------- |
|       |         |                                                          |              |                      |          |           |

**Respuesta del autor (ajuste o justificación):**

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** pendiente (`aprobado` · `aprobado con observación` · `devuelto` · `cancelado`)
**Conclusión:**
**Trazabilidad final:** (hash del commit definitivo + enlace al Issue)
