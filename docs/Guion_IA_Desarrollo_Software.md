# Guion paso a paso — Backend solo Business con SDD + Kanban + IA + revisión humana

**Nombre del workspace:** `backend-nest-ia`
**Repositorio GitHub:** `<organización>/backend-nest-ia` (el mismo repo donde vive el código, el Project y los Issues)
**GitHub Project (Board):** `SDD Kanban — backend-nest-ia`
**Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md`
**Contrato de arquitectura (se adjunta a la IA en cada issue):** `docs/Prompt.md`
**Campos y relaciones de las entidades:** `docs/BD_STORELAB_ENTIDADES_Y_ARQUITECTURA_BACKEND_FRONTEND.md` (secciones 5 y 6, solo Business)
**Plantillas de trazabilidad (una por issue):** `trazabilidad/ISS-01.md` … `trazabilidad/ISS-07.md`

> Si aplicas este guion a otro proyecto, cambia el nombre del workspace **aquí** y en todos los archivos (`rg -l "backend-nest-ia" docs trazabilidad`). Todo lo demás se mantiene.

---

## 0. Qué es este documento y cómo leerlo

Este guion es el **libreto** que sigue un desarrollador (o estudiante) para construir un backend profesional **completo** (sin Auth) aplicando la Metodología SDD + Kanban con asistencia de IA y revisión humana. Tiene dos funciones a la vez:

1. **Operativa:** dice exactamente qué hacer, en qué orden, dónde dejar evidencia y quién decide cada cosa.
2. **Formativa:** explica **por qué** cada paso existe. Si solo copias los pasos sin entender el «por qué», reproducirás la forma del método y no su fondo; en la Revisión humana se nota.

Reglas de lectura:

- Haz **un paso** a la vez, en el orden indicado. Cada paso termina con un **«Listo cuando»**: es la condición objetiva para pasar al siguiente.
- Cuando algo no se entienda, se pregunta al revisor **antes** de pedirle código a la IA. Generar código sobre una duda produce código que nadie puede defender.
- Este guion **no** es un manual de comandos de NestJS. Los comandos de construcción los ejecuta la IA del workspace; tú ejecutas los comandos de **verificación** (`npm run start:dev`, `curl`, `SELECT COUNT(*)`, `git`).

**Prohibido en esta pista** (cada punto invalida el método, ver Parte C):

- Un prompt del tipo «hazme todo el backend».
- Que el revisor te dicte `nest new`, `mkdir` o la receta de construcción.
- Implementar Auth, Users, JWT Token, guards o RBAC «por si acaso».
- Que tú o la IA marquen **Hecho**: solo el revisor humano, con Gate escrito.
- Llenar EVI (§4) con «la IA dijo que funciona».

---

## 1. Fundamentos: por qué el método es así

### 1.1 SDD — Specification Driven Development

Primero se escribe el **contrato** (OBJ, SPEC, REQ, AC) y **después** se produce el código. La razón es doble:

- **Con IA:** un modelo de lenguaje produce lo que se le pide; si la petición es vaga, inventa. Los AC convierten «quiero clientes» en «`POST /api/clients` sin `name` devuelve `400` y no crea fila». Eso sí se puede generar, verificar y revisar.
- **Con humanos:** el revisor aprueba los AC **antes** de que exista código (§2 de la trazabilidad). Así la discusión es sobre el alcance, no sobre un código ya hecho que da pena tirar.

Los AC se escriben en forma **Dado → Cuando → Entonces**: estado inicial, acción, resultado observable. Cada AC tiene que poder responderse con **sí o no** ejecutando algo.

### 1.2 Kanban — control transversal del flujo

El tablero tiene **cinco estados** y cada tarjeta es **un issue significativo** (una porción demostrable del producto), no una tarea («crear carpeta») ni un archivo.

```text
Preparado → En curso → Verificación → Revisión humana → Hecho
   SDD        IA genera    tú ejecutas     revisor mira      Gate
 §1 + §2         §3           §4              §5              §6
```

- **WIP = 1:** solo un issue En curso por persona. Obliga a terminar antes de empezar y hace visibles los bloqueos.
- **Bloqueado** es una **etiqueta** (label) sobre la tarjeta, no un sexto estado: el trabajo sigue En curso, pero con una causa visible y un responsable de desbloqueo.
- El Kanban guarda **estado**; la trazabilidad guarda **contenido**. No se duplica: la tarjeta apunta al archivo `trazabilidad/ISS-XX.md`.

### 1.3 IA responsable

La IA es un **insumo de producción**, no un actor con autoridad. Puede generar código, proponer pruebas, señalar riesgos. **No puede:** decidir qué se construye (eso es el SDD), declarar que algo funciona (eso es tu EVI), mover el Kanban ni escribir el Gate. El prompt que le envías es **el archivo de trazabilidad + el contrato de arquitectura**, no una conversación libre; y ese prompt se registra en §3 para que cualquier tercero sepa qué se le pidió.

### 1.4 Revisión humana en dos momentos

- **§2 — Revisión de AC** (final de Preparado): todavía no hay código. El revisor comprueba que los AC son verificables, que el alcance es correcto y que no se adelanta el siguiente issue. Autoriza **En curso**.
- **§5 — Revisión del resultado** (Revisión humana): ya hay código y EVI. El revisor **inspecciona el producto real**, hace preguntas de diseño al desarrollador y registra **aporte**, **revisión conforme** o **devolución**. Autoriza el **Gate**.

Sin fila escrita en §2 no hay En curso; sin fila escrita en §5 no hay Gate.

### 1.5 EVI — Evidencia

La evidencia demuestra que un AC se cumple y debe ser **auténtica** (la produjiste tú), **pertinente** (apunta a un AC concreto), **suficiente** (no una captura aislada) y **reproducible** (dice cómo repetirla). Por eso la tabla §4 tiene la columna «Cómo reproducir»: el revisor puede repetir el comando y obtener lo mismo. El chat de la IA **no** es evidencia.

### 1.6 Gate — decisión de terminado

El **Gate** es la decisión humana que cierra el issue: `aprobado`, `aprobado con observación`, `devuelto` o `cancelado`. No es una columna del tablero: es el **contenido de §6** que habilita mover a **Hecho**. El siguiente issue no se abre hasta que el anterior tiene Gate aprobado: así el proyecto crece sobre bases revisadas.

---

## 2. Glosario

- **SDD:** Specification Driven Development. Especificar antes de generar.
- **OBJ:** objetivo del issue en forma «Al finalizar, [actor] podrá [acción observable] sobre [objeto] para [valor]».
- **SPEC:** qué debe quedar: archivos, capas, endpoints, comportamiento.
- **REQ:** restricciones que no están en la arquitectura general (fuera de alcance, prohibiciones).
- **AC:** criterios de aceptación. Deciden el Gate. Forma Dado/Cuando/Entonces.
- **Checklist interno:** pasos técnicos que la IA ejecuta para cumplir los AC. No salen al tablero.
- **EVI:** evidencia enlazada en §4 (logs, respuestas HTTP, conteos SQL, hash de commit).
- **Gate:** decisión humana de cierre (§6).
- **WIP:** work in progress; límite de issues simultáneos En curso.
- **DoR / DoD:** Definition of Ready (puede entrar a En curso) / Definition of Done (puede ir a Hecho).
- **Clean Architecture (CA):** capas `domain` (reglas puras) ← `application` (casos de uso) ← `infrastructure` (BD) y `presentation` (HTTP). Las dependencias apuntan hacia `domain`.
- **DDD:** Domain-Driven Design; aquí, entidades con invariantes propias (`Product.reduceStock`) y agregados (Sale + ProductSale).
- **Entidad pura:** clase TypeScript sin decoradores de Sequelize ni imports de NestJS.
- **Model:** clase de Sequelize que representa la tabla. Solo vive en `infrastructure/persistence/models`.
- **Repositorio por contrato:** interfaz en `domain/interfaces` (`IClientRepository`) implementada en `infrastructure`.
- **Use-case:** clase de aplicación con un método `execute()` que orquesta repositorios y entidades.
- **DTO:** objeto de entrada/salida HTTP validado con `class-validator`.
- **Seeder idempotente:** siembra de datos que, ejecutada N veces, deja el mismo resultado (`findOrCreate`).
- **FK:** clave foránea. **Pivote:** tabla intermedia de una relación N:M (`product_sales`).
- **Dialecto:** motor de BD que Sequelize usa (`mysql`, `postgres`, `mssql`, `oracle`).
- **Transacción:** conjunto de operaciones SQL que se confirman todas o ninguna (`commit`/`rollback`).
- **Conventional Commits:** formato `tipo(ámbito): descripción` → `feat(iss-03): feature clients CA`.
- **`Refs #n`:** enlaza el commit al Issue **sin cerrarlo** (no se usa `Closes #n` porque cerrar es decisión humana del Gate).

