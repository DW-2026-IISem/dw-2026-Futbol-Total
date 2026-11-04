# Fase I: Frontend — ISS-01: Bootstrap de Angular con CLI, Tailwind y PrimeNG

**Estado:** completado  
**Proyecto:** PedalLibre, carpeta `Frontd-2026`  
**Depende de:** ISS-00 — Requisitos previos  
**Habilita:** ISS-02 — Núcleo del frontend, incluido el Shell visual y la navegación

> **Alcance:** Los pasos y criterios de la primera parte de este documento están adaptados al frontend y al backend de PedalLibre. El material original de referencia aparece al final solo para conservarlo; no se deben ejecutar sus nombres, rutas, ejemplos, credenciales ni resultados para este proyecto.

## Contexto de PedalLibre

El backend de PedalLibre usa Express 5, TypeScript y Sequelize. Su API local está en `http://localhost:3002/api`, y entre sus recursos están bicicletas, estaciones, tarifas, reservas y alquileres. Este ISS no conecta Angular con la API ni añade servicios HTTP o autenticación.

En ISS-00 se comprobaron Node.js `v24.21.0`, npm `12.2.1` y Angular CLI `22.2.5`. La carpeta `Frontd-2026` contiene `docs/` y `trazabilidad/`; el workspace se crea en esa misma carpeta, sin borrar esos directorios ni crear una subcarpeta adicional.

## Objetivo

Crear el workspace Angular en `Frontd-2026`, instalar PrimeNG y Tailwind en versiones compatibles con Angular 22 y preparar una pantalla inicial local que presente PedalLibre. La pantalla es solo demostrativa: no contiene datos reales de bicicletas y no consulta la API.

## Criterios de aceptación

- [x] `angular.json`, `package.json`, `src/main.ts` y `src/app/app.config.ts` quedan directamente en `Frontd-2026`.
- [x] Existe `src/app/app.routes.ts` y `provideRouter` queda configurado; las rutas se dejan vacías en este ISS.
- [x] Tailwind CSS queda configurado por el CLI y se conserva `package-lock.json`.
- [x] PrimeNG, Aura, PrimeIcons y Angular CDK se instalan en versiones cuyas dependencias entre pares admiten Angular 22.
- [x] `src/styles.css` contiene Tailwind, PrimeIcons y el orden previsto de capas CSS.
- [x] PrimeNG se configura con el preset Aura; las claves de licencia y demás secretos no se publican.
- [x] La pantalla inicial presenta PedalLibre e indica que todavía no está conectada al backend.
- [x] La pantalla no presenta información de negocio ficticia como si proviniera de la base de datos.
- [x] `ng serve` compila y abre la aplicación en `http://localhost:4200`.
- [x] `ng build` finaliza correctamente.
- [x] `npm test -- --watch=false` ejecuta las pruebas configuradas por el CLI y el proceso sale sin errores.
- [x] `src/index.html` declara `lang="es"`.
- [x] `src/index.html` tiene un título y una descripción propios de PedalLibre.
- [x] Las capturas de la ejecución se guardan en `../trazabilidad/` y se insertan únicamente en el informe paso a paso.

## 1.1 Crear el workspace en la carpeta actual

Antes de crear el workspace, confirma que la terminal está en `Frontd-2026`:

```bash
pwd
ls -la
```

La salida debe incluir `docs/` y `trazabilidad/`. No ejecutes `ng new` desde la carpeta del backend ni vuelvas a crear el proyecto si ya existe un `package.json` de Angular.

Desde `Frontd-2026`, crea el workspace con un nombre válido y escribe sus archivos en la carpeta actual:

```bash
ng new pedalibre-frontend \
  --directory . \
  --style=tailwind \
  --routing \
  --ssr=false \
  --skip-git \
  --package-manager=npm \
  --defaults
```

El nombre `pedalibre-frontend` identifica el proyecto; `--directory .` indica que el CLI debe escribir en el directorio actual. No uses `ng new .`, porque `.` no es un nombre válido de paquete npm. Incluye `--skip-git` porque el repositorio ya existe en la raíz y no se debe inicializar otro repositorio anidado.

