# ISS-03 — Clients (patrón completo)

**Responsable:** Oscar Vega  
**Revisor:** Oscar Vega  
**Kanban:** Preparado  
**Trazabilidad:** `proyecto/trazabilidad/ISS-03.md`  
**Naturaleza:** práctico (Business + Auth + RBAC)

---

## §1 SDD

### Objetivo
Implementar el feature **Clients** completo con Clean Architecture: entidad de dominio, use-cases, repositorio, modelo Sequelize, controller, DTO, seeder y endpoint POST funcional.

### Spec
- Feature `clients` dentro de `features/business`
- Entidad de dominio pura (TypeScript, sin `extends Model`)
- `@Table` solo en `infrastructure/persistence/models`
- Use-cases orquestan; controller delgado
- Interface del repositorio en `domain/interfaces`
- Implementación del repositorio en infrastructure
- Seeder de clientes de demo
- Endpoint `POST /api/clients` (o la ruta que defina el patrón) válido
- Sin JWT todavía (eso es ISS-13+)

### Criterios de Aceptación (AC)
- [ ] Existe feature clients con capas CA (domain, application, infrastructure, presentation)
- [ ] Entidad de dominio sin dependencia de Sequelize
- [ ] Modelo Sequelize con `@Table` solo en infrastructure
- [ ] Repositorio con interface + implementación
- [ ] Al menos un use-case de creación (CreateClient)
- [ ] Controller con endpoint de creación
- [ ] Seeder de clients carga datos demo
- [ ] `POST` de client válido responde 201 (o 200 según convención)
- [ ] No hay ProductTypes, Products, Sales, Users ni login

### Fuera de alcance
- ProductTypes
- Products, Sales
- Users, Roles, JWT, login
- Guards RBAC
- ISS-04 en adelante
---

## §2 Revisión de AC

| Fecha | Revisor | Tipo | Qué revisó | Evidencia | Decisión |
|-------|---------|------|------------|-----------|----------|
|       |         |      |            |           | pendiente |

---

## §3 IA usada

```text
Eres asistente SOLO de ISS-03, no del backend entero.

Implementa los AC de trazabilidad/ISS-03.md.
Sigue docs/prompt-business_auth_rbac.md (Clean Architecture).
Puedes consultar docs/creacion_backend_manual.md como referencia;
NO copies un manual comando a comando y NO adelantes ISS-04.

Debes implementar el feature Clients completo:
- Entidad de dominio pura (sin extends Model)
- @Table solo en infrastructure/persistence/models
- Use-cases, repositorio (interface + impl), controller, DTOs
- Seeder de clients demo
- Endpoint POST de creación funcional
- No JWT, no ProductTypes, no login

Este directorio ya tiene .git, docs/ y trazabilidad/. No borres trazabilidad/ ni el trabajo de ISS-01 e ISS-02.

Al final lista: archivos tocados, cómo verifico cada AC, qué quedó fuera de alcance.


---

### Parte 4 — §4 + §5 + §6

```markdown
---

## §4 EVI (Verificación)

| Fecha | Tipo | Resultado | Auténtica | Notas |
|-------|------|-----------|-----------|-------|
|       |      |           |           |       |

---

## §5 Revisión del resultado

| Fecha | Revisor | Resultado | Observaciones |
|-------|---------|-----------|---------------|
|       |         |           |               |

---

## §6 Gate

**Estado:** pendiente  
**Conclusión:**  
**Hash commit:**