---

## 3. Herramientas de esta pista

- **Código:** workspace git `backend-nest-ia` (WSL o Linux/macOS). Es el **mismo repo** que aloja los Issues y el Project.
- **Tablero:** GitHub **Project** tipo **Board**, con un solo campo `Status` de cinco valores. No una tabla Excel: Excel no enlaza commits ni issues.
- **Issue:** GitHub Issue `#n` en el repo del workspace. Es la tarjeta. Su cuerpo enlaza `trazabilidad/ISS-XX.md`. Los commits lo referencian con `Refs #n`.
- **Registro:** `trazabilidad/ISS-XX.md` (SDD, revisión de AC, IA usada, EVI, revisión humana, Gate).
- **Contrato de arquitectura:** `docs/Prompt.md`. Se adjunta a la IA en **todos** los issues.
- **Asistente IA:** el del editor abierto **en el workspace** (p. ej. Cursor). El chat en el que lees este guion **no** es el que construye.
- **Cliente HTTP:** `curl`, Postman, Thunder Client o Swagger UI (`/api/docs`).
- **Cliente SQL:** `mysql` CLI, DBeaver, MySQL Workbench (para `SELECT COUNT(*)` y crear la BD).

### 3.1 Configuración del Project (una sola vez)

1. En el repo `backend-nest-ia` → pestaña **Projects** → **New project** → **Board**. Nombre: `SDD Kanban — backend-nest-ia`. **Desmarca** «Import items from repository».
2. Campo **Status**: borra `Todo`, `In Progress`, `Done` y deja **solo**, en este orden: `Preparado`, `En curso`, `Verificación`, `Revisión humana`, `Hecho`.
3. Vista **Board** → Group by **Status**. Oculta **Sub-issues progress**.
4. En el repo, crea el **Label** `Bloqueado` (rojo). No es un Status.
5. **Default repository** del Project: `backend-nest-ia`.

**Por qué un solo campo Status y no columnas sueltas:** el Kanban expresa un único estado por tarjeta; si hubiera varias formas de indicar estado, se contradirían.

### 3.2 Quién mueve cada tarjeta

- **Preparado → En curso:** el desarrollador, **solo** después de que §2 diga «AC aprobados — puede En curso».
- **En curso → Verificación:** el desarrollador, cuando la IA entregó y él va a ejecutar.
- **Verificación → Revisión humana:** el desarrollador, cuando §4 tiene EVI, hash de commit y `git push` hecho. La tarjeta en esta columna significa «listo para revisar».
- **Revisión humana → Hecho:** el **revisor**, tras escribir §5 y §6 (Gate aprobado o aprobado con observación).
- **Revisión humana → En curso:** el **revisor**, con §5 = devolución y §6 = devuelto (o sin Gate aún).
- **La IA no mueve nada.**

---

## 4. Roles

- **Desarrollador (responsable):** escribe/ajusta el SDD si hace falta, envía el prompt a la IA, **ejecuta** la app y las pruebas de AC, llena §3 y §4, hace commit y push, mueve hasta Revisión humana. **No** escribe el esqueleto a mano ni marca Hecho.
- **Asistente IA del workspace:** genera código **solo** del issue adjunto, siguiendo `docs/Prompt.md`. **No** mueve Kanban, no escribe §2/§5/§6, no inventa AC, no toca `docs/` ni `trazabilidad/`.
- **Revisor humano (docente, tech lead o par autorizado):** aprueba AC (§2), inspecciona el producto y pregunta diseño (§5), decide el Gate (§6), mueve a Hecho o devuelve. **No** dicta comandos de construcción ni delega el Gate a la IA.

---

## 5. El archivo `trazabilidad/ISS-XX.md`: qué sección se llena en qué estado

Las siete plantillas ya existen en `trazabilidad/`. Se diligencia **una a la vez**, siguiendo el Kanban. Que una sección esté vacía en un estado anterior es **correcto**, no un olvido.

- **Cabecera** (al crear el Issue): número `#n` asignado por GitHub, responsable, revisor. El estado **no** se escribe en el archivo: vive en el tablero.
- **§1 SDD** (Preparado): OBJ, SPEC, REQ, AC, checklist. Las plantillas ya lo traen; el desarrollador lo lee, lo entiende y lo ajusta si el revisor lo pide.
- **§2 Revisión de AC** (final de Preparado): la escribe el **revisor**. Hasta entonces dice `pendiente`.
- **§3 IA usada** (En curso, **después** de enviar el prompt): herramienta/modelo, fecha, **prompt pegado tal cual** desde este guion —para ISS-01, el bloque del **Paso 6** de la Parte A; para ISS-02…07, el bloque de la ficha del issue en la **Parte B**—, y correcciones que hiciste a lo generado.
- **§4 EVI** (Verificación): tabla de evidencias con «Cómo reproducir», hash del commit, autoevaluación sí/no por AC.
- **§5 Revisión humana** (Revisión humana): la escribe el **revisor**; el desarrollador responde debajo.
- **§6 Gate** (Hecho): lo escribe el **revisor**.

Cuerpo del Issue en GitHub (no el título), en las primeras líneas:

```markdown
**Trazabilidad:** `trazabilidad/ISS-XX.md`
**Naturaleza:** práctico (backend solo Business)
```

---

# Parte A — Paso 0, Día 0 e ISS-01 (libreto detallado)

## Paso 0 — Prerrequisitos (antes del Día 0)

Verifica en la terminal del workspace:

```bash
node -v      # ≥ 20.x
npm -v       # ≥ 10.x
git --version
nest --version || npm i -g @nestjs/cli
mysql --version   # o el cliente del motor que uses
```

Además necesitas: cuenta GitHub con permiso de escritura en el repo, un servidor MySQL accesible con usuario que pueda crear bases de datos, y el editor con asistente IA abierto en el workspace.

**Por qué:** la IA no puede instalar Node ni MySQL en tu máquina; si faltan, el primer `npm run start:dev` falla y confundirás un problema de entorno con un error del método.

**Listo cuando:** todos los comandos responden con versión.

## Día 0 — Estado inicial del workspace y remoto

1. El workspace `backend-nest-ia` debe contener **solo**: `.git/`, `docs/` (los cuatro documentos) y `trazabilidad/` (las siete plantillas). **No** debe haber `src/`, `package.json` ni `node_modules/`. Si hay código previo (por ejemplo una copia de otro proyecto), se retira **antes** de empezar: ISS-01 parte de cero.
2. Remoto y primer commit:

```bash
git init -b main            # si aún no hay .git
git remote add origin https://github.com/<organización>/backend-nest-ia.git
git add docs trazabilidad
git commit -m "chore(dia-0): metodologia, guion, prompt y plantillas de trazabilidad"
git push -u origin main
```

3. Crea el Project según §3.1.

**Por qué el push del Día 0:** GitHub solo muestra los `Refs #n` de commits que **existen en el remoto**. Sin remoto, la trazabilidad commit ↔ issue no se ve en el Issue.

**Listo cuando:** el repo en GitHub muestra `docs/` y `trazabilidad/`, y el Project tiene las cinco columnas vacías.

## Paso 1 — Tablero

Abre el Project `SDD Kanban — backend-nest-ia`. Debes ver: `Preparado | En curso | Verificación | Revisión humana | Hecho`, sin tarjetas.

**Listo cuando:** las cinco columnas están visibles y vacías.

## Paso 2 — Un solo Issue

En la columna **Preparado** → **Create new issue** (no un *draft*: el draft no tiene número y los commits no lo pueden referenciar).

