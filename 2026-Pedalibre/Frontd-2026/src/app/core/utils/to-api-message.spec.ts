import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { toApiMessage } from './to-api-message';

describe('toApiMessage', () => {
  it('explains that the PedalLibre server is unreachable', () => {
    const error = new HttpErrorResponse({ status: 0 });

    expect(toApiMessage(error)).toBe(
      'No se pudo conectar con el servidor de PedalLibre.',
    );
  });

  it('provides a specific message for unauthenticated requests', () => {
    const error = new HttpErrorResponse({ status: 401 });

    expect(toApiMessage(error)).toBe(
      'La sesión no está autenticada o ha caducado.',
    );
  });

  it('provides a specific message for forbidden requests', () => {
    const error = new HttpErrorResponse({ status: 403 });

    expect(toApiMessage(error)).toBe(
      'La sesión no tiene permiso para realizar esta acción.',
    );
  });

  it('returns the error message provided by the API', () => {
    const error = new HttpErrorResponse({
      status: 422,
      error: { error: 'El documento ya está registrado.' },
    });

    expect(toApiMessage(error)).toBe('El documento ya está registrado.');
  });

  it('translates English API errors used by reservation and payment flows', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: { error: 'A successful payment for this reservation and rate is required before starting' },
    });

    expect(toApiMessage(error)).toBe(
      'La reserva debe tener un pago exitoso antes de iniciar el alquiler.',
    );
  });

  it('translates English field validation errors', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { error: 'reservation_id is required' },
    });

    expect(toApiMessage(error)).toBe('El campo Reserva es obligatorio.');
  });

  it('exposes actionable messages for client-side API contract errors', () => {
    expect(toApiMessage(new TypeError('La respuesta del API no contiene una lista de alquileres.'))).toBe(
      'La respuesta del API no contiene una lista de alquileres.',
    );
  });

  it('returns a fallback for non-error values', () => {
    expect(toApiMessage('boom')).toBe('Ocurrió un error inesperado.');
  });
});
