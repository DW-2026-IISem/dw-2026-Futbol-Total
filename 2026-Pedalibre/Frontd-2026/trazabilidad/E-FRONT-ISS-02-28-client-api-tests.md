# E-FRONT-ISS-02-28 — Pruebas HTTP de ClientApi

Fecha: 3-nov-2026  
Workspace: `Frontd-2026`

## Alcance

`src/app/features/clients/client-api.spec.ts` simula HTTP con `HttpTestingController`; no requiere arrancar el backend ni usar credenciales.

La suite comprueba:

- `list()`: `GET /clientes`; desenvuelve `{ clients }` y devuelve el arreglo.
- `get(id)`: `GET /clientes/:id`; desenvuelve `{ client }`.
- `create(payload)`: `POST /clientes`; envía el payload y desenvuelve el resultado.
- `replace(id, payload)`: `PUT /clientes/:id`; envía el payload y desenvuelve el resultado.
- `update(id, payload)`: `PATCH /clientes/:id`; envía el payload y desenvuelve el resultado.
- `httpTestingController.verify()` en `afterEach` falla si queda alguna solicitud pendiente.

## Verificación

Comando ejecutado desde `Frontd-2026`:

```bash
npm test -- --watch=false
```

Resultado: **7 archivos de prueba aprobados; 12 pruebas aprobadas**, incluidas las 5 pruebas de `ClientApi`.
