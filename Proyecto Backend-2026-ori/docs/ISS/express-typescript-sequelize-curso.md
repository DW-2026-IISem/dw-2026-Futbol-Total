# Express + TypeScript + Sequelize

> **Objetivo del curso.** Construir un backend real —proyecto `app-storelab-express-ii`— con **Express 5 + TypeScript + Sequelize**, arquitectura **por *features*** y un recorrido de petición que no se salta ninguna capa:
>
> `HTTP → Controller → Service → Repository → Model → Sequelize → BD`

El curso avanza por **bloques encadenados** (*ISS-X*). Cada bloque se estudia en dos capas y se cierra con una **compuerta (GATE)**: solo entonces se abre el siguiente.

```text
                 ISS-X
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
    🧠 APRENDER          🛠 CONSTRUIR
     comprender            ejecutar
     explicar              programar
     relacionar            verificar
        └──────────┬──────────┘
                   ▼
                  GATE
                   │
                   ▼
                ISS-X+1
```

## Cómo está organizada cada unidad

| **Capa**         | **Qué es**                                                                                                                           | **Página**                        |
| :--------------- | :----------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------- |
| 🧠 **Aprender**  | El **cuaderno pedagógico**: el *por qué* — explicaciones, código comentado, mapas, anatomía, flujos, diagnóstico, evaluación y GATE. | `aprendizaje/<ID>-aprendizaje.md` |
| 🛠 **Construir** | El **ISS técnico**: la guía ejecutable — comandos, rutas, versiones, PARCHEs, verificaciones y criterios de aceptación.              | `manual/<NN>-….md`                |
| ✅ **GATE**      | La **condición de cierre** de la unidad, definida por el propio ISS técnico.                                                         | al final de *Construir*           |

> **Autoridad del contenido.** El **ISS técnico** es la fuente autoritativa y de solo lectura. Las páginas de *Aprender* y *Construir* se publican **íntegras y verbatim**, por inclusión de *snippets* (`--8<--`) desde `material/express/iss/`: el contenido existe una sola vez en el repositorio, no se resume ni se reescribe, y corregirlo en su origen actualiza el sitio.

## Ruta de las unidades

> Los dos **cierres** aparecen en su posición real dentro de la secuencia: el cierre de **Fase I (Business)** va **al terminar el ISS-08**, antes de empezar la Fase II de autenticación; el cierre de **Fase II (Auth con RBAC)** va **al terminar el ISS-15**.

