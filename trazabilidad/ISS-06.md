clear

> **Workspace:** `backend-nest-ia` · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-06 — Sales y stock

**Naturaleza:** práctico (desarrollo de software backend)
**Issue GitHub:** `dw-2026-Futbol-Total #7`**Responsable (desarrollador):** Oscar Vega**Revisor humano:** Oscar Vega**Dependencias:** ISS-05 en **Hecho** (Sales necesita Clients y Products)
**Commit esperado:** `feat(iss-06): feature sales CA` con `Refs #7`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.
> **Gate estricto:** aquí se juega la regla de negocio central (transacción y stock).

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, cualquier consumidor HTTP podrá registrar una venta de uno o más productos a un cliente, que descuente el stock de cada producto y deje traza en `ProductSale`, de forma **atómica** (todo o nada), para reflejar inventario real.

**SPEC (qué debe quedar):**

- Feature `src/features/business/sales/` (un solo agregado: `Sale` + `ProductSale`).
- **Dominio:** entidades puras `Sale` (`id`, `saleDate`, `subtotal`, `tax`, `discounts`, `total`, `status`, `clientId`, `items: ProductSale[]`) y `ProductSale` (`id`, `saleId`, `productId`, `quantity`, `unitPrice`, `total`); servicio `SaleCalculator` (subtotal = Σ `quantity × unitPrice`; `total = subtotal + tax − discounts`); `ISaleRepository`; excepciones `SaleNotFoundException`, `EmptySaleException`. Reutiliza `InsufficientStockException` de Products.
- **Aplicación:** `CreateSaleDto` (`clientId` requerido; `items[]` con `@ArrayMinSize(1)` y `@ValidateNested` de `{ productId, quantity > 0, unitPrice? > 0 }` — si `unitPrice` no viene se usa el precio actual del producto; `tax`, `discounts` opcionales ≥ 0); use-cases `CreateSale`, `GetSaleById`.
- **`CreateSale`** (el corazón del issue): verifica cliente (`IClientRepository` → 404), carga productos (`IProductRepository` → 404), llama `product.reduceStock(qty)` en la **entidad** para **todos** los ítems antes de escribir nada (→ 409 si alguno no alcanza), calcula totales, y persiste **Sale + ProductSale + actualización de `products.quantity` dentro de una sola transacción Sequelize** (`sequelize.transaction(async t => …)`, con `lock: t.LOCK.UPDATE` sobre cada producto y re-verificación del stock bajo bloqueo); cualquier error hace rollback.
- **Infraestructura:** `SaleModel` (`sales`), `ProductSaleModel` (`product_sales`) en `ALL_MODELS`; `SaleRepository` (Sequelize) que recibe la transacción.
- **Presentación:** `POST /api/sales`, `GET /api/sales/:id` (incluye ítems).

**REQ (restricciones):**

- La baja de stock se decide en el **dominio** (`Product.reduceStock`) y se ejecuta en el **use-case** dentro de **transacción obligatoria** (no «preferible»).
- Códigos HTTP según `docs/Prompt.md` §5: cliente/producto inexistente → `404`; stock insuficiente → `409`; ítems vacíos → `400`.
- Sin JWT Token, login ni Auth. **No inventes login** para «saber quién vende». No adelantar ISS-07.

**AC (Dado → Cuando → Entonces; deciden el Gate):**

- [X] **AC-1** Dado un producto con `quantity = 5` y un cliente existente; cuando `POST /api/sales` con `items: [{ productId, quantity: 2 }]`; entonces responde `201`, `GET /api/products/:id` muestra `quantity = 3`, existe 1 fila en `sales` y 1 en `product_sales` con `total = 2 × unitPrice`.
- [X] **AC-2** Dado un producto con `quantity = 3`; cuando `POST /api/sales` con `quantity: 10`; entonces responde `409`, **no** hay fila nueva en `sales` ni en `product_sales`, y `quantity` sigue en `3`.
- [X] **AC-3** (atomicidad) Dado dos productos A (`quantity = 5`) y B (`quantity = 1`); cuando `POST /api/sales` con `[ {A, 2}, {B, 5} ]`; entonces responde `409` y **A sigue en 5** (el primer ítem no se descontó porque la transacción hizo rollback).
- [X] **AC-4** Dado `clientId` inexistente o `items: []`; cuando `POST /api/sales`; entonces responde `404` o `400` respectivamente y no crea filas.
- [X] **AC-5** Dado la venta de AC-1; cuando `GET /api/sales/:id`; entonces responde `200` y en `data` vienen `clientId`, `total` y el arreglo `items` con `productId`, `quantity`, `unitPrice` (igual al precio del producto si no se envió).
- [X] **AC-6** Dado `domain/entities/sale.entity.ts` y `product-sale.entity.ts`; cuando se inspeccionan; entonces son TypeScript puro.

