# E-FRONT-ISS-02-38 — Cierre técnico de ISS-02

Fecha: 3-nov-2026  
Proyecto: PedalLibre  
Workspace: `Frontd-2026`

## Alcance verificado

- Environments y URL API local de PedalLibre con reemplazo para desarrollo.
- Modelos y payloads iniciales de clientes contrastados con los DTO del backend.
- `ClientApi` con `HttpTestingController` para `GET` de colección/detalle, `POST`, `PUT` y `PATCH`; respuestas desenvueltas y verificación de solicitudes pendientes.
- `toApiMessage` para error de conexión, 401, 403, mensajes de API y errores inesperados.
- `NotificationService` con `MessageService` PrimeNG y pruebas de éxito, aviso y error.
- `PageHeader`, `EmptyState` y `StatusTag` standalone, con entradas tipadas, acciones proyectadas donde aplican y severidad neutral para estados desconocidos.
- Shell, navegación a HomePage y menú accesible/responsive; pruebas de toggle, overlay y cierre al emitir navegación.
- Evidencia visual del menú de escritorio y móvil a 375 × 667 px.

Las pruebas de HTTP simulan las respuestas de PedalLibre; no desactivan la autenticación ni necesitan una conexión real al backend.

## Verificación final

Comandos ejecutados desde `Frontd-2026`:

```bash
npm test -- --watch=false
npm run build
```

Resultados:

- Tests: **12 archivos aprobados; 30 pruebas aprobadas**.
- Build de producción: **exitoso**, bundle generado en `dist/pedalibre-frontend`.

ISS-02 queda completado. ISS-03 queda listo para iniciar.
