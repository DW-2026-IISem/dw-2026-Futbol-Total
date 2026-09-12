# Informe de evidencias — Backend Business con SDD + Kanban

**Repositorio:** `DW-2026-IISem/dw-2026-Futbol-Total`  
**Workspace:** `~/ia-lab/projecs/desarrollo web/Pedalibre-Desarrollo Web/dw-2026-Futbol-Total`  
**Metodología:** SDD + Kanban + asistencia de IA + revisión humana  
**Estado:** Día 0 completado; pendiente de crear el tablero y el Issue ISS-01.

## Día 0 — Preparación de trazabilidad y repositorio remoto

Se reorganizaron los materiales existentes en la carpeta `motores/` y se añadieron las siete plantillas de trazabilidad: `ISS-01.md` a `ISS-07.md`.

Se creó el commit inicial:

```text
f10a2e8 chore(dia-0): preparar trazabilidad inicial
```

El commit se envió correctamente al remoto `origin/main`.

### Evidencia 01 — Commit inicial y push exitoso

![Terminal: commit Día 0 y push a origin/main](evidencias/01-dia-0-commit-y-push.png)

**Cómo reproducir la verificación:**

```bash
git log -1 --oneline
git status --short
```

**Resultado esperado:** el historial debe incluir el commit `f10a2e8` y el repositorio debe sincronizarse con `origin/main`.

## Limpieza del workspace

Se eliminó el marcador obsoleto `proyecto/.gitkeep` y los metadatos de Windows `Zone.Identifier` asociados a las plantillas de trazabilidad. Se añadió este informe y su evidencia visual al repositorio.

### Evidencia 02 — Estado preparado para el commit de limpieza

![Terminal: archivos correctos preparados para commit](evidencias/02-limpieza-workspace.png)

**Resultado verificado:** se prepararon `Informe_Evidencias.md`, la evidencia del Día 0 y la eliminación de `proyecto/.gitkeep`; no quedaron archivos `Zone.Identifier`.