Después de generar el workspace, comprueba que `docs/` y `trazabilidad/` sigan presentes y que los archivos Angular hayan quedado en la raíz correcta:

```bash
test -d docs && test -d trazabilidad
test -f angular.json && test -f package.json
test -f src/main.ts && test -f src/app/app.config.ts
find . -maxdepth 2 -name package.json -o -name angular.json
```

Si el CLI detecta una carpeta no vacía, detente a revisar el mensaje antes de aceptar cambios. No elimines ni reemplaces documentación existente.

## 1.2 Instalar PrimeNG compatible

Consulta primero los peers publicados para confirmar compatibilidad con el Angular instalado:

```bash
ng version
npm view primeng version peerDependencies --json
```

Solo después de confirmar la compatibilidad, instala los paquetes:

```bash
npm install primeng @primeuix/themes primeicons @angular/cdk
npm ls primeng @primeuix/themes primeicons @angular/cdk --depth=0
```

No fijes a ciegas las versiones del proyecto de referencia: conserva las versiones compatibles que resuelva npm y el `package-lock.json` generado. Si PrimeNG publica peers que no admiten Angular 22, detente y ajusta la selección de versiones antes de instalar.

## 1.3 Estilos globales

Revisa el `src/styles.css` generado por el CLI y adapta sus imports para que Tailwind, PrimeIcons y PrimeNG respeten el orden de capas:

```css
@layer theme, base, primeng, utilities;
@import 'tailwindcss';
@import 'primeicons/primeicons.css';
```

No añadas CSS de negocio global ni PrimeFlex. Usa utilidades Tailwind para composición y PrimeNG para los controles.

## 1.4 Configurar PrimeNG y Aura

### Cambios

Desde la raíz de `Frontd-2026`, reemplaza `src/app/app.config.ts` con esta configuración. Conserva los providers de Angular, registra Aura y declara la capa PrimeNG antes de las utilidades Tailwind:

```bash
cat > src/app/app.config.ts <<'EOF'
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng, utilities',
          },
        },
      },
    }),
  ],
};
EOF
```

No agregues `provideHttpClient()` ni interceptores en este paso: la integración HTTP corresponde a otro ISS. No incluyas claves de licencia ni secretos en el código. Si el navegador muestra un aviso de licencia, anótalo como aviso y no como error de compilación.

### Verificación

Ejecuta el build:

```bash
npm run build
```

Si compila, inicia la aplicación:

```bash
npm start
```

Abre `http://localhost:4200`, revisa Console y confirma en DevTools que `--p-primary-color` tiene un valor:

```js
getComputedStyle(document.documentElement).getPropertyValue('--p-primary-color')
```

No marques esta verificación como completada hasta guardar la salida del build y comprobar el valor en el navegador.

## 1.5 Pantalla inicial de PedalLibre

### 1.5.1 Reemplazar el componente raíz

Desde la raíz de `Frontd-2026`, reemplaza `src/app/app.ts`. La pantalla de este ISS es una portada local, sin datos de bicicletas, estaciones, clientes ni respuestas inventadas de la API:

```bash
cat > src/app/app.ts <<'EOF'
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
EOF
```

Reemplaza el contenido de `src/app/app.html`:

```bash
cat > src/app/app.html <<'EOF'
<main class="min-h-dvh bg-slate-50 px-6 py-10 text-slate-900">
  <section
    aria-labelledby="welcome-title"
    class="mx-auto flex min-h-[70dvh] w-full max-w-5xl flex-col justify-center"
  >
    <p class="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
      Movilidad compartida
    </p>
    <h1 id="welcome-title" class="text-4xl font-bold tracking-tight sm:text-6xl">
      PedalLibre
    </h1>
    <p class="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
      Frontend en construcción. La conexión con los servicios de PedalLibre se
      incorporará en las siguientes etapas.
    </p>
    <p class="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">
      <span aria-hidden="true" class="size-2 rounded-full bg-amber-500"></span>
      Integración con la API pendiente
    </p>
  </section>
</main>
EOF
```

