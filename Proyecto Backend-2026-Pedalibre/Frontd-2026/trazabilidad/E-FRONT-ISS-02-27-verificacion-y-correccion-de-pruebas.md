# E-FRONT-ISS-02-27 — Verificación y corrección de pruebas

Fecha: 3-nov-2026  
Workspace: `Frontd-2026`  
Fuente de la incidencia inicial: salida de terminal compartida por el usuario.

## Ejecución inicial recibida

- `npm run build`: correcto; se generó `dist/pedalibre-frontend`.
- `npm test -- --watch=false`: 6 archivos, 4 fallidos y 2 aprobados; 7 pruebas, 4 fallidas y 3 aprobadas.
- Header, Aside y Shell fallaron con `NG0201: No provider found for ActivatedRoute`: sus pruebas importaban componentes con `RouterLink`/`RouterLinkActive`, pero el TestBed no configuraba Router.
- La prueba de `App` esperaba el contenido de la portada directamente en el componente raíz. Después de introducir `RouterOutlet`, ese contenido pertenece a `HomePage`.

## Corrección aplicada

- Se añadió `provideRouter([])` a los TestBed de Header, Aside y Shell, y al de App.
- Se retiró de `app.spec.ts` la aserción de contenido de HomePage.
- Se añadió esa aserción a `home-page.spec.ts`, donde se comprueban `PedalLibre` y `Integración con la API pendiente`.

## Reejecución

Comandos ejecutados desde `Frontd-2026`:

```bash
npm test -- --watch=false
npm run build
```

Resultados:

- `npm test -- --watch=false`: 6 archivos aprobados y 7 pruebas aprobadas.
- `npm run build`: correcto; bundle generado en `dist/pedalibre-frontend`.

Esta evidencia registra una verificación local posterior a la corrección. No cubre todavía pruebas de contrato HTTP para `ClientApi` ni la verificación visual del Shell en viewport móvil y escritorio.
