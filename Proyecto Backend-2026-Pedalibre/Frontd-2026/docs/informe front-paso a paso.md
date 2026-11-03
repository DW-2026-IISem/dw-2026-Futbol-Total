# Informe del frontend PedalLibre — paso a paso

## Propósito y forma de trabajo

En este informe registro por etapas lo que realizo para construir el frontend de PedalLibre. Primero describo mi procedimiento y reúno la evidencia real en `../trazabilidad/`. Al final de cada etapa anoto los resultados que observé, lo que aprendí y mi retroalimentación. Solo registro como realizado lo que ejecuté y comprobé; oculto los datos sensibles de las capturas.

Uso exclusivamente las comprobaciones y evidencias de PedalLibre y su backend. El texto original que conservo al final del ISS-00 es material de referencia; no utilizo sus credenciales, rutas, puertos ni resultados para validar este proyecto.

## Ruta de trabajo

| Fase | ISS | Estado |
|---|---|---|
| Preparación | [ISS-00 — Requisitos previos](./ISS-00-Requisitos-previos.md) | Completado |
| Construcción inicial | [ISS-01 — Bootstrap Angular](./ISS-01-Bootstrap-Angular.md) | Pendiente |

## Paso 1 — ISS-00: Requisitos previos

**Estado:** completado.

### Objetivo

Preparar el entorno antes de crear código Angular y comprobar el acceso al backend de PedalLibre.

### Procedimiento

1. Consulté las versiones de Node.js, npm y Angular CLI, y revisé los requisitos de Node del CLI.
2. Desde la terminal del backend ejecuté la instalación de dependencias y la siembra RBAC.
3. Inicié el backend y consulté `/api/clientes` sin token.
4. Con el backend activo, inicié sesión como `admin` y consulté su perfil y permisos.
5. Revisé la ruta de `ng`, la configuración local del backend y las tablas de `Proyecto-Pedalibre-DW`.
6. Probé abrir la API desde WSL con `xdg-open`. Como no encontró navegador, abrí la dirección desde el navegador de Windows.
7. Abrí DevTools y recargué la página con Network seleccionado.

### Evidencia visual

Guardé las capturas del procedimiento en `../trazabilidad/` y las incorporo aquí:

1. Versiones de Node, npm y Angular CLI:

   ![ISS-00 — versiones de Node, npm y Angular CLI](../trazabilidad/E-FRONT-ISS-00-01-node-npm-angular-cli.png)

2. Versiones y requisitos de Angular CLI:

   ![ISS-00 — requisitos de Angular CLI](../trazabilidad/E-FRONT-ISS-00-02-angular-cli-engines.png)

3. Instalación y siembra en curso:

   ![ISS-00 — siembra en progreso](../trazabilidad/E-FRONT-ISS-00-03-seed-en-progreso.png)

4. Seeder completado e inicio del backend:

   ![ISS-00 — siembra y servidor](../trazabilidad/E-FRONT-ISS-00-04-seed-y-servidor.png)

5. Endpoint de clientes sin token:

   ![ISS-00 — API de clientes responde 401](../trazabilidad/E-FRONT-ISS-00-05-api-clientes-401.png)

6. Login de administrador, perfil y permisos efectivos:

   ![ISS-00 — login, perfil y permisos del administrador](../trazabilidad/E-FRONT-ISS-00-06-login-perfil-permisos-admin.png)

7. Ruta de `ng` y configuración del backend:

   ![ISS-00 — ruta de Angular CLI y configuración](../trazabilidad/E-FRONT-ISS-00-07-ng-y-config-backend.png)

8. Tablas del esquema PedalLibre en MySQL:

   ![ISS-00 — tablas de Proyecto-Pedalibre-DW](../trazabilidad/E-FRONT-ISS-00-08-base-pedalibre-tablas.png)

9. Intento de apertura de la API desde WSL:

   ![ISS-00 — xdg-open no encontró navegador en WSL](../trazabilidad/E-FRONT-ISS-00-09-xdg-open-wsl.png)

10. Respuesta del endpoint en el navegador de Windows:

   ![ISS-00 — API de clientes en navegador sin token](../trazabilidad/E-FRONT-ISS-00-10-api-clientes-navegador.png)

11. DevTools con Console disponible:

   ![ISS-00 — DevTools Console](../trazabilidad/E-FRONT-ISS-00-11-devtools-console.png)

12. DevTools con Network disponible antes de recargar:

   ![ISS-00 — DevTools Network antes de recargar](../trazabilidad/E-FRONT-ISS-00-12-devtools-network.png)

13. DevTools Network después de recargar:

   ![ISS-00 — DevTools Network tras recarga](../trazabilidad/E-FRONT-ISS-00-13-devtools-network-reload.png)

### Resultado

Comprobé Node.js `v24.21.0`, npm `12.2.1` y Angular CLI `22.2.5`; `command -v ng` apunta a la instalación administrada por `nvm`. Revisé la configuración de MySQL en el puerto `3306`, la base `Proyecto-Pedalibre-DW` y las tablas del esquema. El seeder RBAC terminó, el backend escuchó en el puerto `3002` y `/api/clientes` respondió `401` sin token. El login, el perfil y la consulta de permisos respondieron HTTP 200; la lista de permisos contenía 84 elementos. En el navegador recibí el mensaje de token ausente o inválido. Abrí Console y Network; al recargar, Network registró una solicitud. La captura no muestra sus detalles, por lo que no afirmo que inspeccioné las cabeceras.

### Lo que aprendí

Aprendí que debo comprobar una ruta real de la API y no la raíz del servidor, y que WSL y el navegador de Windows son entornos distintos: `xdg-open` no encontró navegador, pero pude abrir la API desde Windows. También comprobé el flujo de login, perfil y permisos de PedalLibre. Revisaré las cabeceras de autorización cuando implemente solicitudes autenticadas desde el frontend.

### Retroalimentación personal

Me resultó útil avanzar comprobación por comprobación y conservar evidencia de lo que observé. Mi primer intento de login falló porque el backend no estaba activo; lo repetí después de iniciarlo y las consultas fueron exitosas. Con esta preparación completé ISS-00 sin crear todavía código Angular.

## Paso 2 — ISS-01: Bootstrap Angular

**Estado:** pendiente de ejecución. Registraré el procedimiento, la evidencia y, al final, los resultados y aprendizajes cuando realice este ISS.

### Objetivo

Crear Angular en la carpeta `Frontd-2026`, integrar Tailwind CSS y PrimeNG en versiones compatibles con el CLI del entorno, y preparar una pantalla de arranque propia de PedalLibre, sin conectar todavía con la API.

### Procedimiento

Pendiente. Lo completaré cuando ejecute ISS-01.

### Evidencia visual

Pendiente. Guardaré las capturas reales en `../trazabilidad/` y las insertaré aquí después de realizar el procedimiento.

### Resultado

Pendiente de ejecución.

### Lo que aprendí

Lo completaré después de ejecutar el ISS y verificar el resultado.

### Retroalimentación personal

La escribiré al final del paso, a partir de lo que realice y observe.

### Estado del paso

**Pendiente de ejecución.**
