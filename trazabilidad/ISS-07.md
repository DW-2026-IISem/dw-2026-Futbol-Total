> **Workspace:** `backend-nest-ia` · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-07 — Integración business y demo

**Naturaleza:** práctico (desarrollo de software backend)  
**Issue GitHub:** `backend-nest-ia #__` (número que asigna GitHub al crear el Issue; anótalo aquí y en el cuerpo del Issue)  
**Responsable (desarrollador):**  
**Revisor humano:**  
**Dependencias:** ISS-01 … ISS-06 en **Hecho** (precondición; el revisor la comprueba en el tablero antes de aprobar los AC)  
**Commit esperado:** `feat(iss-07): integracion business y demo` con `Refs #__`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.  
> **El Gate de ISS-07 = proyecto simple terminado.**

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, el equipo podrá levantar el backend desde cero (BD vacía) y demostrar el recorrido completo cliente → tipo → producto → venta → stock con datos sembrados y coherentes, para entregar un producto reproducible.

**SPEC (qué debe quedar):**
- `src/infrastructure/database/seeders/` con un **orquestador** que ejecuta los seeders Business en orden de dependencias: `clients → product-types → products` (Sales no se siembra; se crea en la demo). Idempotente en conjunto.
- `README.md` del proyecto **reemplazando el boilerplate de Nest**: qué es, requisitos, cómo crear la BD, cómo configurar `.env`, cómo arrancar, endpoints disponibles y **libreto de la demo** (abajo).
- Swagger accesible en `/api/docs` con los cuatro recursos (aquí se arranca `SwaggerModule` en `main.ts`; ISS-03…06 solo aportaron los decoradores).
- Confirmación explícita de ausencia de Auth: no existe `features/auth`, ni `config/jwt`, ni dependencias `@nestjs/jwt`, `passport`, `bcrypt` en `package.json`.

**Libreto de la demo (lo ejecuta el desarrollador en Verificación y lo repite ante el revisor):**
1. BD `tecnogua_ia` vacía (o `DROP DATABASE` + `CREATE DATABASE`). `npm run start:dev` → tablas creadas + seeders.
2. `POST /api/clients` → cliente `C`.
3. `POST /api/product-types` → tipo `T`.
4. `POST /api/products` con `productTypeId = T`, `quantity = 5` → producto `P`.
5. `POST /api/sales` `{ clientId: C, items: [{ productId: P, quantity: 2 }] }` → `201`.
6. `GET /api/products/P` → `quantity = 3`. `GET /api/sales/:id` → ítems y total coherentes.
7. `POST /api/sales` con `quantity: 10` → `409`; `GET /api/products/P` sigue en `3`.

**REQ (restricciones):**
- Seeders solo Business. No Auth nuevo ni «demo de login».
- No `force: true` ni siquiera para «limpiar» la demo: la BD se recrea con SQL, no con Sequelize.

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [ ] **AC-1** Dado la BD `tecnogua_ia` vacía; cuando `npm run start:dev`; entonces se crean las tablas `clients`, `product_types`, `products`, `sales`, `product_sales` y los seeders dejan datos; y al arrancar una **segunda vez** los conteos son idénticos (idempotencia).
- [ ] **AC-2** Dado la app arriba; cuando se ejecuta el libreto de la demo (pasos 2–7); entonces cada respuesta coincide con lo esperado (`201`, `201`, `201`, `201`, `quantity = 3`, `409`, `quantity = 3`).
- [ ] **AC-3** Dado el repositorio; cuando se inspecciona; entonces no existe `src/features/auth/` ni `src/config/jwt/`, y `package.json` no lista `@nestjs/jwt`, `passport`, `passport-jwt` ni `bcrypt`.
- [ ] **AC-4** Dado `README.md`; cuando lo lee alguien ajeno al proyecto; entonces puede crear la BD, configurar `.env`, arrancar y correr la demo sin preguntar nada (el revisor lo comprueba siguiéndolo).
- [ ] **AC-5** Dado la app arriba; cuando se abre `http://localhost:3002/api/docs`; entonces Swagger muestra `clients`, `product-types`, `products`, `sales`.

**Checklist interno (IA, En curso):**
- [ ] Orquestador de seeders con orden de dependencias
- [ ] `README.md` reescrito con libreto de demo
- [ ] Swagger en `/api/docs`
- [ ] Verificación de ausencia de Auth (árbol y `package.json`)

---

## 2. Revisión de AC — autoriza **En curso** (la escribe el revisor al final de Preparado)

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           | OBJ, SPEC, REQ, AC | este archivo + tablero (ISS-01…06 en Hecho) |          | pendiente |

Decisión posible: `AC aprobados — puede En curso` · `Ajustar AC` (indicar cuál y por qué).

---

## 3. IA usada — se diligencia en **En curso**, después de enviar el prompt

**Herramienta / modelo:** (pendiente)  
**Fecha:** (pendiente)  
**Prompt enviado** (copiado **tal cual** de la ficha ISS-07 del Guion, sección «Prompt por issue»):

```text
(pendiente — pegar aquí el prompt exacto)
```

**Ajustes o correcciones que hiciste a lo generado:** (pendiente)

---

## 4. EVI — se diligencia en **Verificación** (después de ejecutar tú mismo)

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | log de arranque ×2 + conteos | AC-1 | | `npm run start:dev` ×2; `SELECT COUNT(*) FROM clients; … product_types; … products;` |
|       | secuencia de respuestas HTTP | AC-2 | (pegar las 7 respuestas resumidas) | libreto de la demo |
|       | árbol + `package.json` | AC-3 | | `ls src/features src/config`; `rg -n "jwt|passport|bcrypt" package.json` → sin resultados |
|       | README | AC-4 | `README.md` | el revisor lo sigue |
|       | captura Swagger | AC-5 | | abrir `/api/docs` |

**Commit (hash):** pendiente — `feat(iss-07): integracion business y demo` · `Refs #__` · hecho `git push`  
**Autoevaluación de AC:** pendiente (AC-1 … AC-5: sí/no)

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

El revisor **ejecuta el libreto de la demo con el desarrollador** (no acepta capturas solas) y sigue el `README.md` como si fuera un tercero. Pregunta guía: «Si mañana hay que agregar Auth, ¿qué carpetas se tocan y cuáles no?».

| Fecha | Revisor | Actuación (aporte · revisión conforme · devolución) | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------------------------------------------------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** pendiente (`aprobado` · `aprobado con observación` · `devuelto` · `cancelado`)  
**Conclusión:**  
**Trazabilidad final:** (hash del commit definitivo + enlace al Issue). **Con este Gate el proyecto simple queda terminado: 7 tarjetas en Hecho.**
