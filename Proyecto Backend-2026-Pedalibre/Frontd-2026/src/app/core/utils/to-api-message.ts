import { HttpErrorResponse } from '@angular/common/http';

interface ApiErrorBody {
  error?: unknown;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null && 'error' in value;
}

export function toApiMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocurrió un error inesperado.';
  }

  if (error.status === 0) {
    return 'No se pudo conectar con el backend de PedalLibre.';
  }
  if (error.status === 401) {
    return 'La sesión no está autenticada o ha caducado.';
  }
  if (error.status === 403) {
    return 'La sesión no tiene permiso para realizar esta acción.';
  }
  if (isApiErrorBody(error.error) && typeof error.error.error === 'string') {
    return error.error.error;
  }
  return `La solicitud falló (HTTP ${error.status}).`;
}