- **Título:** `ISS-01 — Esqueleto NestJS CA arrancable` (igual al H1 de `trazabilidad/ISS-01.md`).
- **Repository:** `backend-nest-ia`.
- **Assignee:** tú.
- **Cuerpo:** las dos líneas de §5 (Trazabilidad y Naturaleza).
- GitHub le asigna un número (`#1` si es el primer issue del repo). **Anótalo** en la cabecera de `trazabilidad/ISS-01.md` donde dice `#__`.

**No** crees los Issues de ISS-02…07 todavía. Las plantillas existen en `trazabilidad/`, pero cada Issue nace cuando el anterior está en Hecho.

**Por qué un solo Issue:** con WIP = 1 el tablero refleja la realidad. Siete tarjetas en Preparado no aportan información y tientan a adelantar trabajo.

**Listo cuando:** existe `backend-nest-ia #n` en Preparado y `trazabilidad/ISS-01.md` tiene ese número y tu nombre como responsable.

## Paso 3 — Leer y completar la cabecera de `trazabilidad/ISS-01.md`

Lee **completo** §1 (OBJ, SPEC, REQ, AC, checklist). Debes poder explicar con tus palabras cada AC y qué comando lo demuestra. Completa `Responsable` y `Revisor humano`. No toques §2–§6.

Commit de este ajuste (pequeño, pero trazable):

```bash
git add trazabilidad/ISS-01.md
git commit -m "docs(iss-01): cabecera de trazabilidad" -m "Refs #1"
git push
```

**Listo cuando:** la cabecera está completa y el path del cuerpo del Issue coincide con el archivo real.

## Paso 4 — El revisor aprueba los AC (§2)

El revisor lee §1 y verifica: (a) cada AC es Dado/Cuando/Entonces y se responde con sí/no ejecutando algo; (b) el REQ excluye lo que no toca (Sequelize, BD, Auth); (c) no se adelanta ISS-02. Escribe **una fila** en §2, por ejemplo:

```markdown
| 2026-09-08 | (nombre revisor) | aporte | OBJ, SPEC, REQ, AC | trazabilidad/ISS-01.md | AC verificables; alcance correcto; sin Auth ni ISS-02 | AC aprobados — puede En curso |
```

Si pide ajustar un AC, lo ajustas, haces commit `docs(iss-01): ajuste de AC` y vuelve a revisar.

**Por qué el revisor y no tú:** la aprobación de AC es el primer punto de control humano. Si el desarrollador se aprueba a sí mismo, el método pierde su segunda mirada exactamente donde es más barata (aún no hay código).

**Listo cuando:** la columna Decisión de §2 **no** dice `pendiente`.

## Paso 5 — Mover a En curso

Kanban: arrastra `#n` de **Preparado → En curso**. WIP = 1. **Aún no** pidas nada a la IA.

**Listo cuando:** la tarjeta está en En curso.

## Paso 6 — Prompt a la IA del workspace

Abre el asistente IA **en el workspace `backend-nest-ia`**. Adjunta (o referencia) `trazabilidad/ISS-01.md` y `docs/Prompt.md`. Copia **tal cual** el prompt del modo que uses (no lo resumas ni lo adaptes; es el contrato exacto del issue). Hay **dos modos**:

#### Modo agente — la IA escribe el código directo sobre el proyecto

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

#### Modo chat IA — la IA te dicta comandos `cat > … <<'EOF'` para pegar en la terminal

> Con este modo **no** hace falta que la IA cree archivos: le pides el código como comandos de terminal y tú los copias y pegas en el workspace, uno tras otro.

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-01, no del backend entero.
NO edites archivos: responde SOLO con comandos de terminal listos para copiar y pegar.

Implementa los AC de trazabilidad/ISS-01.md siguiendo docs/Prompt.md (Clean Architecture, solo Business).

Contexto del directorio: la raíz del workspace ya tiene .git/, docs/ y trazabilidad/. NO los borres ni los modifiques.

Entrega, en este orden:
1. Los comandos para generar el proyecto NestJS SIN tocar .git/docs/trazabilidad: genera en un directorio temporal
   (`nest new backend-nest-ia --skip-git --package-manager npm`) y mueve su contenido a la raíz del workspace
   (con `rsync -a` o `mv`), fusionando .gitignore para que incluya node_modules/, dist/, .env.
2. Los `mkdir -p …` de las carpetas CA que falten: src/config, src/common, src/infrastructure/database, src/features/business.
3. Un comando `cat > <ruta> <<'EOF_ISS_01' … EOF_ISS_01` por cada archivo a crear o modificar, con el contenido COMPLETO
   (nada de «aquí va lo mismo que antes»). Mínimo: src/main.ts (setGlobalPrefix('api'),
   ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }), listen(process.env.PORT ?? 3002),
   endpoint GET /api/health → 200 { "status": "ok" }), src/app.module.ts, src/features/business/business.module.ts (stub),
   scripts/free-port.js, package.json (scripts free:port y start:dev = free:port && nest start --watch) y
   .gitignore (node_modules/, dist/, .env).
4. Al final, tres listas: archivos tocados (solo código directo); cómo verificar cada AC (comandos exactos); qué quedó fuera de alcance.

Prohibido: Sequelize, base de datos, .env de BD, Auth, Users, JWT Token, login. NO adelantes ISS-02.
NO toques docs/ ni trazabilidad/.
```

**Archivos creados o modificados (código directo)** — los que deben aparecer en la entrega de la IA; **no** cuentan dependencias instaladas (`npm i …`), `node_modules/`, `dist/` ni el esqueleto generado por `nest new`:

- `src/main.ts` — prefijo `/api`, `ValidationPipe`, ruta `GET /api/health`, `listen(PORT ?? 3002)`.
- `src/app.module.ts` — registra el controlador de salud y `BusinessModule`.
- `src/features/business/business.module.ts` — stub de la capa business.
- `src/config/` · `src/common/` · `src/infrastructure/database/` — carpetas del árbol CA.
- `scripts/free-port.js` — libera el puerto ocupado antes de arrancar.
- `package.json` — scripts `free:port` y `start:dev`.
- `.gitignore` — incluye `node_modules/`, `dist/`, `.env`.


Detalles técnicos que debes saber para supervisar a la IA en este issue:

- El CLI de Nest se llama `nest` (no `ng`, que es Angular). Si la IA lo confunde, corrígela en ese chat.
- `nest new` en un directorio **no vacío** puede negarse o intentar limpiar. El prompt le indica que genere el proyecto en un directorio temporal (`nest new backend-nest-ia --skip-git --package-manager npm`) y mueva el contenido a la raíz **sin tocar** `.git/`, `docs/` ni `trazabilidad/`. Comprueba después con `git status` que no hay borrados en esas carpetas.
- El `.gitignore` debe incluir `node_modules/`, `dist/`, `.env`.

Si la IA propone adelantar ISS-02 («¿quieres que configure Sequelize?»), la respuesta es **no**.

**Listo cuando:** existen `package.json` y `src/`, `git status` no muestra borrados en `docs/`/`trazabilidad/`, y la IA entregó las tres listas (archivos tocados, cómo verificar cada AC, fuera de alcance).

## Paso 7 — §3 IA usada

En `trazabilidad/ISS-01.md` → **## 3. IA usada**, completa las cuatro líneas:

- **Herramienta / modelo:** p. ej. Cursor + el modelo que usaste.
- **Fecha:** hoy.
- **Prompt enviado:** pega **el prompt exacto del Paso 6** (el bloque `text` del modo que usaste —**agente** o **chat**—, el que aparece justo arriba), tal cual, sin recortes ni resumen.
- **Ajustes o correcciones:** qué cambiaste de lo generado (p. ej. «propuso Sequelize; lo rechacé»).

El prompt **ya está en este guion**, en el Paso 6 (en sus dos modos): cópialo de ahí y pégalo dentro del bloque `text` de §3. No busques en otra sección.

**Por qué pegar el prompt y no resumirlo:** el prompt es la especificación real que recibió la IA. Un tercero (o tú dentro de tres meses) debe poder ver exactamente qué se pidió; un relato («le pedí el esqueleto») no lo permite.

**Listo cuando:** §3 no dice `pendiente`.

## Paso 8 — Verificación (tú ejecutas; la IA no)

Kanban: **En curso → Verificación**. En la raíz del workspace:

```bash
npm install          # si la IA no lo hizo
npm run start:dev
```

Comprueba **cada AC** de §1 con su comando de §4 «Cómo reproducir»:

- AC-2: el log muestra `Nest application successfully started`, puerto `3002`.
- AC-3: en otra terminal `curl -i http://localhost:3002/api/health` → `200` y `{"status":"ok"}`.
- AC-1 y AC-4: `ls src src/features` → existen `config`, `common`, `infrastructure`, `features/business`; no existe `features/auth`.