Deja `src/app/app.css` vacío; el layout utiliza Tailwind y el tema de PrimeNG queda disponible para los componentes que se incorporen después. No añadas un `router-outlet`; las rutas permanecen vacías en este ISS:

```bash
cat > src/app/app.css <<'EOF'
EOF
```

### 1.5.2 Actualizar la prueba del componente

La prueba generada por el CLI busca el texto de bienvenida predeterminado. Reemplaza `src/app/app.spec.ts` para comprobar el contenido de la portada:

```bash
cat > src/app/app.spec.ts <<'EOF'
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show the PedalLibre landing page without claiming API integration', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const content = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(content).toContain('PedalLibre');
    expect(content).toContain('Integración con la API pendiente');
  });
});
EOF
```

### 1.5.3 Comprobar la pantalla

Ejecuta las pruebas y arranca la aplicación:

```bash
npm test -- --watch=false
npm start
```

En `http://localhost:4200`, confirma que aparece la portada PedalLibre y que no se muestra información de negocio ficticia. En DevTools Network, comprueba que la pantalla inicial no envía peticiones a `/api`. Guarda la captura solo después de comprobarla; insértala en el informe y conserva el archivo en `trazabilidad/`.

## 1.6 Personalizar `src/index.html`

Actualiza el idioma, el título y la descripción para PedalLibre; no conserves el nombre de StoreLab:

```html
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>PedalLibre — Frontend</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Frontend de PedalLibre para la gestión de bicicletas compartidas.">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

## 1.7 Presupuesto de build

Revisa los presupuestos del build de producción en `angular.json`. Ajústalos solo si las dependencias instaladas hacen que el build inicial supere el límite predeterminado; usa un límite razonable y no aumentes el presupuesto para ocultar problemas de tamaño.

## 1.8 Primera ejecución

Ejecuta el build de producción y las pruebas en modo de una sola ejecución. Después, inicia el servidor local:

```bash
npm run build
npm test -- --watch=false
npm start
```

Abre `http://localhost:4200`. Comprueba que la pantalla identifica PedalLibre, que no hay errores de compilación y que todavía no se realizan llamadas a `/api`. La documentación del API y los recursos de negocio pertenecen al backend, no a esta pantalla local.

## 1.9 Verificación de este ISS

```bash
# Confirmar que el workspace está en la raíz de Frontd-2026
test -f angular.json && test -f package.json
test -f src/main.ts && test -f src/app/app.config.ts
test -d docs && test -d trazabilidad

# Comprobar las dependencias instaladas
npm ls primeng @primeuix/themes primeicons @angular/cdk --depth=0

# Revisar los estilos globales y la configuración
cat src/styles.css
grep -R "providePrimeNG\\|@import 'tailwindcss'" src

# Validar build y pruebas con una sola ejecución
npm run build
npm test -- --watch=false
```

Registra el resultado de cada comando solo después de ejecutarlo. Para la evidencia visual, guarda capturas de la estructura final, la salida de `npm ls`, la pantalla en `localhost:4200` y las herramientas del navegador. Las imágenes van en `trazabilidad/` y aparecen únicamente en el informe paso a paso.

## Avance documentado

Las evidencias finales confirman que `src/index.html` declara `lang="es"`, el título `PedalLibre` y una descripción propia del proyecto. `npm run build` finaliza correctamente y `npm test -- --watch=false` pasa sus 2 pruebas con código de salida 0. La aplicación abre en `http://localhost:4200` y muestra la portada local. El aviso de licencia de PrimeUI permanece identificado como informativo y no impide la ejecución.

## Cierre

ISS-01 completado. El siguiente paso es ISS-02, que construye el núcleo y el esqueleto visual integrado.

---

# Texto original recibido — ISS-01 (fragmento inicial, sin adaptar)

🛠 Unidad ISS-01 · Bootstrap Angular 22 con CLI, Tailwind y PrimeNG — capa 🛠 CONSTRUIR

Fase I: Frontend — ISS-01 — Bootstrap Angular 22 con CLI

