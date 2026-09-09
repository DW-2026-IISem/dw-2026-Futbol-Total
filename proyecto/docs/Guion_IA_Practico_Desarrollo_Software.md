# Guion — Backend Business + Auth + RBAC (libreto paso a paso)

Documento para que un **desarrollador o estudiante** construya el backend **completo** (Business y luego Auth, JWT Token y RBAC) con SDD + Kanban + IA + revisión humana. Es un **libreto**: un paso, evidencia, el siguiente. No es un resumen de fases.

**Método:** `docs/asistente_ia/Proceso_Industrial_SDD_Kanban.md`  
**Pista solo Business (7 issues, sin Auth):** `docs/asistente_ia/Guion_IA_Practico_Desarrollo_Software_Simple.md`

---

## Dónde está organizado (este repo de método)

No mezcles pistas. Aquí los archivos viven así:

``` text
docs/Guion_IA_Practico_Desarrollo_Software.md      ← este libreto
docs/prompt/business_auth_rbac.md
```

Queda:

``` text
docs/
  Guion_IA_Practico_Desarrollo_Software.md
  prompt-business_auth_rbac.md
trazabilidad/
  ISS-01.md
  …
  ISS-16.md
```

A partir de ahí el seguimiento es solo `docs/` + `trazabilidad/`

ISS-07 aquí es **Users**. En la pista simple ISS-07 es **demo**. Si cambias de pista, vuelves a copiar y renombrar; no mezcles los dos ISS-07.

Cuerpo de cada Issue GitHub, arriba:

``` markdown
**Trazabilidad:** `trazabilidad/ISS-XX.md`
**Naturaleza:** práctico (Business + Auth + RBAC)
```

---

## Cómo usar este guion

1. Haz **un paso** (el número o el issue que toque).  
2. Deja evidencia en Kanban o en `trazabilidad/ISS-XX.md`.  
3. No adelantes. Si no entiendes, pregunta al guía **antes** de generar código.  
4. El guía confirma y se pasa al siguiente.  
5. Son **16 ciclos**. Cada uno cierra en **Hecho** antes de abrir el siguiente.

**Prohibido:** un prompt «hazme todo el backend»; copiar `creacion_backend_manual.md` como receta; que el guía dicte `nest new` / `mkdir`; login en ISS-07…12; marcar Hecho tú o la IA.

---

## Herramientas (no Excel)

| Pieza | Dónde | Para qué |
|-------|--------|----------|
| Código | Workspace git (este repo) | Producto |
| Tablero | GitHub **Project Board** | Estado del issue |
| Issue | `#n` en **el mismo** repo | Tarjeta; commits `Refs #n` |
| Guion | En método: este archivo. En tu repo: `docs/Guion_IA_Practico_Desarrollo_Software.md` | Libreto |
| Prompt | En método: `docs/prompt/business_auth_rbac.md`. En tu repo: `docs/prompt-business_auth_rbac.md` | Arquitectura |
| Registro | `trazabilidad/ISS-XX.md` | SDD, IA, EVI, revisiones, Gate |

**Project:** `SDD Kanban — Business Auth RBAC` (o el nombre acordado). Default repo = este workspace. **Desmarcar** «Import items from repository».

**Status** (borra `Todo`, `Done`, `Planning`): Preparado · En curso · Verificación · Revisión humana · Hecho.  
**Bloqueado** = label, no sexta columna. WIP = **1**.

Puerto `3002`. Prefijo `/api`. Swagger `http://localhost:3002/api/docs`. BD `tecnogua_ia`.  
Seed lab (desde Users): `admin@tecnogua.com` / `Admin123*` · `vendedor@tecnogua.com` / `Vendedor123*`.

---

## Quién es quién

| Rol | Hace | No hace |
|-----|------|---------|
| **Tú** | SDD, prompt, correr AC, EVI, commit, mover hasta Verificación | Escribir el backend a mano; marcar Hecho |
| **IA del repo** | Código **solo** del issue actual | Mover Kanban; escribir Gate; inventar AC |
| **Revisor / guía** | §2 AC; §5 producto; §6 Gate | Dictar CLI de construcción |

---

## Fundamento

**SDD** antes de la IA. Sin AC aprobados no hay En curso.

