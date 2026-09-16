> **Workspace:** `backend-nest-ia` · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-06 — Sales y stock

**Naturaleza:** práctico (desarrollo de software backend)
**Issue GitHub:** `backend-nest-ia #__` (número que asigna GitHub al crear el Issue; anótalo aquí y en el cuerpo del Issue)
**Responsable (desarrollador):**
**Revisor humano:**
**Dependencias:** ISS-05 en **Hecho** (Sales necesita Clients y Products)
**Commit esperado:** `feat(iss-06): sales y stock` con `Refs #__`

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
- [ ] **AC-1** Dado un producto con `quantity = 5` y un cliente existente; cuando `POST /api/sales` con `items: [{ productId, quantity: 2 }]`; entonces responde `201`, `GET /api/products/:id` muestra `quantity = 3`, existe 1 fila en `sales` y 1 en `product_sales` con `total = 2 × unitPrice`.
- [ ] **AC-2** Dado un producto con `quantity = 3`; cuando `POST /api/sales` con `quantity: 10`; entonces responde `409`, **no** hay fila nueva en `sales` ni en `product_sales`, y `quantity` sigue en `3`.
- [ ] **AC-3** (atomicidad) Dado dos productos A (`quantity = 5`) y B (`quantity = 1`); cuando `POST /api/sales` con `[ {A, 2}, {B, 5} ]`; entonces responde `409` y **A sigue en 5** (el primer ítem no se descontó porque la transacción hizo rollback).
- [ ] **AC-4** Dado `clientId` inexistente o `items: []`; cuando `POST /api/sales`; entonces responde `404` o `400` respectivamente y no crea filas.
- [ ] **AC-5** Dado la venta de AC-1; cuando `GET /api/sales/:id`; entonces responde `200` y en `data` vienen `clientId`, `total` y el arreglo `items` con `productId`, `quantity`, `unitPrice` (igual al precio del producto si no se envió).
- [ ] **AC-6** Dado `domain/entities/sale.entity.ts` y `product-sale.entity.ts`; cuando se inspeccionan; entonces son TypeScript puro.

**Checklist interno (IA, En curso):**
- [ ] Entidades `Sale`, `ProductSale`; `SaleCalculator`; excepciones
- [ ] DTO anidado (`items[]`) con `@ValidateNested`
- [ ] `CreateSale` con transacción y rollback
- [ ] Models + repositorio con soporte de transacción + `ALL_MODELS`
- [ ] Controller + Swagger; módulo en `BusinessModule`

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
**Prompt enviado** (copiado **tal cual** de la ficha ISS-06 del Guion, sección «Prompt por issue»):

```text
(pendiente — pegar aquí el prompt exacto)
```

**Ajustes o correcciones que hiciste a lo generado:** (pendiente)

---

## 4. EVI — se diligencia en **Verificación** (después de ejecutar tú mismo)

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | HTTP 201 + GET producto | AC-1 | | `curl -i -X POST localhost:3002/api/sales -H 'Content-Type: application/json' -d '{"clientId":1,"items":[{"productId":1,"quantity":2}]}'` y luego `curl localhost:3002/api/products/1` |
|       | HTTP 409 + conteos | AC-2 | | mismo POST con `"quantity": 10`; `SELECT COUNT(*) FROM sales; SELECT quantity FROM products WHERE id=1;` |
|       | HTTP 409 + A intacto | AC-3 | | POST con dos ítems; `SELECT quantity FROM products WHERE id IN (A,B)` |
|       | HTTP 404 / 400 | AC-4 | | POST con `"clientId": 999999`; POST con `"items": []` |
|       | HTTP 200 con items | AC-5 | | `curl localhost:3002/api/sales/1` |
|       | archivos fuente | AC-6 | rutas de las entidades | `rg -n "sequelize|@nestjs|extends Model" <rutas>` → sin resultados |

**Commit (hash):** pendiente — `feat(iss-06): sales y stock` · `Refs #__` · hecho `git push`
**Autoevaluación de AC:** pendiente (AC-1 … AC-6: sí/no)

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

Preguntas guía (**estrictas**): «¿En qué use-case baja el stock? Muéstrame la línea». «¿Dónde empieza y termina la transacción? ¿Qué pasa si falla el segundo ítem?». «¿Por qué `reduceStock` está en la entidad y no en el controller?». Si el desarrollador no puede señalar la transacción → **devolución**.

| Fecha | Revisor | Actuación (aporte · revisión conforme · devolución) | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------------------------------------------------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** pendiente (`aprobado` · `aprobado con observación` · `devuelto` · `cancelado`)
**Conclusión:**
**Trazabilidad final:** (hash del commit definitivo + enlace al Issue)