Vigencia · revisión local del 23-oct-2026. Después del bootstrap se construye ISS-01A (Header, Aside, contenido y Footer) y luego ISS-01B (PanelMenu, input/output, signals y Drawer). Ambos subpasos están incluidos en Construir ISS-01 antes de avanzar a ISS-02. El consolidado usa router-outlet y carga /construir de forma diferida. Aura y Tailwind coordinan theme, base, primeng, utilities; el CSS de demo/ejemplo es una excepción didáctica. Los bloques de código de la guía pueden representar incrementos; los archivos locales citados son la referencia consolidada.

Vigencia · revisión local del 23-oct-2026. Los pasos describen una construcción incremental en una copia de práctica. El código consolidado puede incluir fases posteriores. Los resultados importados son reportes de la fuente, no pruebas repetidas en esta actualización. Véase estado y trazabilidad.

## Contexto mínimo (autosuficiente)

Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que hay que saber antes de ejecutarlo.

- Proyecto: front-storelab-express-ii — Angular 22 (standalone + zoneless + signals), PrimeNG 22 en modo styled con Aura y Tailwind CSS 4. Sin CSS de negocio ni PrimeFlex; la única excepción es la clase didáctica de demo/ejemplo.
- Backend de referencia: app-storelab-express-ii — Express 5 + TypeScript + Sequelize; su contrato REST se documenta en ../README.md.
- Recorrido obligatorio de una petición: Componente → Service → HttpClient → Interceptor → API → Controller → Service → Repository → Model → BD.
- Patrón visual (tema vs. utilidades, capas CSS): PATRON-VISUAL.md.
- Comandos del CLI y versiones: CLI-Y-ALINEACION.md.

## Este ISS

**Título:** Bootstrap Angular 22 con CLI  
**Feature / tabla:** estructura src/ + configuración global  
**API:** ninguna (sin HTTP todavía)  
**Depende de:** ISS-00 — Requisitos previos  
**Habilita:** ISS-01A — Esqueleto Header/Aside/Footer → ISS-01B → ISS-02

### Contenido de este ISS

1.1 Crear el proyecto en la carpeta actual  
1.2 Instalar PrimeNG compatible con Angular  
1.3 Estilos globales  
1.4 Configurar PrimeNG en app.config.ts  
1.4.1 Licencia de PrimeNG 22  
1.4.2 Por qué el tema no está en el CSS compilado  
1.5 Pantalla de arranque: App compone el componente demo/ejemplo  
1.6 Personalizar index.html  
1.7 Ajustar el presupuesto de build  
1.8 Primera ejecución  
1.9 Anatomía del componente demo/ejemplo y signals  
Verificación y cierre del ISS

**Objetivo:** crear un proyecto con el Angular CLI actual sin una carpeta adicional, integrar Tailwind y PrimeNG compatibles y dejar Aura funcionando. Al final, `ng serve` debe mostrar la pantalla inicial sin errores.

**Bloqueado por:** ISS-00.

**Evidencia de aprendizaje:** captura de la pantalla de arranque, explicación de la diferencia entre tema PrimeNG y utilidades Tailwind, y recorrido de signal → computed → effect sobre el componente demo/ejemplo.

Equipo y terminal: Ubuntu WSL, terminal del editor, carpeta del frontend. Los ejemplos que crean o reemplazan archivos se ejecutan en una copia de práctica; en el workspace consolidado inspecciona y ajusta los archivos existentes.

### Criterios de aceptación (ISS-01) — consolidados