**Kanban** = estado del issue significativo. OBJ/SPEC/EVI no son columnas.

**Dos revisiones humanas:**

- **§2** — aprueba AC (aún no hay código). Autoriza En curso.  
- **§5** — mira el **producto** (arranque, HTTP, BD, commit). Autoriza Gate o **devolución**.

**EVI (§4)** solo en Verificación, cuando *tú* ejecutaste. Vacío antes es correcto.

Tú verificas así (no la IA):

``` bash
npm run start:dev
```

Puerto `3002` salvo `.env`. `EADDRINUSE` → `npm run free:port` si existe. Log en §4. Ctrl+C al comprobar.

Devolución en §5 → En curso, `fix(iss-XX): …` `Refs #n`, otra Verificación. El rastro queda en §5 (dos filas) y en §6 «aprobado con observación» si aplica.

---

## Orden de `trazabilidad/ISS-XX.md`

| § | Cuándo | Vacío hasta entonces |
|---|--------|----------------------|
| 1 SDD | Preparado | No |
| 2 Revisión de AC | Final de Preparado | Fila «puede En curso» |
| 3 IA usada | En curso, **después** del prompt | Sí |
| 4 EVI | Verificación | Sí |
| 5 Revisión del resultado | Revisión humana | Sí |
| 6 Gate | Hecho | `pendiente` |

El archivo **ya existe** en `trazabilidad/`. No lo copies desde otra jerarquía: ábrelo y llénalo en el paso que toca.

---

# Parte A — Día 0 e ISS-01 (libreto)

Haz los pasos **en este orden**. No generes Nest hasta el **paso 6** (prompt). El archivo `trazabilidad/ISS-01.md` ya tiene el §1.

### Paso 1 — Tablero

Crea o abre el Project. Board + 5 Status + default repo.  
**Listo cuando:** ves las cinco columnas.

### Paso 2 — Un solo Issue

En **Preparado**, Create new issue (para que exista `#1`).

- Título: `ISS-01 — Esqueleto NestJS CA arrancable`  
- Status: **Preparado**  
- Assignee: tú  
- Cuerpo: Trazabilidad + Naturaleza (arriba).  

**No** crees ISS-02…16.  
**Listo cuando:** `#1` está solo en Preparado.

### Paso 3 — Abrir el archivo (no inventar otro)

Abre `trazabilidad/ISS-01.md`. Comprueba §1 (OBJ, SPEC, AC). Cabecera: responsable y revisor. §4 y §5 **sin fechas inventadas**.  
**Listo cuando:** el Issue apunta a ese path y el archivo existe.

### Paso 4 — Revisor aprueba AC (§2)

El revisor lee §1. AC sí/no; fuera de alcance (Sequelize de negocio, login, no ISS-02) claro. Una fila, por ejemplo:

``` markdown
| 2026-09-07 | (nombre revisor) | aporte | OBJ, REQ, AC | trazabilidad/ISS-01.md | AC claros; auth solo stub; no ISS-02 | AC aprobados — puede En curso |
```

**Listo cuando:** Decisión de §2 no dice `pendiente`.

### Paso 5 — Mover a En curso

`#1` Preparado → En curso. WIP = 1. Cabecera del `.md`: `**Kanban:** En curso`.  
**Aún no** pidas el backend.  
**Listo cuando:** la tarjeta está en En curso.

### Paso 6 — Prompt (chat del **repo del producto**)

Adjunta `trazabilidad/ISS-01.md` y el prompt de esta pista (`docs/prompt/business_auth_rbac.md` aquí; en tu repo `docs/prompt-business_auth_rbac.md`). Copia el §3 de ese archivo (o pega esto):

``` text
Eres asistente SOLO de ISS-01, no del backend entero.

Implementa los AC de trazabilidad/ISS-01.md.
Sigue docs/Prompt.md (Clean Architecture). Puedes consultar la guía de fases 1–3
como referencia; NO copies un manual comando a comando y NO adelantes ISS-02.

Debe arrancar y existir el árbol
config / common / infrastructure / features/business y features/auth (stub).
Este directorio ya tiene .git, docs/ y trazabilidad/. No borres trazabilidad/.

Al final lista: archivos tocados, cómo verifico cada AC, qué quedó fuera de alcance.
```