Detén con `Ctrl+C`. Si hubo `EADDRINUSE`, `npm run free:port` y vuelve a arrancar.

Llena **§4 EVI**: fecha de hoy, líneas del log (3–5), respuesta HTTP, salida de `ls`. Autoevaluación: sí/no por AC. Si algún AC es «no», vuelves a la IA en el mismo chat, corriges y repites; la tarjeta sigue en Verificación.

Commit y push (el commit incluye el código **y** el `.md` de trazabilidad; **nunca** `.env`):

```bash
git add .
git status            # confirma que .env NO aparece
git commit -m "feat(iss-01): esqueleto NestJS CA arrancable" -m "Refs #1"
git push
```

Copia el hash (`git log -1 --format=%h`) en §4. Kanban: **Verificación → Revisión humana**.

**Por qué el commit lleva código y trazabilidad juntos:** son la misma unidad significativa. Un commit de código sin su registro, o un registro sin código, rompe el hilo.

**Listo cuando:** §4 tiene hash y el commit se ve en GitHub dentro del Issue `#n` (sección de commits referenciados).

## Paso 9 — Revisión humana del resultado (§5)

El revisor **no solo mueve la tarjeta**. Abre el repo (no el chat de la IA), mira el árbol y el commit, y te pregunta, por ejemplo: «Señala qué va en `config`, qué en `common`, qué en `infrastructure` y qué en `features`». «¿Por qué el `ValidationPipe` está en `main.ts`?». Puede pedirte que arranques la app en vivo.

Escribe **una fila** en §5 con la actuación: **aporte** (corrigió o sugirió algo que incorporas), **revisión conforme** (AC comprobados) o **devolución** (incumplimiento localizado + condición para nueva revisión). Tú respondes debajo («Respuesta del autor»).

- Si **devolución:** el revisor mueve **Revisión humana → En curso**; corriges con la IA, commit `fix(iss-01): …` `Refs #1`, repites el paso 8.
- Si **aporte** o **conforme:** pasa al paso 10.

**Listo cuando:** hay fila en §5 y respuesta del autor si aplica.

## Paso 10 — Gate (§6) y Hecho

El revisor escribe §6: `aprobado` | `aprobado con observación` | `devuelto` | `cancelado`, conclusión y hash definitivo. Kanban: **Revisión humana → Hecho** (lo mueve el revisor).

**ISS-01 cerrado.** Solo ahora se crea el Issue de **ISS-02** (paso 2 con la plantilla `trazabilidad/ISS-02.md`) y se repite el ciclo pasos 2–10.

**Por qué Hecho lo marca el revisor:** «terminado» es un juicio sobre el cumplimiento de AC y la calidad del producto. Quien produce no debería certificar; la IA menos.

---

# Parte B — ISS-02 a ISS-07 (mismo ciclo; cambia el contrato)

Cada issue repite **exactamente** los pasos 2–10 de la Parte A. Lo que cambia es el contenido de §1 (ya está en cada plantilla) y el **prompt** (abajo, **inline** en cada ficha, uno por issue). En cada issue:

- **Paso 6:** copia **tal cual** a la IA el prompt del modo que uses (agente o chat), de la ficha del issue.
- **Paso 7:** pega **ese mismo prompt** (sin recortes) en `trazabilidad/ISS-0X.md` → **## 3. IA usada**.

No busques el prompt en otra sección: está siempre justo debajo del título de su ficha. Cada ficha trae **dos modos** —**Modo agente** (la IA escribe el código directo) y **Modo chat IA** (la IA te dicta comandos `cat > … <<'EOF'` para pegar en la terminal)—; usa el que corresponda a tu asistente. Aquí van, por issue: resumen del contrato, notas técnicas para verificar y el prompt en sus dos modos.

### Estructura común del prompt

Todos los prompts siguen la misma forma; entiende cada bloque para poder adaptarlo si un día cambian los AC:

1. **Naturaleza y alcance:** «eres asistente SOLO de ISS-XX».
2. **Fuente de verdad:** «implementa los AC de `trazabilidad/ISS-XX.md`; sigue `docs/Prompt.md`».
3. **Prohibiciones:** Auth, `force: true`, adelantar el siguiente issue, tocar `docs/`/`trazabilidad/`.
4. **Detalles específicos del issue** (solo los que la plantilla no puede expresar como AC).
5. **Formato de entrega:** archivos tocados, cómo verificar cada AC, fuera de alcance.

Cada ficha trae ese mismo prompt en **dos modos**:

- **Modo agente:** la IA tiene acceso a los archivos y escribe el código directo sobre el proyecto. Copias el prompt tal cual y ella edita el workspace.
- **Modo chat IA:** la IA **no** edita archivos. Le pides el código como comandos `cat > <ruta> <<'EOF' … EOF` y los copias/pegas en la terminal del workspace. La ficha incluye, además, la lista de **archivos creados o modificados (código directo)** para que verifiques que no falta ninguno y que no aparecen dependencias (`node_modules/`) ni esqueleto de CLI como «código».

---

## ISS-02 — Entorno Sequelize y common

**Resumen:** `.env` validado por dialecto, factory Sequelize multi-motor con `sync({ alter: false })`, módulo global, filtro de excepciones e interceptor de logging, `.env.example`. Sin modelos aún.

**Notas técnicas para verificar:**

- **Crear la BD antes de Verificación** (lo haces tú, no la IA; el contenedor la crea con `MYSQL_DATABASE=tecnogua_ia`, así que este paso suele ser no-op; usa `root` solo si `admin` no tiene privilegio de `CREATE DATABASE`):

```bash
mysql -u admin -p -e "CREATE DATABASE IF NOT EXISTS tecnogua_ia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

- **Prueba de variable ausente (AC-2) sin dañar tu `.env`:**

```bash
cp .env .env.bak                                  # respaldo
sed -i '/^DB_MYSQL_HOST=/d' .env                  # quita una variable CRÍTICA en la copia de trabajo
npm run start:dev                                 # debe FALLAR con "Error de configuración: … DB_MYSQL_HOST"
                                                  # y SIN ningún intento de conexión (no debe verse ECONNREFUSED)