- [ ] `angular.json`, `package.json`, `src/main.ts` y `src/app/app.config.ts` existen directamente en la carpeta del proyecto (sin subcarpeta).
- [ ] `src/app/app.routes.ts` existe con `export const routes` y `provideRouter` está en `app.config.ts`.
- [ ] `npm ls primeng @primeuix/themes primeicons @angular/cdk --depth=0` muestra versiones compatibles con Angular 22; `package-lock.json` se conserva.
- [ ] `src/styles.css` declara el orden de capas e importa Tailwind y PrimeIcons.
- [ ] `providePrimeNG` usa el preset Aura y `darkModeSelector: '.app-dark'`.
- [ ] `providePrimeNG` lee `environment.primeUiLicense` (ISS-02) y se entiende el aviso Invalid PrimeUI License.
- [ ] `app.ts` importa Ejemplo y `app.html` contiene `<app-ejemplo />`; `app.css` queda vacío y `app.routes.ts` sigue vacío.
- [ ] Existe `src/app/demo/ejemplo/` con `.ts`, `.html`, `.css` y `.spec.ts`, con un objeto en un signal.
- [ ] `index.html` tiene `<title>StoreLab Express II · Angular 22</title>`, `lang="es"` y `<body class="m-0 bg-slate-100 font-sans text-slate-900">`.
- [ ] El presupuesto initial de producción es 750kB / 1MB.
- [ ] `ng serve` compila sin errores y `http://localhost:4200` responde 200.
- [ ] En pantalla se ve la tarjeta del producto; `+1000` cambia el precio y el valor con IVA sin recargar.
- [ ] Explica el arranque `index.html → main.ts → app.config.ts → App → <app-ejemplo /> → demo/ejemplo` y la función de los cuatro archivos del componente.
- [ ] Explica cómo el selector del componente se convierte en la etiqueta de `app.html`.
- [ ] Distingue signal, computed y effect en `demo/ejemplo/ejemplo.ts`.
- [ ] Explica el aislamiento de estilos con `.ejemplo-alcance` y `_ngcontent-…`.
- [ ] La consola no muestra errores de código, dependencias ni tema; identifica los avisos de licencia como tales.
- [ ] `ng build` termina con código 0.

## 1.1 Crear el proyecto en la carpeta actual

### Criterios de este sub-ítem

- [ ] `angular.json`, `package.json`, `src/main.ts` y `src/app/app.config.ts` en la raíz.
- [ ] `src/app/app.routes.ts` generado por `--routing`.
- [ ] Tailwind configurado por `--style=tailwind` (`.postcssrc.json`).

Solo para una carpeta de práctica vacía: usa el CLI instalado en ISS-00. Si ya descargaste este workspace, ejecuta `npm ci` y continúa con su revisión; no vuelvas a crearlo. En una ubicación nueva crea primero la carpeta vacía con `mkdir -p`, entra en ella y ejecuta:

```bash
mkdir -p ~/ia-lab/projects/dw/pry-jquintero/front-storelab-express-ii
cd ~/ia-lab/projects/dw/pry-jquintero/front-storelab-express-ii
ng new front-storelab-express-ii \
  --directory . \
  --style=tailwind \
  --routing \
  --ssr=false \
  --skip-git \
  --package-manager=npm \
  --defaults
```

### ¿Por qué no `ng new .`?

Angular CLI valida el nombre del paquete antes de crear archivos. Un punto (`.`) no es un nombre npm válido y produce un error de validación. La forma correcta de crear el proyecto en la carpeta actual es dar un nombre real y usar `--directory .`:

```bash
ng new <nombre-valido> --directory .
```

| Flag | Efecto |
|---|---|
| `--directory .` | Escribe en la carpeta actual, sin subcarpetas |
| `--style=tailwind` | Configura Tailwind CSS y PostCSS |
| `--routing` | Genera `app.routes.ts` y `provideRouter` |
| `--defaults` | Acepta valores predeterminados y evita preguntas |
| `--ssr=false` | Solo SPA, sin server-side rendering |
| `--skip-git` | No inicializa un repositorio nuevo |

La plantilla actual genera aplicaciones standalone y zoneless por defecto. No es necesario repetir esos flags. Antes de crear, `ng new --help` muestra las opciones que admite tu instalación. `--directory .` cambia la carpeta de salida; el nombre front-storelab-express-ii sigue siendo el identificador del proyecto.

Como alternativa opcional, si no instalaste CLI global, usa `npm exec --package=@angular/cli -- ng new front-storelab-express-ii --directory . --style=tailwind --routing --ssr=false --skip-git --package-manager=npm --defaults`. También obtiene el CLI sin fijar `@22`; no mezcles ambas variantes en la práctica.

**PARCHE — carpeta con docs/.** `ng new --directory .` escribe junto a lo que ya existe y no borra `docs/`. Verifica después que `docs/construir/` sigue presente y que `README.md` de la raíz es el que generó el CLI (el de `docs/` es el del curso).