Nest es `nest`, no `ng`.  
**Listo cuando:** existen `package.json` y `src/` **y** no pediste ISS-02.

### Paso 7 — §3 IA usada

El §3 **ya es** el prompt (cópialo al chat). No lo reescribas como relato.  
**Listo cuando:** pegaste ese texto en el chat del producto.

### Paso 8 — Verificación (tú)

``` bash
npm run start:dev
```

Comprueba: log sin error; árbol CA (business + auth stub). §4 EVI (fecha de hoy, tipo software, auténtica = sí). Commit:

``` text
feat(iss-01): esqueleto NestJS CA arrancable

Refs #1
```

Kanban: En curso → Verificación.  
**Listo cuando:** hash en §4 y tarjeta en Verificación.

### Paso 9 — §5 Revisión del resultado

El revisor pregunta: «Señala config vs features vs infrastructure». Mira arranque o commit, no el chat.  
Fila: aporte / revisión conforme / **devolución**.  
Devolución → En curso + `fix(iss-01): …` + otra Verificación.  
Kanban: Verificación → Revisión humana.  
**Listo cuando:** hay fila en §5.

### Paso 10 — Gate y Hecho

Revisor: §6 aprobado | aprobado con observación | devuelto | cancelado. Conclusión + hash.  
Kanban: Revisión humana → **Hecho**. Tú **no** marcas Hecho.  
**ISS-01 cerrado.** Recién aquí nace ISS-02.

---

# Parte B — Ciclo que se repite (ISS-02 … ISS-16)

Cada issue, **en este orden** (no lo resumas a «haz el issue»):

1. **Preparado.** Issue GitHub `#n` + abre `trazabilidad/ISS-0N.md` (el §1 ya está).  
2. **§2.** Revisor aprueba AC. Sin esto no hay En curso.  
3. **En curso.** Mueve la tarjeta. WIP = 1. Aún no pidas el siguiente.  
4. **Prompt.** Adjunta ese `.md` y el prompt de esta pista (`docs/prompt/business_auth_rbac.md` o, en tu repo, `docs/prompt-business_auth_rbac.md`). Copia el §3 de `trazabilidad/ISS-0N.md`.  
5. **§3.** Ya está escrito: es el texto que pegaste. No lo conviertas en relato.  
6. **Verificación.** Tú `npm run start:dev` + lo que pida el issue. §4 + commit `feat(iss-0N): …` `Refs #n`. Mueve a Verificación.  
7. **§5.** Pregunta del revisor (abajo). Conforme o devolución.  
8. **§6 Gate.** Revisor → Hecho. **Stop** del issue.

**Prompt:** copia el §3 de `trazabilidad/ISS-0N.md` (ya trae el texto de ese issue). No inventes otro.

---

### ISS-02 — Entorno y BD

**Qué cierra:** env validado; conexión a `tecnogua_ia` según `DB_DIALECT`; logger/filtros; `alter: false`.  
**Fuera:** Clients, login, ISS-03.

**Verificación (tú):** crea la BD vacía `tecnogua_ia` **antes**. `npm run start:dev` → log de conexión. Prueba de env ausente en una **copia** (no vacíes el `.env` de trabajo).  
**§5:** abre el factory: ¿elige el bloque del motor? ¿`alter: false`?  
Si el primer arranque falla por `DB_HOST` genérico o `.env` solo con `PORT`: **devolución**, `fix(iss-02): contrato multi-motor`, otra Verificación; deja las **dos** filas en §5.  
**Commit:** `feat(iss-02): entorno Sequelize multi-dialecto y common`  
**Stop:** no Clients.

---

### ISS-03 — Clients (lento: se enseña el patrón)

**Qué cierra:** feature `clients` CA; seeder; POST válido; 400 sin fila; entidad pura.  
**Fuera:** JWT Token, ProductTypes.

**Verificación:** `start:dev` + GET/POST `/api/clients` (tú). Mira la tabla.  
**§5 (estricto):** «señala entidad, interface, model, use-case, controller». Si no puede → devolución aunque compile.  
**Commit:** `feat(iss-03): feature clients CA seeder y API`  
**Stop:** no ProductTypes.

---

### ISS-04 — ProductTypes