# Ctrl+C
mv .env.bak .env                                  # restaura
npm run start:dev                                 # debe arrancar de nuevo
```

- **Por qué `HOST` y no `PASSWORD` en la prueba:** la validación exige `HOST`, `USERNAME` y `NAME` del bloque activo; la contraseña puede ser vacía en instalaciones locales, así que no se considera crítica. Si quitas `PASSWORD` verás un error de autenticación de MySQL, no de configuración: es un fallo distinto y ocurre **después** de intentar conectar.

- **Por qué un bloque por motor y no `DB_HOST` genérico:** permite cambiar de motor cambiando **una** variable (`DB_DIALECT`) sin reescribir el resto. La validación debe exigir solo el bloque del dialecto activo; si exigiera los cuatro, nadie podría arrancar sin tener cuatro motores instalados.
- **Por qué `alter: false`:** `sync()` crea tablas que no existen; `alter: true` modifica columnas existentes de forma automática (riesgo de pérdida de datos); `force: true` borra y recrea (pérdida garantizada). En esta pista se acepta `sync` solo para crear.

**Prompt por issue (ISS-02):** presenta **dos modos**; usa el que corresponda a tu asistente.

> **Uso:** en el **paso 6**, copia **tal cual** el prompt del modo elegido a la IA. En el **paso 7**, pega **ese mismo prompt** (sin recortes) en `trazabilidad/ISS-02.md` → **## 3. IA usada**.

#### Modo agente — la IA escribe el código directo sobre el proyecto

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-02, no del backend entero.

Implementa los AC de trazabilidad/ISS-02.md siguiendo docs/Prompt.md (secciones 2, 3, 7 y 8).

Entorno: src/config/environment con validación al arrancar (class-validator sobre process.env) que exige SOLO las
variables del bloque del DB_DIALECT activo y falla con un mensaje "Error de configuración: …" que nombra la variable faltante.
Sequelize: src/infrastructure/database/sequelize/sequelize.factory.ts multi-dialecto (mysql | postgres | mssql | oracle)
con ALL_MODELS = [] y sequelize.sync({ alter: false }); sequelize.module.ts global cuyo useFactory inyecta el namespace
tipado envConfig.KEY (NO ConfigService) para que la validación ocurra ANTES de intentar conectar.
Common: src/common/exceptions (ApplicationException con statusCode; EntityNotFoundException 404, DomainException 400,
BusinessRuleException 409), src/common/filters/global-exception.filter.ts que lee ese statusCode,
src/common/interceptors/{logging,timeout,response}.interceptor.ts. ResponseInterceptor envuelve toda respuesta exitosa en
{ statusCode, message, data, timestamp }. Todo registrado en main.ts.
Escribe .env.example Y actualiza el .env local con el contrato de docs/Prompt.md §8
(DB_DIALECT + bloques DB_MYSQL_*, DB_POSTGRES_*, DB_MSSQL_*, DB_ORACLE_*). NO uses DB_HOST / DB_USERNAME genéricos.
Instala los drivers: mysql2, pg, tedious, oracledb.

Prohibido: force: true, alter: true, modelos de negocio, Clients, Auth, Users, JWT Token. NO adelantes ISS-03.
NO toques docs/ ni trazabilidad/. NO commitees .env.

Al final entrega tres listas: archivos tocados; cómo verifico cada AC (comandos exactos); qué quedó fuera de alcance.
```

#### Modo chat IA — la IA te dicta comandos `cat > … <<'EOF'` para pegar en la terminal

> Con este modo **no** hace falta que la IA cree archivos: le pides el código como comandos de terminal y tú los copias y pegas en el workspace, uno tras otro.

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-02, no del backend entero.
NO edites archivos: responde SOLO con comandos de terminal listos para copiar y pegar.

Implementa los AC de trazabilidad/ISS-02.md siguiendo docs/Prompt.md (secciones 2, 3, 7 y 8).

Entorno: src/config/environment con validación al arrancar (class-validator sobre process.env) que exige SOLO las
variables del bloque del DB_DIALECT activo y falla con "Error de configuración: …" nombrando la variable faltante.
Sequelize: src/infrastructure/database/sequelize/sequelize.factory.ts multi-dialecto (mysql | postgres | mssql | oracle)
con ALL_MODELS = [] y sequelize.sync({ alter: false }); sequelize.module.ts global cuyo useFactory inyecta el namespace
tipado envConfig.KEY (NO ConfigService) para que la validación ocurra ANTES de intentar conectar.
Common: src/common/exceptions (ApplicationException con statusCode; EntityNotFoundException 404, DomainException 400,
BusinessRuleException 409), src/common/filters/global-exception.filter.ts que lee ese statusCode,
src/common/interceptors/{logging,timeout,response}.interceptor.ts. ResponseInterceptor envuelve toda respuesta exitosa en
{ statusCode, message, data, timestamp }. Todo registrado en main.ts.
Escribe .env.example Y actualiza el .env local con el contrato de docs/Prompt.md §8
(DB_DIALECT + bloques DB_MYSQL_*, DB_POSTGRES_*, DB_MSSQL_*, DB_ORACLE_*). NO uses DB_HOST / DB_USERNAME genéricos.

Entrega, en este orden:
1. Los `mkdir -p …` de las carpetas nuevas.
2. Un comando `cat > <ruta> <<'EOF_ISS_02' … EOF_ISS_02` por cada archivo a crear o modificar, con el contenido COMPLETO.
3. Los comandos de instalación de los paquetes nuevos (mysql2, pg, tedious, oracledb) y el comando de arranque.
4. Al final, tres listas: archivos tocados (solo código directo; sin node_modules/); cómo verificar cada AC; qué quedó fuera de alcance.

Prohibido: force: true, alter: true, modelos de negocio, Clients, Auth, Users, JWT Token. NO adelantes ISS-03.
NO toques docs/ ni trazabilidad/. NO commitees .env (usa .env.example como plantilla).
```

**Archivos creados o modificados (código directo)** — los que deben aparecer en la entrega de la IA; **no** cuentan dependencias instaladas (`npm i …`), `node_modules/`, `dist/` ni el esqueleto generado por CLI:

- `src/config/environment/` — `env.config.ts`, `env.interface.ts`, `env.validation.ts`, `db-env.ts` (y su índice).
- `src/infrastructure/database/sequelize/sequelize.factory.ts` — multi-dialecto, `ALL_MODELS = []`, `sync({ alter: false })`.
- `src/infrastructure/database/sequelize/sequelize.module.ts` — módulo global que expone la instancia.
- `src/common/exceptions/` — `application.exception.ts`, `entity-not-found.exception.ts`, `domain.exception.ts`, `business-rule.exception.ts`.
- `src/common/filters/global-exception.filter.ts` — lee `statusCode` de las excepciones.
- `src/common/interceptors/` — `logging.interceptor.ts`, `timeout.interceptor.ts`, `response.interceptor.ts`.
- `src/main.ts` (modificado) — registra el filtro y los interceptores.
- `src/app.module.ts` (modificado) — importa `SequelizeModule`.
- `.env.example` (versionado) y `.env` (local, no se commitea).


---

## ISS-03 — Feature clients CA (lento: aquí se aprende el patrón)

**Resumen:** primera feature completa con cuatro capas, entidad pura, repositorio por contrato, seeder idempotente, `GET`/`POST` con `200/201/400/404/409`.

**Notas técnicas para verificar:**

- Conteo antes/después para AC-1 y AC-3: `mysql -u admin -p tecnogua_ia -e "SELECT COUNT(*) FROM clients;"`.
- **Por qué el use-case recibe `IClientRepository` y no `ClientRepository` (Sequelize):** para que el caso de uso no dependa de Sequelize. Mañana el repositorio podría ser en memoria (pruebas) u otro ORM sin tocar la lógica.
- **Por qué la entidad es pura:** si `Client extends Model`, el dominio arrastra Sequelize a todas partes y ya no hay Clean Architecture; solo hay carpetas con nombres bonitos.
- Este issue se revisa **estricto** (§5): debes señalar y explicar cada capa.

**Prompt por issue (ISS-03):** presenta **dos modos**; usa el que corresponda a tu asistente.

> **Uso:** en el **paso 6**, copia **tal cual** el prompt del modo elegido a la IA. En el **paso 7**, pega **ese mismo prompt** (sin recortes) en `trazabilidad/ISS-03.md` → **## 3. IA usada**.

#### Modo agente — la IA escribe el código directo sobre el proyecto

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

#### Modo chat IA — la IA te dicta comandos `cat > … <<'EOF'` para pegar en la terminal

> Con este modo **no** hace falta que la IA cree archivos: le pides el código como comandos de terminal y tú los copias y pegas en el workspace, uno tras otro.

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-03, no del backend entero.
NO edites archivos: responde SOLO con comandos de terminal listos para copiar y pegar.

Implementa los AC de trazabilidad/ISS-03.md siguiendo docs/Prompt.md (arquitectura §2, campos §4, HTTP §5).

Feature src/features/business/clients con las cuatro capas. Entidad Client PURA (sin Sequelize ni NestJS).
IClientRepository en domain/interfaces; ClientRepository (Sequelize) y ClientModel (tabla clients) en infrastructure;
registra ClientModel en ALL_MODELS. Use-cases CreateClient, ListClients, GetClientById.
CreateClientDto: name requerido; email opcional con formato; phone y address opcionales.
Controller: GET /api/clients, GET /api/clients/:id, POST /api/clients. Swagger.
Errores: DTO inválido → 400; id inexistente → 404; email duplicado → 409.
Seeder idempotente (findOrCreate por email) con al menos un cliente, ejecutado al arrancar. ClientsModule en BusinessModule.

Entrega, en este orden:
1. Los `mkdir -p …` de las carpetas de la feature (application, domain, infrastructure, presentation y sus subcarpetas).
2. Un comando `cat > <ruta> <<'EOF_ISS_03' … EOF_ISS_03` por cada archivo a crear o modificar, con el contenido COMPLETO.
3. Al final, tres listas: archivos tocados (solo código directo); cómo verificar cada AC (curl y SQL exactos); qué quedó fuera de alcance.

Prohibido: Auth, Users, JWT Token, guards; entidad que extienda Model; force: true. NO adelantes ISS-04 (ProductTypes).
NO toques docs/ ni trazabilidad/.
```

