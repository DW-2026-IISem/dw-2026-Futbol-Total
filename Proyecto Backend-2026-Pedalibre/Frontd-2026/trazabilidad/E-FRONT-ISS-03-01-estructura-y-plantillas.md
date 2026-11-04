# E-FRONT-ISS-03-01 — Estructura, implementación y verificación

Fecha de recepción: 3-nov-2026  
Proyecto: PedalLibre  
Workspace: `Frontd-2026`  
Fuente: cinco capturas proporcionadas por el usuario

## Alcance que muestran las capturas

1. [Criterios y prerrequisitos](./E-FRONT-ISS-03-01-criterios-y-prerrequisitos.png): el documento ISS-03 y sus criterios aún sin marcar; se ve el bloque de verificación previa.
2. [Generación de componentes](./E-FRONT-ISS-03-02-generacion-componentes.png): salida de Angular CLI creando `client-list` y `client-form`, incluidas sus plantillas, estilos, TypeScript y pruebas scaffold.
3. [Filtro local](./E-FRONT-ISS-03-03-filtro-local.png): contenido de `filter-clients.ts`, que busca en nombre, apellido, documento, correo y teléfono y tolera contactos nulos.
4. [Plantilla del formulario](./E-FRONT-ISS-03-04-plantilla-formulario.png): HTML con Reactive Forms, campos del dominio y límites de longitud.
5. [Plantilla de listado](./E-FRONT-ISS-03-05-plantilla-listado.png): HTML con filtro, tabla, acciones de lista y diálogo de edición/creación.

## Límites de la evidencia inicial

Estas capturas acreditan estructura generada y archivos visibles en el editor, no que la implementación esté completa o compilable. En la copia inspeccionada al registrar esta evidencia, `client-form.ts` y `client-list.ts` aún contienen las clases scaffold vacías. No se aporta salida de pruebas o build ni captura de la ruta `/clientes` funcionando con una API; por tanto, quedan pendientes la lógica de componentes, las pruebas, el build y la integración visual/HTTP.

No se marcan criterios de aceptación como completados a partir de estas imágenes. Registrar nuevas capturas y resultados después de ejecutar los comandos de ISS-03.

## Evidencia posterior: implementación y primeras verificaciones

Fecha de recepción: 3-nov-2026  
Fuente: cuatro capturas adicionales proporcionadas por el usuario

1. [Pruebas enfocadas del feature](./E-FRONT-ISS-03-06-pruebas-feature.png): muestra 3 pruebas del filtro aprobadas y pruebas de API, formulario, guardado y eliminación. El test scaffold de `ClientList` falla por falta de `MessageService`.
2. [Suite completa](./E-FRONT-ISS-03-07-suite-completa.png): 42 pruebas aprobadas y 1 fallida, 43 en total; el fallo corresponde al mismo test scaffold sin configurar proveedores.
3. [Build y arranque](./E-FRONT-ISS-03-08-build-y-servidor.png): el build termina, pero el bundle inicial de 537.39 kB supera en 37.39 kB el presupuesto de 500 kB. También se ve el inicio del servidor local.
4. [Servidor local](./E-FRONT-ISS-03-09-servidor-local.png): muestra la aplicación de desarrollo disponible en `http://localhost:4200`; no acredita por sí sola una verificación visual o una petición autenticada exitosa.

Las capturas de código entregadas junto con esta ejecución muestran `ClientForm`, `ClientList`, pruebas específicas para filtro/guardado/bajas, la ruta `/clientes` y el enlace del menú. El test scaffold de `ClientList` se actualizó después para registrar `MessageService` y los proveedores HTTP de prueba, y simular la carga inicial. La evidencia posterior de esta misma fecha confirma esa corrección y muestra la suite aprobada y el build completado.

## Evidencia posterior: corrección de pruebas y build

Fecha de recepción: 3-nov-2026  
Fuente: tres capturas adicionales proporcionadas por el usuario

1. [Pruebas enfocadas aprobadas](./E-FRONT-ISS-03-10-pruebas-feature-aprobadas.png): el test de `ClientList` pasa (1/1) y las pruebas del feature pasan (15/15).
2. [Suite completa aprobada](./E-FRONT-ISS-03-11-suite-43-pruebas-aprobadas.png): 17 archivos de prueba y 43 pruebas aprobadas, 0 fallidas.
3. [Build completado](./E-FRONT-ISS-03-12-build-aprobado-presupuesto.png): Angular termina la generación del bundle; se conserva el aviso de que 537.39 kB exceden el presupuesto de 500 kB en 37.39 kB.

Con esta evidencia, las pruebas automatizadas y el build de 3.8 quedan verificados. El aviso del presupuesto no impidió completar el build.

## Evidencia posterior: ruta de clientes sin sesión

Fecha de recepción: 3-nov-2026  
Fuente: captura del navegador proporcionada por el usuario

- [Ruta `/clientes` y respuesta 401](./E-FRONT-ISS-03-13-clientes-401-sin-sesion.png): muestra el Shell en vista móvil de 375 × 667, el título/listado de Clientes y en DevTools la petición `GET /api/clientes` con estado `401`.

La captura confirma que la ruta se representa dentro del Shell y que el backend aplica autenticación. La tabla vacía no se pudo observar: la petición no autorizada provoca el estado de error y no demuestra una respuesta exitosa con `{ clients: [] }`. Tampoco acredita alta/edición/bajas contra API. El aviso visual `Invalid PrimeUI License` aparece en la captura y no corresponde al resultado de la petición de clientes. La integración con sesión deberá validarse después de ISS-08.
