import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { toApiMessage } from './to-api-message';

describe('toApiMessage', () => {
  it('explains that the PedalLibre backend is unreachable', () => {
    const error = new HttpErrorResponse({ status: 0 });

    expect(toApiMessage(error)).toBe(
      'No se pudo conectar con el backend de PedalLibre.',
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

  it('returns a fallback for unexpected errors', () => {
    expect(toApiMessage(new Error('boom'))).toBe(
      'Ocurrió un error inesperado.',
    );
  });
});
