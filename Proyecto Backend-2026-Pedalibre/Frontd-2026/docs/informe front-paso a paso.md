# Informe del frontend PedalLibre — paso a paso

## Propósito y forma de trabajo

En este informe registro por etapas lo que realizo para construir el frontend de PedalLibre. Primero describo mi procedimiento y reúno la evidencia real en `../trazabilidad/`. Al final de cada etapa anoto los resultados que observé, lo que aprendí y mi retroalimentación. Solo registro como realizado lo que ejecuté y comprobé; oculto los datos sensibles de las capturas.

Uso exclusivamente las comprobaciones y evidencias de PedalLibre y su backend. El texto original que conservo al final del ISS-00 es material de referencia; no utilizo sus credenciales, rutas, puertos ni resultados para validar este proyecto.

## Ruta de trabajo

| Fase | ISS | Estado |
|---|---|---|
| Preparación | [ISS-00 — Requisitos previos](./ISS-00-Requisitos-previos.md) | Completado |
| Construcción inicial | [ISS-01 — Bootstrap Angular](./ISS-01-Bootstrap-Angular.md) | Completado |
| Esqueleto visual | ISS-01A e ISS-01B — Header, Aside, Footer y navegación | Pendiente |
| Núcleo del frontend | [ISS-02 — Núcleo: environment, modelos, servicios y layout](./ISS-02-Nucleo-Frontend.md) | Pendiente; depende de ISS-01A e ISS-01B |

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

**Estado:** completado. Generé el workspace, instalé las dependencias, configuré Aura, implementé la portada de PedalLibre y actualicé los metadatos de `src/index.html`. El build y las dos pruebas terminan correctamente.

### Objetivo

Crear Angular en la carpeta `Frontd-2026`, integrar Tailwind CSS y PrimeNG en versiones compatibles con el CLI del entorno, y preparar una pantalla de arranque propia de PedalLibre, sin conectar todavía con la API.

### Procedimiento

1. Confirmé desde la terminal que estaba en `Frontd-2026` y que ya existían `docs/` y `trazabilidad/`.
2. Ejecuté `ng new pedalibre-frontend --directory . --style=tailwind --routing --ssr=false --skip-git --package-manager=npm --defaults` para crear el workspace en la carpeta actual.
3. Comprobé que se conservaron `docs/` y `trazabilidad/` y que los archivos de Angular quedaron en la raíz.
4. Consulté `ng version` y los peers publicados de PrimeNG para revisar su compatibilidad con Angular 22.
5. Instalé PrimeNG, Aura, PrimeIcons y Angular CDK, y revisé las versiones con `npm ls`.
6. Actualicé `src/styles.css` con las capas CSS, Tailwind y PrimeIcons.
7. Configuré `providePrimeNG` con el preset Aura y las capas CSS en `src/app/app.config.ts`; ejecuté el build y abrí la aplicación.
8. Reemplacé la plantilla inicial por una portada local de PedalLibre y actualicé la prueba de `App`.
9. Ejecuté las comprobaciones de build y pruebas, repetí el runner en modo de una sola ejecución y revisé la consola del navegador y los metadatos de `src/index.html`.
10. Cambié el idioma de `src/index.html` a español, definí el título `PedalLibre` y añadí una descripción del frontend.
11. Volví a ejecutar build y pruebas después del cambio de metadatos.

### Evidencia visual

Guardé las capturas recibidas en `../trazabilidad/` y las incorporo aquí. Las seis primeras corresponden al avance inicial:

1. Estado de `Frontd-2026` antes de generar el workspace:

   ![ISS-01 — estructura previa del frontend](../trazabilidad/E-FRONT-ISS-01-01-estructura-previa.png)

2. Creación de Angular CLI y generación de sus archivos:

   ![ISS-01 — creación del workspace con Angular CLI](../trazabilidad/E-FRONT-ISS-01-02-creacion-angular-cli.png)

3. Verificación de que se conservaron las carpetas y que los archivos Angular quedaron en la raíz:

   ![ISS-01 — verificación de la estructura del workspace](../trazabilidad/E-FRONT-ISS-01-03-verificacion-workspace.png)

4. Versiones de Angular y peers declarados por PrimeNG:

   ![ISS-01 — versiones y compatibilidad de peers](../trazabilidad/E-FRONT-ISS-01-04-versiones-y-peers.png)

5. Instalación y versiones resueltas de PrimeNG, Aura, PrimeIcons y Angular CDK:

   ![ISS-01 — instalación de dependencias](../trazabilidad/E-FRONT-ISS-01-05-instalacion-dependencias.png)

6. Imports de Tailwind y PrimeIcons y orden de capas en `src/styles.css`:

   ![ISS-01 — estilos globales](../trazabilidad/E-FRONT-ISS-01-06-estilos-globales.png)

Las siguientes capturas documentan la configuración, la portada y las verificaciones:

7. Configuración de PrimeNG con Aura y capas en `app.config.ts`:

   ![ISS-01 — configuración de PrimeNG y Aura](../trazabilidad/E-FRONT-ISS-01-07-configuracion-primeng-aura.png)

8. Build de producción completado:

   ![ISS-01 — build de producción](../trazabilidad/E-FRONT-ISS-01-08-build-produccion.png)

