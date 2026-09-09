# ISS-01 — Esqueleto NestJS CA arrancable

**Responsable:** Oscar Vega  
**Revisor:** (pendiente)  
**Kanban:** Preparado  
**Trazabilidad:** `proyecto/trazabilidad/ISS-01.md`  
**Naturaleza:** práctico (Business + Auth + RBAC)

---

## §1 SDD

### Objetivo
Tener un proyecto NestJS arrancable con la estructura Clean Architecture base (config, common, infrastructure, features/business y features/auth stub).

### Spec
- Puerto `3002`
- Árbol de carpetas Clean Architecture
- `npm run start:dev` levanta sin error
- Este directorio ya tiene `.git`, `docs/` y `trazabilidad/`. No borrar `trazabilidad/`.

### Criterios de Aceptación (AC)
- [ ] Existen `package.json` y `src/`
- [ ] Arranca en el puerto `3002`
- [ ] Existe el árbol: `src/config`, `src/common`, `src/infrastructure`, `src/features/business`, `src/features/auth`
- [ ] `features/business` y `features/auth` están como stub (módulos vacíos)
- [ ] No hay Sequelize de negocio ni login

### Fuera de alcance
- Sequelize de negocio
- Clients
- Login / JWT
- ISS-02 en adelante

---

## §2 Revisión de AC

| Fecha | Revisor | Tipo | Qué revisó | Evidencia | Decisión |
|-------|---------|------|------------|-----------|----------|
|  |  |  |  |  | pendiente |

---

## §3 IA usada

```text
Eres asistente SOLO de ISS-01, no del backend entero.

Implementa los AC de trazabilidad/ISS-01.md.
Sigue docs/prompt-business_auth_rbac.md (Clean Architecture).
Puedes consultar docs/creacion_backend_manual.md como referencia de fases 1–3;
NO copies un manual comando a comando y NO adelantes ISS-02.

Debe arrancar y existir el árbol
config / common / infrastructure / features/business y features/auth (stub).
Este directorio ya tiene .git, docs/ y trazabilidad/. No borres trazabilidad/.

Al final lista: archivos tocados, cómo verifico cada AC, qué quedó fuera de alcance.
```

---

## §4 EVI (Verificación)

| Fecha | Tipo | Resultado | Auténtica | Notas |
|-------|------|-----------|-----------|-------|
|  |  |  |  |  |

---

## §5 Revisión del resultado

| Fecha | Revisor | Resultado | Observaciones |
|-------|---------|-----------|---------------|
|  |  |  |  |

---

## §6 Gate

**Estado:** pendiente  
**Conclusión:**  
**Hash commit:**