# Informe de evidencias - Pedalibre app Express

**Proyecto:** `Pedalibre-app-exprex`  
**Ubicacion:** `~/ia-lab/projecs/desarrollo web/Pedalibre-Desarrollo Web/dw-2026-Futbol-Total/Pedalibre-app-exprex`  
**Metodologia:** desarrollo incremental, comprobacion manual, evidencia visual y commits periodicos.

## Diagnostico inicial

Realice la primera revision desde la terminal WSL. Confirme que el proyecto usa Express 5, TypeScript y Sequelize. La estructura disponible incluye configuracion, conexion de base de datos, controlador y rutas de clientes; por ello, el punto de partida corresponde a la implementacion inicial de la feature Client del manual de trazabilidad.

Tambien confirme que esta carpeta todavia no esta registrada por el repositorio Git de la carpeta padre. Mantendre el trabajo y las evidencias dentro de este directorio, sin modificar archivos fuera de el.

### Evidencia 01 - Estado inicial

![Terminal: ubicacion, estado Git, historial, archivos fuente y package.json](evidencias/01-diagnostico-inicial.png)

Ejecute:

```bash
pwd
git status --short --branch
git log --oneline -8
find src -maxdepth 4 -type f | sort
cat package.json
```

**Resultado:** identifique el directorio de trabajo, las dependencias y los archivos iniciales. La siguiente comprobacion sera la compilacion TypeScript antes de iniciar o modificar una funcionalidad.


## Comparacion con el manual - ISS-01

Ejecute la comprobacion de estructura y compilacion antes de continuar el desarrollo. Detecte que existen src/config y src/routes, pero faltan src/database/seeders, src/features/business/client y src/features/business/client/http.

La compilacion TypeScript no supero la verificacion. El error TS2307 muestra que src/models/authorization/Client.ts importa ../database/db, una ruta que no existe desde esa ubicacion. Esta situacion confirma que no debo avanzar a las operaciones CRUD ni a los ISS posteriores hasta normalizar la estructura de ISS-01 y resolver la compilacion.

### Evidencia 02 - Comparacion de estructura y compilacion

![Terminal: contraste con ISS-01 y error de compilacion](evidencias/02-comparacion-manual-iss-01.png)

Ejecute find src -type f | sort, la comprobacion de los cinco directorios requeridos y npx tsc --noEmit.

**Resultado:** ISS-01 permanece incompleto. Registre las tres carpetas faltantes y el error TS2307 como condiciones que debo resolver antes de iniciar ISS-03-A.


## Cierre de estructura y compilacion - ISS-01

Corrijo la ruta relativa del import de Sequelize en el modelo heredado Client y ejecuto la compilacion TypeScript sin emitir archivos. La creacion de las carpetas requeridas queda pendiente de una comprobacion independiente.

### Evidencia 03 - Compilacion TypeScript exitosa

![Terminal: npx tsc sin errores](evidencias/03-iss-01-compilacion-exitosa.png)

**Resultado:** npx tsc --noEmit finalizo sin errores. Con esto elimine el bloqueo de compilacion detectado en la Evidencia 02. Las carpetas requeridas por ISS-01 y la migracion del modelo Client a la estructura oficial permanecen pendientes.


## Estructura requerida creada - ISS-01

Creo las carpetas src/database/seeders y src/features/business/client indicadas por el manual. Verifico el arbol de directorios y ejecuto otra vez la compilacion TypeScript.

### Evidencia 04 - Estructura de ISS-01 y compilacion

![Terminal: directorios requeridos y compilacion sin errores](evidencias/04-iss-01-estructura-final.png)

**Resultado:** el arbol ya incluye src/database/seeders y src/features/business/client. La compilacion termina sin errores. Antes de cerrar ISS-01 debo ejecutar npm run dev, como exige el manual.


## Arranque con base de datos - ISS-01

Inicio el servidor con npm run dev. Confirmo que nodemon ejecuta ts-node, que la aplicacion usa el puerto 3001, que MySQL responde y que Sequelize sincroniza la base de datos.

### Evidencia 05 - Servidor y base de datos operativos

![Terminal: servidor Express, conexion MySQL y sincronizacion](evidencias/05-iss-01-arranque-servidor.png)

**Resultado:** el servidor inicia, la conexion a MySQL es exitosa y la base de datos se sincroniza. Con las evidencias de estructura y compilacion, ISS-01 queda comprobado para el alcance inicial.