**Checklist interno (IA, En curso):**

- [X] Entidades `Sale`, `ProductSale`; `SaleCalculator`; excepciones
- [X] DTO anidado (`items[]`) con `@ValidateNested`
- [X] `CreateSale` con transacción y rollback
- [X] Models + repositorio con soporte de transacción + `ALL_MODELS`
- [X] Controller + Swagger; módulo en `BusinessModule`

---

## 2. Revisión de AC — autoriza **En curso** (la escribe el revisor al final de Preparado)

| Fecha      | Revisor    | Actuación | AC revisados       | Evidencia consultada   | Hallazgo                                                                                                                                                    | Decisión                      |
| ---------- | ---------- | ---------- | ------------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 2026-09-15 | Oscar Vega | aporte     | OBJ, SPEC, REQ, AC | trazabilidad/ISS-06.md | Se definió Sales como la feature que integra Clients y Products; debe crear la venta y descontar stock de forma consistente, sin Auth ni adelantar ISS-07. | AC aprobados — puede En curso |

Decisión posible: `AC aprobados — puede En curso` · `Ajustar AC` (indicar cuál y por qué).

---

## 3. IA usada — se diligencia en **En curso**, después de enviar el prompt

**Herramienta / modelo:** Cursor
**Fecha:** 2026-09-15
**Prompt enviado** (copiado **tal cual** de la ficha ISS-06 del Guion, sección «Prompt por issue»):

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-06, no del backend entero.

Implementa los AC de trazabilidad/ISS-06.md siguiendo docs/Prompt.md. Sales + ProductSale es UN solo agregado.

Dominio: entidades PURAS Sale (id, saleDate, subtotal, tax, discounts, total, status, clientId, items) y
ProductSale (id, saleId, productId, quantity, unitPrice, total); servicio SaleCalculator
(subtotal = Σ quantity × unitPrice; total = subtotal + tax − discounts); ISaleRepository; SaleNotFoundException, EmptySaleException.
Reutiliza Product.reduceStock e InsufficientStockException de products.
Aplicación: CreateSaleDto (clientId requerido; items[] con @ArrayMinSize(1) y @ValidateNested de { productId, quantity > 0,
unitPrice? > 0 }; si unitPrice no viene se usa el precio actual del producto; tax, discounts ≥ 0 opcionales).
Use-case CreateSale: verifica cliente (IClientRepository → 404), carga productos (IProductRepository → 404),
llama product.reduceStock(qty) para TODOS los ítems antes de escribir nada (→ 409), calcula totales y persiste
Sale + ProductSale + products.quantity DENTRO DE UNA SOLA transacción Sequelize (sequelize.transaction(async t => ...),
con lock: t.LOCK.UPDATE por producto y re-verificación del stock bajo bloqueo); cualquier error → rollback.
Infraestructura: SaleModel (sales) y ProductSaleModel (product_sales) en ALL_MODELS; SaleRepository (Sequelize) que abre la transacción.
Presentación: POST /api/sales (201), GET /api/sales/:id (200 con items). Errores: 400 items vacíos; 404 cliente/producto; 409 stock.

Prohibido: Auth, Users, JWT Token, login, userId «para saber quién vende»; entidad que extienda Model; force: true.
NO adelantes ISS-07. NO toques docs/ ni trazabilidad/.