**PARCHE — README.md de la raíz.** El CLI deja un README de plantilla con los comandos de Angular. Reemplázalo por la presentación breve del proyecto (enlaces a `docs/construir/README.md` y `docs/README.md`, `npm start` y las dos validaciones). El README del curso vive en `docs/` y no se toca.

## 1.2 Instalar PrimeNG compatible con Angular

### Criterios de este sub-ítem

- [ ] `primeng`, `@primeuix/themes`, `primeicons` y `@angular/cdk` instalados.
- [ ] Las versiones instaladas declaran compatibilidad con Angular 22.
- [ ] `package-lock.json` actualizado y conservado.

El tema moderno no se importa desde `primeng/resources/themes`. El preset Aura vive en `@primeuix/themes`.

Consulta primero las peer dependencies:

```bash
ng version
npm view primeng version peerDependencies --json
npm install primeng @primeuix/themes primeicons @angular/cdk
npm ls primeng @primeuix/themes primeicons @angular/cdk --depth=0
```

Salida de referencia de esta copia (no asumir que latest conserva estas versiones):

```text
front-storelab-express-ii@0.0.0
├── @angular/cdk@22.2.4
├── @primeuix/themes@3.1.0
├── primeicons@8.0.2
└── primeng@22.1.4
```

`primeng@22.1.4` declara como peers `@angular/core ^22.1.0`, `@angular/common ^22.1.0`, `@angular/forms ^22.1.0`, `@angular/router ^22.1.0`, `@angular/platform-browser ^22.1.0`, `@angular/cdk ^22.1.0` y `rxjs ^6.0.0 || ^7.8.1`. `@angular/cdk` es peer dependency de PrimeNG 22.

## 1.3 Estilos globales

### Criterios de este sub-ítem

- [ ] `src/styles.css` declara `@layer theme, base, primeng, utilities;`
- [ ] Importa `tailwindcss`.
- [ ] Importa `primeicons/primeicons.css`.
- [ ] No contiene selectores `.p-*`, `::ng-deep` ni clases de aplicación.

Crea/reemplaza `src/styles.css`:

```css
@layer theme, base, primeng, utilities;
@import 'tailwindcss';
@import 'primeicons/primeicons.css';
```

El orden de capas permite que las utilidades de Tailwind ganen sobre el tema de PrimeNG sin `!important`. Es la única hoja global del proyecto.

## 1.4 Configurar PrimeNG en app.config.ts

### Criterios de este sub-ítem

- [ ] `providePrimeNG` registra preset Aura.
- [ ] `darkModeSelector: '.app-dark'`.
- [ ] `cssLayer` declara `name: 'primeng'` y `order: 'theme, base, primeng, utilities'`.
- [ ] `MessageService` y `ConfirmationService` registrados.
- [ ] `provideRouter` incluye `withComponentInputBinding()` y `withInMemoryScrolling()`.

Reemplaza `src/app/app.config.ts`:

```typescript
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    providePrimeNG({
      ripple: true,
      inputVariant: 'outlined',
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark',
          cssLayer: { name: 'primeng', order: 'theme, base, primeng, utilities' },
        },
      },
    }),
    MessageService,
    ConfirmationService,
  ],
};
```

En ISS-02 se añade `provideHttpClient()`. Los interceptores se generan e incorporan en ISS-08, cuando sus servicios ya existen.

### 1.4.1 Licencia de PrimeNG 22

Comprueba los términos y requisitos de licencia correspondientes a la versión que instalaste. Si la distribución solicita una clave, usa una clave válida para tu persona u organización, guárdala fuera del control de versiones si es comercial y nunca la pongas en una captura. No ocultes el aviso con CSS o JavaScript ni lo confundas con un error de código. Si aún no tienes una clave, registra el aviso y continúa solo si los términos de uso lo permiten.

### 1.4.2 Por qué el tema no está en el CSS compilado

`providePrimeNG` puede generar variables CSS del preset en tiempo de ejecución. Por eso revisar únicamente `dist/*.css` no es una verificación suficiente del tema; se debe inspeccionar en DevTools el elemento `<html>` y las variables computadas.

