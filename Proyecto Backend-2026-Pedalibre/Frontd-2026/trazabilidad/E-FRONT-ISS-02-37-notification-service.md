# E-FRONT-ISS-02-37 — NotificationService

Fecha: 3-nov-2026  
Workspace: `Frontd-2026`

## Implementación

`src/app/core/services/notification.ts` expone `NotificationService` con métodos para notificaciones de éxito, aviso y error. Centraliza severidad, resumen, detalle y duración mediante PrimeNG `MessageService`. El método de error convierte el error recibido con `toApiMessage`, incluyendo el mensaje que devuelve la API cuando está disponible.

`src/app/core/services/notification.spec.ts` verifica los mensajes enviados para éxito y aviso, la traducción de `401` y la extracción de un mensaje de error de API (`422`). Son pruebas unitarias del frontend PedalLibre; no requieren backend ni credenciales.

## Verificación

Comandos ejecutados desde `Frontd-2026`:

```bash
npm test -- --watch=false
npm run build
```

Resultados:

- Tests: **8 archivos aprobados; 16 pruebas aprobadas**, incluidas 4 pruebas de `NotificationService`.
- Build Angular: **correcto**, bundle generado en `dist/pedalibre-frontend`.