Al final entrega tres listas: archivos tocados; cómo verifico cada AC (incluye el caso de dos ítems con rollback); qué quedó fuera de alcance.
```

**Ajustes o correcciones que hiciste a lo generado:** No se requirieron correcciones funcionales posteriores. Se verificaron manualmente el build, las rutas, la venta válida, el stock insuficiente, el rollback multiítem, las validaciones HTTP, la consulta de venta, la pureza del dominio y la transacción con bloqueo.

---

## 4. EVI — se diligencia en **Verificación** (después de ejecutar tú mismo)

| Fecha      | Tipo                                 | AC que demuestra | Enlace o ruta                                                                 | Cómo reproducir                                                                                |
| ---------- | ------------------------------------ | ---------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 2026-09-15 | POST 201, GET producto y conteos SQL | AC-1             | Evidencia 40; venta`id: 3`, producto 2 pasó de 5 a 3; conteos 2 → 3       | POST válido con`clientId: 1`, `productId: 2`, `quantity: 2`; consultar producto y tablas |
| 2026-09-15 | POST 409, GET producto y conteos SQL | AC-2             | Evidencia 40; cantidad 10 rechazada; stock 3 y conteos 3 sin cambios          | POST con producto 2 y`quantity: 10`                                                           |
| 2026-09-15 | POST 409 y conteos SQL               | AC-3             | Evidencia 41; A quedó en 5, B en 1 y tablas permanecieron en 3               | POST con A cantidad 2 y B cantidad 5                                                            |
| 2026-09-15 | POST 404 y 400; conteos SQL          | AC-4             | Evidencia 42; cliente inexistente e ítems vacíos no crearon filas           | POST con`clientId: 999999`; POST con `"items":[]`                                           |
| 2026-09-15 | GET 200 con detalle                  | AC-5             | Evidencia 42;`GET /api/sales/3` incluye `clientId`, `total` e `items` | `curl -i http://localhost:3002/api/sales/3`                                                   |
| 2026-09-15 | Inspección de código               | AC-6             | Evidencia 43; entidades puras, transacción,`LOCK.UPDATE` y `reduceStock` | Ejecutar los`grep` sobre entidades y `create-sale.use-case.ts`                              |

**Commit (hash):** pendiente — `feat(iss-06): feature sales CA` · `Refs #7` · hecho `git push`
**Autoevaluación de AC:** AC-1: sí; AC-2: sí; AC-3: sí; AC-4: sí; AC-5: sí; AC-6: sí

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

Preguntas guía (**estrictas**): «¿En qué use-case baja el stock? Muéstrame la línea». «¿Dónde empieza y termina la transacción? ¿Qué pasa si falla el segundo ítem?». «¿Por qué `reduceStock` está en la entidad y no en el controller?». Si el desarrollador no puede señalar la transacción → **devolución**.

| Fecha | Revisor | Actuación (aporte · revisión conforme · devolución) | AC revisados | Evidencia consultada | Hallazgo | Decisión |
| ----- | ------- | -------------------------------------------------------- | ------------ | -------------------- | -------- | --------- |
| 2026-09-15 | Oscar Vega | revisión conforme | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6 | Evidencias 39 a 44; build exitoso; HTTP 201, 409, 404, 400 y 200; conteos SQL | CreateSaleUseCase inicia una transacción, bloquea productos con `LOCK.UPDATE`, revalida stock y llama `Product.reduceStock` antes de persistir. Ante el fallo del segundo ítem, no se descontó el primero ni se crearon Sale/ProductSale. El dominio permanece puro. | aprobado |

**Respuesta del autor (ajuste o justificación):**

La baja de stock vive en Product.reduceStock porque es una regla de negocio de la entidad. CreateSaleUseCase orquesta la operación: abre la transacción, obtiene los productos bajo bloqueo, revalida disponibilidad y persiste la venta, sus detalles y las cantidades actualizadas usando la misma transacción. Si cualquier paso falla, Sequelize hace rollback y evita persistencia parcial.

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** aprobado

**Conclusión:** ISS-06 cumple los seis criterios de aceptación. La venta se crea con sus detalles y totales, descuenta stock mediante la regla de dominio y mantiene atomicidad: un error de stock, cliente o validación no deja ventas, detalles ni descuentos parciales. Las entidades Sale y ProductSale permanecen desacopladas de NestJS y Sequelize.

**Trazabilidad final:** `430f788 feat(iss-06): feature sales CA` con `Refs #7` · Issue: `dw-2026-Futbol-Total #7`.