**Archivos creados o modificados (código directo)** — los que deben aparecer en la entrega de la IA; **no** cuentan dependencias instaladas (`npm i …`), `node_modules/`, `dist/` ni el esqueleto generado por CLI:

- `src/features/business/clients/domain/entities/client.entity.ts` — entidad pura.
- `src/features/business/clients/domain/interfaces/client.repository.ts` — `IClientRepository`.
- `src/features/business/clients/domain/exceptions/client-not-found.exception.ts` y `client-email-already-exists.exception.ts`.
- `src/features/business/clients/application/dto/create-client.dto.ts`.
- `src/features/business/clients/application/mappers/client.mapper.ts`.
- `src/features/business/clients/application/use-cases/create-client.use-case.ts`, `list-clients.use-case.ts`, `get-client-by-id.use-case.ts`.
- `src/features/business/clients/infrastructure/persistence/models/client.model.ts` — tabla `clients`.
- `src/features/business/clients/infrastructure/persistence/repositories/client.repository.ts`.
- `src/features/business/clients/infrastructure/persistence/seeders/client.seeder.ts`.
- `src/features/business/clients/presentation/http/controllers/clients.controller.ts`.
- `src/features/business/clients/clients.module.ts`.
- `src/features/business/business.module.ts` (modificado) — registra `ClientsModule`.
- `src/infrastructure/database/sequelize/sequelize.factory.ts` (modificado) — `ALL_MODELS` incluye `ClientModel`.


---

## ISS-04 — Feature product-types CA

**Resumen:** mismo patrón que Clients. Nombre único → `409`.

**Notas:** compara tu `product-types/` con `clients/` archivo por archivo; lo que cambia debería ser solo campos y nombres. Si cambió la estructura, algo se copió mal.

**Prompt por issue (ISS-04):** presenta **dos modos**; usa el que corresponda a tu asistente.

> **Uso:** en el **paso 6**, copia **tal cual** el prompt del modo elegido a la IA. En el **paso 7**, pega **ese mismo prompt** (sin recortes) en `trazabilidad/ISS-04.md` → **## 3. IA usada**.

#### Modo agente — la IA escribe el código directo sobre el proyecto

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

#### Modo chat IA — la IA te dicta comandos `cat > … <<'EOF'` para pegar en la terminal

> Con este modo **no** hace falta que la IA cree archivos: le pides el código como comandos de terminal y tú los copias y pegas en el workspace, uno tras otro.

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-04, no del backend entero.
NO edites archivos: responde SOLO con comandos de terminal listos para copiar y pegar.

Implementa los AC de trazabilidad/ISS-04.md siguiendo docs/Prompt.md y el MISMO patrón de src/features/business/clients.

Feature src/features/business/product-types: entidad ProductType PURA (id, name requerido y único, description?, status);
IProductTypeRepository; ProductTypeModel (tabla product_types) en ALL_MODELS; use-cases CreateProductType, ListProductTypes,
GetProductTypeById; CreateProductTypeDto; controller GET /api/product-types, GET /api/product-types/:id, POST /api/product-types; Swagger.
Errores: 400 DTO inválido; 404 id inexistente; 409 name duplicado.
Seeder idempotente (findOrCreate por name) con al menos un tipo. Módulo en BusinessModule.

Entrega, en este orden:
1. Los `mkdir -p …` de las carpetas de la feature.
2. Un comando `cat > <ruta> <<'EOF_ISS_04' … EOF_ISS_04` por cada archivo a crear o modificar, con el contenido COMPLETO.
3. Al final, tres listas: archivos tocados (solo código directo); cómo verificar cada AC; qué quedó fuera de alcance.

Prohibido: Auth, Users, JWT Token, guards; entidad que extienda Model; force: true. NO adelantes ISS-05 (Products).
NO toques docs/ ni trazabilidad/.
```

**Archivos creados o modificados (código directo)** — los que deben aparecer en la entrega de la IA; **no** cuentan dependencias instaladas (`npm i …`), `node_modules/`, `dist/` ni el esqueleto generado por CLI:

- `src/features/business/product-types/domain/entities/product-type.entity.ts`.
- `src/features/business/product-types/domain/interfaces/product-type.repository.ts`.
- `src/features/business/product-types/domain/exceptions/product-type-not-found.exception.ts` y `product-type-name-already-exists.exception.ts`.
- `src/features/business/product-types/application/dto/create-product-type.dto.ts`.
- `src/features/business/product-types/application/mappers/product-type.mapper.ts`.
- `src/features/business/product-types/application/use-cases/create-product-type.use-case.ts`, `list-product-types.use-case.ts`, `get-product-type-by-id.use-case.ts`.
- `src/features/business/product-types/infrastructure/persistence/models/product-type.model.ts` — tabla `product_types`.
- `src/features/business/product-types/infrastructure/persistence/repositories/product-type.repository.ts`.
- `src/features/business/product-types/infrastructure/persistence/seeders/product-type.seeder.ts`.
- `src/features/business/product-types/presentation/http/controllers/product-types.controller.ts`.
- `src/features/business/product-types/product-types.module.ts`.
- `src/features/business/business.module.ts` (modificado) — registra `ProductTypesModule`.
- `src/infrastructure/database/sequelize/sequelize.factory.ts` (modificado) — `ALL_MODELS` incluye `ProductTypeModel`.


---

## ISS-05 — Feature products CA

**Resumen:** Products con FK a ProductType, campo `quantity` (stock) y método de dominio `reduceStock`. FK inexistente → `404`; `price ≤ 0` → `400`.

**Notas técnicas para verificar:**

- **Dónde vive la relación:** en `ProductModel` (`@ForeignKey`, `@BelongsTo`). La entidad `Product` solo tiene `productTypeId: number`. El dominio no sabe qué es una FK.
- **Quién comprueba que el tipo existe y está activo:** el use-case `CreateProduct`, consultando `IProductTypeRepository` (inexistente → `404`; **inactivo → `409`**, según `Prompt.md` §4 y el AC-3). No el controller (sería lógica en presentación) ni «dejar que la BD falle» (el error de FK del motor no es un `404` claro).
- **Orden de seeders:** el seeder de Products necesita un tipo existente; el orquestador (ISS-07) formaliza el orden, pero ya aquí Products debe correr después de ProductTypes.

**Prompt por issue (ISS-05):** presenta **dos modos**; usa el que corresponda a tu asistente.

> **Uso:** en el **paso 6**, copia **tal cual** el prompt del modo elegido a la IA. En el **paso 7**, pega **ese mismo prompt** (sin recortes) en `trazabilidad/ISS-05.md` → **## 3. IA usada**.

#### Modo agente — la IA escribe el código directo sobre el proyecto

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-05, no del backend entero.

Implementa los AC de trazabilidad/ISS-05.md siguiendo docs/Prompt.md y el patrón de clients/product-types.

Feature src/features/business/products: entidad Product PURA (id, name, brand, price, minStock, quantity, productTypeId, status)
con método reduceStock(n) que lanza InsufficientStockException si quantity - n < 0. IProductRepository; ProductNotFoundException, ProductTypeInactiveException (409).
ProductModel (tabla products) con @ForeignKey/@BelongsTo a ProductTypeModel, en ALL_MODELS. La relación vive SOLO en el model.
CreateProductDto: name requerido; price > 0; quantity ≥ 0 y minStock ≥ 0 (default 0); productTypeId requerido.
Use-case CreateProduct verifica que productTypeId exista usando IProductTypeRepository (→ 404 si no existe; → 409 si está inactivo). ListProducts, GetProductById.
Controller GET /api/products, GET /api/products/:id, POST /api/products (la respuesta incluye quantity). Swagger.
Seeder idempotente que crea al menos un producto con un tipo existente; debe ejecutarse DESPUÉS del seeder de product-types.
ProductsModule importa ProductTypesModule (para el repositorio) y se registra en BusinessModule.

Prohibido: Auth, JWT Token, guards; entidad que extienda Model; force: true. NO adelantes ISS-06 (Sales).
NO toques docs/ ni trazabilidad/.

Al final entrega tres listas: archivos tocados; cómo verifico cada AC; qué quedó fuera de alcance.
```

