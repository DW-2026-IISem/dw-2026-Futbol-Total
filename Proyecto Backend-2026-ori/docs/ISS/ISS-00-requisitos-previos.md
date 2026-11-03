**🛠 Unidad ISS-00 · Requisitos previos** — capa **🛠 CONSTRUIR**

[🧠 Comprender este bloque →](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-00-aprendizaje/) · [📝 Evaluación](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-00-aprendizaje/#evaluacion) · [✅ GATE de la unidad](https://tecnogua.com/academic/site/backend2026/manual/01-ISS-00-requisitos/#criterios-de-aceptacion-iss-00)

| **Capa**         | **Página**                                                                                                                          | **Para qué**                             |
| :--------------- | :---------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------- |
| 🧠 **Aprender**  | [Requisitos previos](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-00-aprendizaje/)                                | comprender, explicar y relacionar        |
| 🛠 **Construir** | esta página                                                                                                                         | ejecutar, programar y verificar          |
| ✅ **GATE**       | [Condiciones de cierre](https://tecnogua.com/academic/site/backend2026/manual/01-ISS-00-requisitos/#criterios-de-aceptacion-iss-00) | condición para pasar al bloque siguiente |

**Esta es la guía ejecutable.** Sigue los pasos en orden. El cuerpo de abajo es el **ISS técnico verbatim**: comandos, rutas, versiones, PARCHEs, verificaciones y criterios, sin simplificar ni modernizar.

---

# Fase I: Business — ISS-00 — Requisitos previos

> **Contexto mínimo (autosuficiente).** Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que hay que saber antes de ejecutarlo.
>
> - **Proyecto:** `app-storelab-express-ii` — Express 5 + TypeScript + Sequelize, **arquitectura por features**, Fase I **solo Business** (sin auth ni roles).
> - **Recorrido obligatorio de una petición:** `HTTP → Controller → Service → Repository → Model → Sequelize → BD`. Ninguna capa se salta a la siguiente.
> - **Diseño de datos** (columnas, tipos, FK `RESTRICT`, índices, transacciones): [`../bd-storelab.md`](https://tecnogua.com/academic/site/backend2026/bd-storelab/), **Fase I — Business**.
> - **Capas, convenciones y reglas transversales:** [`00-contexto.md`](https://tecnogua.com/academic/site/backend2026/manual/00-contexto/).
>
> | **Este ISS**        |                                                                                                                        |
> | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
> | **Título**          | Requisitos previos                                                                                                     |
> | **Feature / tabla** | —                                                                                                                      |
> | **API**             | —                                                                                                                      |
> | **Depende de**      | ninguno (es el primero)                                                                                                |
> | **Habilita**        | [ISS-01 — Esqueleto del proyecto](https://tecnogua.com/academic/site/backend2026/manual/02-ISS-01-esqueleto-proyecto/) |

## Contenido de este ISS

- Criterios de aceptación (ISS-00)
- Pasos
- Verificación del ISS

---

**Objetivo:** entorno listo para el laboratorio.
**Bloqueado por:** ninguno.

### Criterios de aceptación (ISS-00)

- [ ] `node -v` muestra v20+ (lab: v24.x)
- [ ] `npm -v` responde
- [ ] Motor de BD accesible (MySQL recomendado para el primer `sync`)

### Pasos

```text
node -v
npm -v
```

### Verificación del ISS

```text
node -v && npm -v
```

---

> **✅ GATE de la unidad ISS-00** — *este bloque no añade ningún criterio nuevo.*
>
> Las condiciones de cierre son exactamente las que define el ISS técnico de esta misma página:
>
> - 📋 **Criterios de aceptación** → [Criterios de aceptación](https://tecnogua.com/academic/site/backend2026/manual/01-ISS-00-requisitos/#criterios-de-aceptacion-iss-00)
> - 🧠 **Autoevaluación** → [Evaluación del cuaderno](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-00-aprendizaje/#evaluacion)
>
> Con el GATE en verde queda habilitado **ISS-01 · Esqueleto del proyecto**.
>
> **Navegación de la ruta:** **←** [ISS-00 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-00-aprendizaje/) · [↑ Ruta Express](https://tecnogua.com/academic/site/backend2026/) · **→** [ISS-01 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-01-aprendizaje/)