9. Primera visualización de la plantilla del CLI y aviso de licencia:

   ![ISS-01 — plantilla Angular inicial](../trazabilidad/E-FRONT-ISS-01-09-pantalla-inicial-cli.png)

10. Console con aviso de licencia y consulta de la variable CSS del tema:

   ![ISS-01 — consola, tema y aviso de licencia](../trazabilidad/E-FRONT-ISS-01-10-console-tema-y-licencia.png)

11. Componente raíz `App` después de retirar la plantilla:

   ![ISS-01 — componente App](../trazabilidad/E-FRONT-ISS-01-11-componente-app.png)

12. Portada PedalLibre renderizada mientras se edita la plantilla:

   ![ISS-01 — portada PedalLibre](../trazabilidad/E-FRONT-ISS-01-12-portada-pedallibre.png)

13. Pruebas actualizadas del componente:

   ![ISS-01 — prueba de App](../trazabilidad/E-FRONT-ISS-01-13-prueba-app.png)

14. Runner muestra dos pruebas aprobadas:

   ![ISS-01 — pruebas reportadas como aprobadas](../trazabilidad/E-FRONT-ISS-01-14-pruebas-aprobadas.png)

15. Portada servida en `http://localhost:4200`:

   ![ISS-01 — portada en el servidor local](../trazabilidad/E-FRONT-ISS-01-15-portada-servidor-local.png)

16. `src/index.html` conserva aún idioma y título predeterminados:

   ![ISS-01 — metadatos de index.html pendientes de adaptar](../trazabilidad/E-FRONT-ISS-01-16-index-html-pendiente.png)

17. Terminal con la secuencia de comandos de verificación:

   ![ISS-01 — ejecución de verificaciones](../trazabilidad/E-FRONT-ISS-01-17-ejecucion-verificaciones.png)

18. Build y pruebas durante la verificación:

   ![ISS-01 — build y pruebas](../trazabilidad/E-FRONT-ISS-01-18-build-y-pruebas.png)

19. Salida de build y estado del runner:

   ![ISS-01 — salida de build y pruebas](../trazabilidad/E-FRONT-ISS-01-19-salida-build-pruebas.png)

20. Primer intento: el runner en modo watch reportó las pruebas y después terminó con un error de deadlock:

   ![ISS-01 — deadlock del runner de pruebas](../trazabilidad/E-FRONT-ISS-01-20-deadlock-runner-pruebas.png)

21. `src/index.html` ya declara `lang="es"`; build y las dos pruebas terminan correctamente. El título predeterminado aún está pendiente de cambiar:

   ![ISS-01 — idioma en español, build y pruebas aprobados](../trazabilidad/E-FRONT-ISS-01-21-lang-es-build-pruebas.png)

22. `src/index.html` actualizado con idioma, título y descripción de PedalLibre:

   ![ISS-01 — metadatos de PedalLibre](../trazabilidad/E-FRONT-ISS-01-22-index-html-pedallibre.png)

23. Build de producción y las dos pruebas finalizan correctamente después de actualizar los metadatos:

   ![ISS-01 — build y pruebas finales aprobados](../trazabilidad/E-FRONT-ISS-01-23-build-pruebas-finales.png)

### Resultado

Generé el workspace Angular en `Frontd-2026` y comprobé que los archivos principales quedaron en la raíz y que las carpetas de documentación y trazabilidad permanecieron. La terminal muestra Angular CLI `22.2.5` y Angular `22.2.4`. Consulté PrimeNG `22.1.4`, cuyos peers requieren Angular y Angular CDK `^22.1.0`; instalé PrimeNG `22.1.4`, `@primeuix/themes` `3.1.0`, PrimeIcons `8.0.2` y Angular CDK `22.2.5`. La salida de instalación indicó cero vulnerabilidades en esa ejecución. Configuré PrimeNG con Aura y confirmé en DevTools que `--p-primary-color` devuelve un valor. La consola muestra `[PrimeUI] PrimeUI license is not configured` y la interfaz muestra `Invalid PrimeUI License`; lo registré como aviso de licencia, no como error del build. Reemplacé la pantalla de bienvenida por una portada PedalLibre que indica que la integración con la API está pendiente. Actualicé `src/index.html` con `lang="es"`, el título `PedalLibre` y una descripción del frontend. Tras ese cambio, `npm run build` completó y `npm test -- --watch=false` terminó con 1 archivo y 2 pruebas aprobadas. Con esta evidencia cerré ISS-01.

### Lo que aprendí

Comprobé que `--directory .` permite generar Angular en la carpeta de trabajo sin crear otra carpeta de proyecto, y que conviene verificar las carpetas existentes antes de ejecutar el CLI. También confirmé la compatibilidad de PrimeNG revisando sus peers antes de instalarlo, en lugar de suponerla por el número de versión. Aprendí además a distinguir el aviso de licencia de PrimeUI de los errores de compilación, y que `--watch=false` permite una ejecución de pruebas que termina con un resultado y código de salida verificables.

### Retroalimentación personal

La salida del CLI y las verificaciones de terminal me permitieron avanzar por etapas y conservar evidencia concreta. Aprendí que una comprobación final debe repetirse después de editar los metadatos para verificar el estado real de la entrega.

### Estado del paso

**Completado.** La portada, los metadatos, el build y las pruebas están verificados.