**PARCHE.** El `app.config.ts` que genera el CLI declara providers base de Angular y el router. Al reemplazarlo, conserva `provideBrowserGlobalErrorListeners()` y no agregues todavía `provideHttpClient()`: su lugar es ISS-02.

## 1.5 Pantalla de arranque: App compone el componente demo

### Criterios de este sub-ítem

- [ ] `src/app/app.ts` importa el componente de ejemplo y lo declara en `imports`.
- [ ] `src/app/app.html` compone la pantalla con utilidades Tailwind.
- [ ] `src/app/app.css` queda vacío: el aspecto viene de Tailwind y Aura.
- [ ] `src/app/app.routes.ts` sigue vacío: ISS-01 no necesita navegación.
- [ ] Existe el componente de ejemplo con `.ts`, `.html`, `.css` y `.spec.ts`.
- [ ] Los datos se identifican explícitamente como demostrativos y no vienen de la API.

La plantilla por defecto del CLI contiene enlaces y contenido de bienvenida. La reemplazo por una pantalla inicial identificada con PedalLibre. Si añado el componente didáctico, uso únicamente datos locales de ejemplo y explico que no representan registros del sistema.

```text
index.html → <app-root> → App → <app-ejemplo /> → componente demostrativo
```

La regla que aprendo en este paso es que el selector de un componente corresponde a la etiqueta que escribo en la plantilla del componente padre.

## 1.6 Personalizar index.html

### Criterios de este sub-ítem

- [ ] `lang="es"`.
- [ ] El título identifica PedalLibre y no conserva StoreLab.
- [ ] Hay una descripción del frontend.

Adapto el `src/index.html` generado por Angular. No reemplazo elementos del workspace ni dejo metadatos de otro proyecto.

## 1.7 Ajustar el presupuesto de build

Inspecciono `angular.json`. Si el paquete inicial supera el presupuesto predeterminado, ajusto el presupuesto de manera acotada y justifico el cambio. No elevo el límite para ocultar un bundle excesivo. Compruebo que `ng build` finalice sin error.

## 1.8 Primera ejecución

```bash
npm start
```

Abro `http://localhost:4200` y compruebo que aparece la pantalla de PedalLibre. En ISS-01 no hay servicios HTTP, por lo que la aplicación no debe consultar `/api`. Si incluyo controles didácticos, verifico su comportamiento local sin presentar sus valores como datos reales.

## 1.9 Anatomía del componente y signals

### Criterios de este sub-ítem

- [ ] Explico el arranque `index.html → main.ts → app.config.ts → App → plantilla`.
- [ ] Identifico la clase, la plantilla, los estilos y la prueba del componente.
- [ ] Distingo `signal` (estado), `computed` (valor derivado) y `effect` (efecto secundario).
- [ ] Explico que al actualizar un objeto creo una nueva referencia en vez de mutarlo.
- [ ] Explico por qué no necesito llamar a `ChangeDetectorRef` para cambios de signals.
- [ ] Relaciono el selector con la etiqueta que usa el padre.

Si creo un componente de ejemplo, uso su objeto únicamente para explicar Angular. No lo conecto a la API de bicicletas ni lo trato como una bicicleta persistida.

## Verificación del ISS

```bash
# Revisar que los archivos estén en la raíz correcta
test -f angular.json && test -f package.json
test -f src/main.ts && test -f src/app/app.config.ts

# Confirmar dependencias y estilos
npm ls primeng @primeuix/themes primeicons @angular/cdk --depth=0
cat src/styles.css
grep -R "providePrimeNG\\|@import 'tailwindcss'" src

# Compilar y ejecutar las pruebas configuradas por el CLI
ng build
npm test
```

Completaré los resultados y el cierre después de ejecutar estas comprobaciones. Guardaré las imágenes reales en `../trazabilidad/` y las incorporaré únicamente al informe paso a paso.

## Cierre

ISS-01 quedará completo cuando el workspace Angular esté creado en `Frontd-2026`, PrimeNG y Tailwind sean compatibles con el Angular instalado, la pantalla local abra y las verificaciones terminen correctamente.