#### Modo chat IA — la IA te dicta comandos `cat > … <<'EOF'` para pegar en la terminal

> Con este modo **no** hace falta que la IA cree archivos: le pides el código como comandos de terminal y tú los copias y pegas en el workspace, uno tras otro.

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-05, no del backend entero.
NO edites archivos: responde SOLO con comandos de terminal listos para copiar y pegar.

Implementa los AC de trazabilidad/ISS-05.md siguiendo docs/Prompt.md y el patrón de clients/product-types.

Feature src/features/business/products: entidad Product PURA (id, name, brand, price, minStock, quantity, productTypeId, status)
con método reduceStock(n) que lanza InsufficientStockException si quantity - n < 0. IProductRepository; ProductNotFoundException, ProductTypeInactiveException (409).
ProductModel (tabla products) con @ForeignKey/@BelongsTo a ProductTypeModel, en ALL_MODELS. La relación vive SOLO en el model.
CreateProductDto: name requerido; price > 0; quantity ≥ 0 y minStock ≥ 0 (default 0); productTypeId requerido.
Use-case CreateProduct verifica que productTypeId exista usando IProductTypeRepository (→ 404 si no existe; → 409 si está inactivo). ListProducts, GetProductById.
Controller GET /api/products, GET /api/products/:id, POST /api/products (la respuesta incluye quantity). Swagger.
Seeder idempotente que crea al menos un producto con un tipo existente; debe ejecutarse DESPUÉS del seeder de product-types.
ProductsModule importa ProductTypesModule (para el repositorio) y se registra en BusinessModule.

Entrega, en este orden:
1. Los `mkdir -p …` de las carpetas de la feature.
2. Un comando `cat > <ruta> <<'EOF_ISS_05' … EOF_ISS_05` por cada archivo a crear o modificar, con el contenido COMPLETO.
3. Al final, tres listas: archivos tocados (solo código directo); cómo verificar cada AC; qué quedó fuera de alcance.

Prohibido: Auth, JWT Token, guards; entidad que extienda Model; force: true. NO adelantes ISS-06 (Sales).
NO toques docs/ ni trazabilidad/.
```

**Archivos creados o modificados (código directo)** — los que deben aparecer en la entrega de la IA; **no** cuentan dependencias instaladas (`npm i …`), `node_modules/`, `dist/` ni el esqueleto generado por CLI:

- `src/features/business/products/domain/entities/product.entity.ts` — entidad pura con `reduceStock`.
- `src/features/business/products/domain/interfaces/product.repository.ts`.
- `src/features/business/products/domain/exceptions/product-not-found.exception.ts` y `product-type-inactive.exception.ts`.
- `src/features/business/products/application/dto/create-product.dto.ts`.
- `src/features/business/products/application/mappers/product.mapper.ts`.
- `src/features/business/products/application/use-cases/create-product.use-case.ts`, `list-products.use-case.ts`, `get-product-by-id.use-case.ts`.
- `src/features/business/products/infrastructure/persistence/models/product.model.ts` — tabla `products` con FK a `ProductTypeModel`.
- `src/features/business/products/infrastructure/persistence/repositories/product.repository.ts`.
- `src/features/business/products/infrastructure/persistence/seeders/product.seeder.ts`.
- `src/features/business/products/presentation/http/controllers/products.controller.ts`.
- `src/features/business/products/products.module.ts` — importa `ProductTypesModule`.
- `src/features/business/business.module.ts` (modificado) — registra `ProductsModule`.
- `src/infrastructure/database/sequelize/sequelize.factory.ts` (modificado) — `ALL_MODELS` incluye `ProductModel`.


---

## ISS-06 — Sales y stock (Gate estricto)

**Resumen:** agregado Sale + ProductSale, `CreateSale` con **transacción**, descuento de stock vía `Product.reduceStock`, `409` si no alcanza, rollback total en ventas multi-ítem.

**Notas técnicas para verificar:**

- **Por qué la transacción es obligatoria:** una venta escribe en tres tablas (`sales`, `product_sales`, `products`). Sin transacción, un fallo en la segunda escritura deja la primera hecha: venta sin ítems, o stock descontado sin venta. AC-3 existe precisamente para demostrar el rollback.
- **Por qué `reduceStock` está en la entidad:** la regla «el stock no puede quedar negativo» es del negocio, no de HTTP ni de la BD. Si estuviera en el controller, cualquier otro punto de entrada (un job, un seeder) podría violarla.
- Prepara los datos para AC-3 antes: dos productos, uno con `quantity = 5` y otro con `quantity = 1`.
- No existe «quién vende»: no hay usuarios en esta pista. Si la IA propone `userId` o login, se rechaza.

**Prompt por issue (ISS-06):** presenta **dos modos**; usa el que corresponda a tu asistente.

> **Uso:** en el **paso 6**, copia **tal cual** el prompt del modo elegido a la IA. En el **paso 7**, pega **ese mismo prompt** (sin recortes) en `trazabilidad/ISS-06.md` → **## 3. IA usada**.

#### Modo agente — la IA escribe el código directo sobre el proyecto

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

#### Modo chat IA — la IA te dicta comandos `cat > … <<'EOF'` para pegar en la terminal

> Con este modo **no** hace falta que la IA cree archivos: le pides el código como comandos de terminal y tú los copias y pegas en el workspace, uno tras otro.

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-06, no del backend entero.
NO edites archivos: responde SOLO con comandos de terminal listos para copiar y pegar.

Implementa los AC de trazabilidad/ISS-06.md siguiendo docs/Prompt.md. Sales + ProductSale es UN solo agregado.

Dominio: entidades PURAS Sale (id, saleDate, subtotal, tax, discounts, total, status, clientId, items) y
ProductSale (id, saleId, productId, quantity, unitPrice, total); servicio SaleCalculator
(subtotal = Σ quantity × unitPrice; total = subtotal + tax − discounts); ISaleRepository; SaleNotFoundException, EmptySaleException.
Reutiliza Product.reduceStock e InsufficientStockException de products.
Aplicación: CreateSaleDto (clientId requerido; items[] con @ArrayMinSize(1) y @ValidateNested de { productId, quantity > 0,
unitPrice? > 0 }; si unitPrice no viene se usa el precio actual del producto; tax, discounts ≥ 0 opcionales).
Use-case CreateSale: verifica cliente (IClientRepository → 404), carga productos (IProductRepository → 404),
llama product.reduceStock(qty) para TODOS los ítems antes de escribir nada (→ 409), calcula totales y persiste
Sale + ProductSale + products.quantity DENTRO DE UNA SOLA transacción Sequelize (sequelize.transaction, con lock por producto
y re-verificación del stock bajo bloqueo); cualquier error → rollback.
Infraestructura: SaleModel (sales) y ProductSaleModel (product_sales) en ALL_MODELS; SaleRepository que abre la transacción.
Presentación: POST /api/sales (201), GET /api/sales/:id (200 con items). Errores: 400 items vacíos; 404 cliente/producto; 409 stock.

Entrega, en este orden:
1. Los `mkdir -p …` de las carpetas de la feature.
2. Un comando `cat > <ruta> <<'EOF_ISS_06' … EOF_ISS_06` por cada archivo a crear o modificar, con el contenido COMPLETO.
3. Al final, tres listas: archivos tocados (solo código directo); cómo verificar cada AC (incluye el caso de dos ítems con rollback); qué quedó fuera de alcance.

Prohibido: Auth, Users, JWT Token, login, userId «para saber quién vende»; entidad que extienda Model; force: true.
NO adelantes ISS-07. NO toques docs/ ni trazabilidad/.
```

