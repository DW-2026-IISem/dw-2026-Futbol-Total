# ISS-02 — Entorno y BD multi-dialecto

**Responsable:** Oscar Vega  
**Revisor:** Oscar Vega  
**Kanban:** Preparado  
**Trazabilidad:** `proyecto/trazabilidad/ISS-02.md`  
**Naturaleza:** práctico (Business + Auth + RBAC)

---

## §1 SDD

### Objetivo
Configurar el entorno tipado (`.env` + validación) y la conexión Sequelize multi-dialecto (mysql | postgres | mssql | oracle), junto con logger y filtros globales básicos.

### Spec
- Puerto `3002` (ya existe de ISS-01)
- `.env` y `.env.example` con `DB_DIALECT` + bloques por motor
- Configuración tipada con `ConfigModule` + validación
- Módulo de base de datos en `infrastructure` que lee `DB_DIALECT`
- Sequelize se conecta según el dialecto elegido
- Logger y Exception Filter básicos en `common`
- `sync({ alter: false })` — nunca `force: true`
- No crear entidades de negocio todavía

### Criterios de Aceptación (AC)
- [ ] Existe `.env.example` documentado (sin secretos reales)
- [ ] Existe configuración tipada de entorno (`ConfigModule` + validación)
- [ ] Existe módulo de base de datos en `infrastructure` que lee `DB_DIALECT`
- [ ] Sequelize se conecta correctamente según el dialecto configurado
- [ ] Logger y/o Exception Filter globales están registrados
- [ ] `npm run start:dev` arranca sin error de conexión (o muestra error claro si la BD no está disponible)
- [ ] No hay modelos de Clients, Products, Users ni login

### Fuera de alcance
- Feature Clients
- ProductTypes, Products, Sales
- Users, Roles, JWT, login
- ISS-03 en adelante

---

## §2 Revisión de AC

| Fecha | Revisor | Tipo | Qué revisó | Evidencia | Decisión |
|-------|---------|------|------------|-----------|----------|
|       |         |      |            |           | pendiente |

---

## §3 IA usada

```text
Eres asistente SOLO de ISS-02, no del backend entero.

Implementa los AC de trazabilidad/ISS-02.md.
Sigue docs/prompt-business_auth_rbac.md (Clean Architecture).
Puedes consultar docs/creacion_backend_manual.md como referencia;
NO copies un manual comando a comando y NO adelantes ISS-03.

Debes:
- Configurar entorno tipado (.env + .env.example + ConfigModule)
- Conexión Sequelize multi-dialecto (mysql | postgres | mssql | oracle) según DB_DIALECT
- Logger y Exception Filter básicos en common
- sync({ alter: false }) — nunca force: true
- No crear modelos de negocio ni login

Este directorio ya tiene .git, docs/ y trazabilidad/. No borres trazabilidad/ ni el trabajo de ISS-01.

Al final lista: archivos tocados, cómo verifico cada AC, qué quedó fuera de alcance.
---

**Parte 4 — §4 + §5 + §6**

```markdown
---

## §4 EVI (Verificación)

| Fecha | Tipo | Resultado | Auténtica | Notas |
|-------|------|-----------|-----------|-------|
|       |      |           |           |       |

---

## §5 Revisión del resultado

| Fecha | Revisor | Resultado | Observaciones |
|---------|---------|-----------|---------------|
|         |         |           |               |

---

## §6 Gate

**Estado:** pendiente  
**Conclusión:**  
**Hash commit:**
```