| **Fase**           | **Bloque**          | **Título**                                        | **🧠 Aprender**                                                                                        | **🛠 Construir**                                                                                                |
| :----------------- | :------------------ | :------------------------------------------------ | :----------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| I · Business       | **ISS-00**          | Requisitos previos                                | [🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-00-aprendizaje/)          | [🛠 Construir](https://tecnogua.com/academic/site/backend2026/manual/01-ISS-00-requisitos/)                     |
| I · Business       | **ISS-01**          | Esqueleto del proyecto                            | [🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-01-aprendizaje/)          | [🛠 Construir](https://tecnogua.com/academic/site/backend2026/manual/02-ISS-01-esqueleto-proyecto/)             |
| I · Business       | **ISS-02**          | Infraestructura de base de datos                  | [🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-02-aprendizaje/)          | [🛠 Construir](https://tecnogua.com/academic/site/backend2026/manual/03-ISS-02-infraestructura-bd/)             |
| I · Business       | **ISS-03**          | Feature Client (CRUD por capas)                   | [🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-03-aprendizaje/)          | [🛠 Construir](https://tecnogua.com/academic/site/backend2026/manual/04-ISS-03-client-crud/)                    |
| I · Business       | **ISS-04**          | Seeders con Faker                                 | [🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-04-aprendizaje/)          | [🛠 Construir](https://tecnogua.com/academic/site/backend2026/manual/05-ISS-04-seeders-faker/)                  |
| I · Business       | **ISS-05**          | Swagger / OpenAPI                                 | [🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-05-aprendizaje/)          | [🛠 Construir](https://tecnogua.com/academic/site/backend2026/manual/06-ISS-05-swagger/)                        |
| I · Business       | **ISS-06**          | Feature ProductType                               | [🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-06-aprendizaje/)          | [🛠 Construir](https://tecnogua.com/academic/site/backend2026/manual/07-ISS-06-product-type/)                   |
| I · Business       | **ISS-07**          | Feature Product                                   | [🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-07-aprendizaje/)          | [🛠 Construir](https://tecnogua.com/academic/site/backend2026/manual/08-ISS-07-product/)                        |
| I · Business       | **ISS-08**          | Feature Sale + ProductSale                        | [🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-08-aprendizaje/)          | [🛠 Construir](https://tecnogua.com/academic/site/backend2026/manual/09-ISS-08-sale-product-sale/)              |
| I · Business       | **CIERRE-BUSINESS** | Cierre Fase I — Business (sin Auth)               | [🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/CIERRE-BUSINESS-aprendizaje/) | [🛠 Construir](https://tecnogua.com/academic/site/backend2026/manual/10-cierre-business/)                       |
| II · Auth con RBAC | **ISS-09**          | Auth base (seguridad y modelos)                   | [🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-09-aprendizaje/)          | [🛠 Construir](https://tecnogua.com/academic/site/backend2026/manual/11-ISS-09-auth-base/)                      |
| II · Auth con RBAC | **ISS-10**          | Feature Users (identidad y contraseña)            | [🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-10-aprendizaje/)          | [🛠 Construir](https://tecnogua.com/academic/site/backend2026/manual/12-ISS-10-auth-users/)                     |
| II · Auth con RBAC | **ISS-11**          | Features Roles y Resources                        | [🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-11-aprendizaje/)          | [🛠 Construir](https://tecnogua.com/academic/site/backend2026/manual/13-ISS-11-auth-roles-resources/)           |
| II · Auth con RBAC | **ISS-12**          | Features RoleUsers y ResourceRoles                | [🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-12-aprendizaje/)          | [🛠 Construir](https://tecnogua.com/academic/site/backend2026/manual/14-ISS-12-auth-role-users-resource-roles/) |
| II · Auth con RBAC | **ISS-13**          | Middlewares de acceso y las 3 modalidades         | [🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-13-aprendizaje/)          | [🛠 Construir](https://tecnogua.com/academic/site/backend2026/manual/15-ISS-13-auth-access/)                    |
| II · Auth con RBAC | **ISS-14**          | Feature RefreshTokens (sesiones)                  | [🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-14-aprendizaje/)          | [🛠 Construir](https://tecnogua.com/academic/site/backend2026/manual/16-ISS-14-auth-refresh-tokens/)            |
| II · Auth con RBAC | **ISS-15**          | Feature Session (login y perfil)                  | [🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-15-aprendizaje/)          | [🛠 Construir](https://tecnogua.com/academic/site/backend2026/manual/17-ISS-15-auth-session/)                   |
| II · Auth con RBAC | **CIERRE-AUTH**     | Cierre Fase II — Auth con RBAC (backend completo) | [🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/CIERRE-AUTH-aprendizaje/)     | [🛠 Construir](https://tecnogua.com/academic/site/backend2026/manual/18-cierre-auth/)                           |

## El GATE

Cada unidad se cierra con un **GATE**: la condición que el propio ISS técnico exige para dar el bloque por terminado y poder pasar al siguiente. **No se añaden criterios nuevos**: el GATE se deriva exclusivamente del ISS técnico de la unidad.

El GATE se comprueba **en la página de *Construir***, al final, apoyándose en tres cosas del propio ISS:

1. sus **criterios de aceptación** (o el **DoD** del laboratorio, en los cierres);
2. su **verificación** (por ejemplo, `npx tsc --noEmit` en el ISS-01);
3. su **cierre** (por ejemplo, arrancar el servidor con `npm run dev`).

> **Anterior → Siguiente.** Al pie de cada página, la navegación de la ruta recorre la unidad en el orden *Aprender → Construir* y continúa con el *Aprender* del bloque siguiente. La compuerta que hay en medio es el GATE.

## Evaluación

Las secciones de **evaluación** presentan **únicamente los interrogantes**: el estudiante los resuelve por su cuenta. El sitio no despliega respuestas automáticas ni soluciones añadidas por la integración.

## Esquema del ciclo ISS-X

```text
                 ISS-X
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
    🧠 APRENDER          🛠 CONSTRUIR
     comprender            ejecutar
     explicar              programar
     relacionar            verificar
        └──────────┬──────────┘
                   ▼
                  GATE
                   │
                   ▼
                ISS-X+1
```

> **Interpretación del esquema:** cada bloque ISS-X se trabaja en dos capas complementarias: **Aprender**, para comprender, explicar y relacionar; y **Construir**, para ejecutar, programar y verificar. Ambas convergen en el **GATE**, que habilita el paso al siguiente bloque, **ISS-X+1**.