Mismo ciclo que Clients. POST `/api/product-types`.  
**§5:** conforme breve si ISS-03 fue sólido.  
**Commit:** `feat(iss-04): feature product-types CA`  
**Stop:** no Products sin Gate.

---

### ISS-05 — Products

Seeder con `productType` existente. POST `/api/products`. FK inválida no deja fila.  
**§5:** «dónde vive la relación: dominio vs model».  
**Commit:** `feat(iss-05): feature products CA`  
**Stop:** no Sales.

---

### ISS-06 — Sales y stock (Gate estricto de Business)

Stock 5 y venta 2 → stock 3. Stock insuficiente → no venta ni cambio. Pivote `ProductSale`.  
**Verificación:** HTTP `/api/sales` + filas + stock.  
**§5:** «¿en qué use-case baja el stock? ¿transacción?». Devolución si el stock se «arregla» en el model.  
**Commit:** `feat(iss-06): sales y product-sale con stock`  
**Stop de Business:** no Auth (Users es ISS-07, no login).

---

### ISS-07 — Users (aún sin login)

Password **hasheado**. GET `/api/users` **sin** password/hash. Entidad pura.  
**§5:** serializer y hash.  
**Commit:** `feat(iss-07): feature users CA`  
**Stop:** no endpoints de login (ISS-13).

---

### ISS-08 — Roles

Seeder admin/vendedor. GET/POST `/api/roles`.  
**Commit:** `feat(iss-08): feature roles CA`  
**Stop:** no RoleUsers sin Gate.

---

### ISS-09 — RoleUsers

Pivote user↔role; usuario seed asociado.  
**Commit:** `feat(iss-09): feature role-users CA`  
**Stop:** no JWT Token.

---

### ISS-10 — Resources

Recursos seed alineados a rutas. GET `/api/resources`.  
**Commit:** `feat(iss-10): feature resources CA`

---

### ISS-11 — ResourceRoles

Permisos seed: admin ≠ vendedor.  
**§5:** un permiso que el vendedor **no** tiene.  
**Commit:** `feat(iss-11): feature resource-roles CA`

---

### ISS-12 — RefreshTokens (sin login HTTP)

Persistir e invalidar refresh. **Sin** `/api/auth/login`.  
**§5:** el diff no incluye ISS-13.  
**Commit:** `feat(iss-12): feature refresh-tokens CA`

---

### ISS-13 — JWT Token (Gate estricto)

Login admin 200 + access. Refresh rota/invalida. Logout rechaza el refresh. Credencial inválida 401.  
**Verificación:** `curl` a `/api/auth/login|refresh|logout`. **No** pegues tokens en trazabilidad.  
**§5:** flujo access vs refresh. Devolución si el refresh no se invalida.  
**Commit:** `feat(iss-13): login refresh logout JWT Token`  
Di **JWT Token**, no JQT.

---

### ISS-14 — Guards RBAC (Gate estricto)

Sin Bearer → 401. Vendedor a recurso admin → 403. Admin → éxito.  
**Verificación:** dos logins + la misma ruta.  
**§5:** «dónde se decide 401 vs 403».  
**Commit:** `feat(iss-14): guards RBAC`

---

### ISS-15 — Swagger Bearer

`/api/docs` documenta login. Authorize Bearer. Una ruta protegida desde Swagger.  
**§5:** 2 minutos en pantalla (comportamiento, no captura decorativa).  
**Commit:** `feat(iss-15): swagger bearer`

---

### ISS-16 — Integración y demo (cierra el proyecto)

Seeders Business → Auth, idempotentes. Login admin → venta → stock. Vendedor con un 403. Entidad ≠ model. Sin `force`.  
**Verificación:** `start:dev` y demo en vivo.  
**§5:** el revisor sigue la demo.  
**Commit:** `feat(iss-16): integracion final y demo`  
**Gate aprobado → ISS-16 Hecho = proyecto terminado.**

---

# Parte C — Cierre

El tablero: **16** tarjetas en **Hecho**. Cualquiera en En curso o Verificación = no cerrado.

**Invalidan el método:** receta del manual; guía dictando CLI; prompt de 20 fases; siguiente issue sin Gate; EVI = «la IA dijo que sí»; revisión = solo mover tarjeta; `force: true`; tú o la IA marcan Hecho; login antes de ISS-13.