**Archivos creados o modificados (código directo)** — los que deben aparecer en la entrega de la IA; **no** cuentan dependencias instaladas (`npm i …`), `node_modules/`, `dist/` ni el esqueleto generado por CLI:

- `src/features/business/sales/domain/entities/sale.entity.ts` y `product-sale.entity.ts` — puras.
- `src/features/business/sales/domain/services/sale-calculator.ts`.
- `src/features/business/sales/domain/interfaces/sale.repository.ts`.
- `src/features/business/sales/domain/exceptions/sale-not-found.exception.ts` y `empty-sale.exception.ts`.
- `src/features/business/sales/application/dto/create-sale.dto.ts` (con `items[]` anidado y validado).
- `src/features/business/sales/application/mappers/sale.mapper.ts`.
- `src/features/business/sales/application/use-cases/create-sale.use-case.ts` y `get-sale-by-id.use-case.ts`.
- `src/features/business/sales/infrastructure/persistence/models/sale.model.ts` y `product-sale.model.ts` — tablas `sales` y `product_sales`.
- `src/features/business/sales/infrastructure/persistence/repositories/sale.repository.ts`.
- `src/features/business/sales/presentation/http/controllers/sales.controller.ts`.
- `src/features/business/sales/sales.module.ts`.
- `src/features/business/business.module.ts` (modificado) — registra `SalesModule`.
- `src/infrastructure/database/sequelize/sequelize.factory.ts` (modificado) — `ALL_MODELS` incluye `SaleModel` y `ProductSaleModel`.


---

## ISS-07 — Integración business y demo (cierra el proyecto)

**Resumen:** orquestador de seeders en orden, `README.md` real con libreto de demo, Swagger, confirmación de ausencia de Auth. El Gate de ISS-07 es el cierre del proyecto simple.

**Notas técnicas para verificar:**

- Para AC-1 recrea la BD **con SQL**, nunca con `force: true`:

```bash
mysql -u admin -p -e "DROP DATABASE IF EXISTS tecnogua_ia; CREATE DATABASE tecnogua_ia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

- Ejecuta el libreto de la demo (está en §1 de `trazabilidad/ISS-07.md`) tú mismo antes de mover a Revisión humana; el revisor lo repetirá contigo.
- El `README.md` es para un tercero: si tú necesitas explicar algo de viva voz para que arranque, falta en el README.

**Prompt por issue (ISS-07):** presenta **dos modos**; usa el que corresponda a tu asistente.

> **Uso:** en el **paso 6**, copia **tal cual** el prompt del modo elegido a la IA. En el **paso 7**, pega **ese mismo prompt** (sin recortes) en `trazabilidad/ISS-07.md` → **## 3. IA usada**.

#### Modo agente — la IA escribe el código directo sobre el proyecto

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-07, no del backend entero.

Implementa los AC de trazabilidad/ISS-07.md siguiendo docs/Prompt.md.

Seeders: orquestador en src/infrastructure/database/seeders que ejecute en orden clients → product-types → products,
idempotente en conjunto (arrancar dos veces deja los mismos conteos). Sales no se siembra.
README.md: reemplaza el boilerplate de Nest por: descripción, requisitos, creación de la BD, configuración de .env (referencia a .env.example),
arranque, endpoints, Swagger (/api/docs) y el libreto de la demo (cliente → tipo → producto quantity 5 → venta 2 → quantity 3 → venta 10 → 409).
Swagger en /api/docs con los cuatro recursos.
Verifica y reporta que NO existe src/features/auth ni src/config/jwt y que package.json no tiene @nestjs/jwt, passport, passport-jwt ni bcrypt.

Prohibido: Auth nuevo, demo de login, force: true. NO toques docs/ ni trazabilidad/.

Al final entrega tres listas: archivos tocados; cómo verifico cada AC; qué quedó fuera de alcance.
```

#### Modo chat IA — la IA te dicta comandos `cat > … <<'EOF'` para pegar en la terminal

> Con este modo **no** hace falta que la IA cree archivos: le pides el código como comandos de terminal y tú los copias y pegas en el workspace, uno tras otro.

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-07, no del backend entero.
NO edites archivos: responde SOLO con comandos de terminal listos para copiar y pegar.

Implementa los AC de trazabilidad/ISS-07.md siguiendo docs/Prompt.md.

Seeders: orquestador en src/infrastructure/database/seeders que ejecute en orden clients → product-types → products,
idempotente en conjunto (arrancar dos veces deja los mismos conteos). Sales no se siembra.
README.md: reemplaza el boilerplate de Nest por: descripción, requisitos, creación de la BD, configuración de .env
(referencia a .env.example), arranque, endpoints, Swagger (/api/docs) y el libreto de la demo
(cliente → tipo → producto quantity 5 → venta 2 → quantity 3 → venta 10 → 409).
Swagger en /api/docs con los cuatro recursos.
Verifica y reporta que NO existe src/features/auth ni src/config/jwt y que package.json no tiene @nestjs/jwt, passport, passport-jwt ni bcrypt.

Entrega, en este orden:
1. Los `mkdir -p …` de las carpetas nuevas.
2. Un comando `cat > <ruta> <<'EOF_ISS_07' … EOF_ISS_07` por cada archivo a crear o modificar, con el contenido COMPLETO.
3. Al final, tres listas: archivos tocados (solo código directo); cómo verificar cada AC; qué quedó fuera de alcance.

Prohibido: Auth nuevo, demo de login, force: true. NO toques docs/ ni trazabilidad/.
```

**Archivos creados o modificados (código directo)** — los que deben aparecer en la entrega de la IA; **no** cuentan dependencias instaladas (`npm i …`), `node_modules/`, `dist/` ni el esqueleto generado por CLI:

- `src/infrastructure/database/seeders/` — orquestador (p. ej. `seeders.runner.ts` o `index.ts`) que ejecuta `clients → product-types → products` en orden.
- `src/main.ts` (modificado) — arranca `SwaggerModule` en `/api/docs`.
- `README.md` (reemplazado) — descripción, requisitos, BD, `.env`, arranque, endpoints y libreto de demo.
- Sin archivo nuevo por la comprobación de Auth: solo se verifica que no existen `src/features/auth/` ni `src/config/jwt/` ni `@nestjs/jwt`/`passport`/`bcrypt` en `package.json`.


---

# Parte C — Cierre, errores que invalidan el método y convenciones

## Cierre del proyecto

El tablero debe tener **7 tarjetas en Hecho**, cada una con su `trazabilidad/ISS-XX.md` completo (§1–§6) y su commit `feat(iss-0N)` referenciando el Issue. Una tarjeta en En curso, Verificación o Revisión humana significa **proyecto no cerrado**, aunque el código «funcione».

## Errores que invalidan el método (checklist del revisor)

- Prompt «hazme todo el backend» o prompt de varias fases a la vez.
- El revisor dictando comandos de construcción (`nest new`, `mkdir`).
- Abrir el siguiente issue sin Gate del anterior.
- §3 con un relato en vez del prompt pegado.
- EVI = «la IA dijo que sí»; captura sin «Cómo reproducir».
- Revisión humana = mover la tarjeta sin fila en §5 ni preguntas de diseño.
- `sync({ force: true })` o `alter: true` en cualquier parte.
- Hecho marcado por el desarrollador o por la IA.
- Entidad de dominio que extiende `Model`.
- `.env` con credenciales en un commit.

## Convenciones de git usadas en esta pista

- **Conventional Commits:** `tipo(ámbito): descripción`. Tipos: `feat` (funcionalidad del issue), `fix` (corrección tras devolución), `docs` (solo trazabilidad/documentos), `chore` (infraestructura del repo). Ámbito: `iss-0N` o `dia-0`.
- **`Refs #n`** en la segunda línea del mensaje (`git commit -m "..." -m "Refs #n"`). Enlaza sin cerrar. **No** se usa `Closes #n`/`Fixes #n`: cerrar es el Gate humano.
- **Push después de cada commit** del issue: sin push, GitHub no muestra el enlace commit ↔ issue.
- **`.env` nunca se commitea.** Antes de cada commit: `git status` y confirmar que no aparece.
- Comandos útiles: `git log --oneline -5` (ver hashes), `git log -1 --format=%h` (hash corto del último commit para §4), `git status --short`.
