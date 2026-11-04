import { HttpErrorResponse } from '@angular/common/http';
import { spanishColumn } from './spanish-ui';

interface ApiErrorBody {
  error?: unknown;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null && 'error' in value;
}

const translatedApiMessages: Record<string, string> = {
  'A pending reservation is required to start a rental': 'Se necesita una reserva pendiente para iniciar el alquiler.',
  'A successful payment for this reservation and rate is required before starting':
    'La reserva debe tener un pago exitoso antes de iniciar el alquiler.',
  'A successful reservation payment has no associated rate': 'El pago de la reserva no tiene una tarifa asociada.',
  'A successful reservation payment must have a positive amount': 'El pago de la reserva debe tener un importe mayor que cero.',
  'An active rate valid for the reservation date is required': 'Se necesita una tarifa activa y vigente para la fecha de la reserva.',
  'Assign a bicycle to the reservation before starting the rental': 'Asigna una bicicleta a la reserva antes de iniciar el alquiler.',
  'Authentication required': 'Debes iniciar sesión para continuar.',
  'Invalid or expired access token': 'La sesión no es válida o ha caducado.',
  'Payments can only be recorded for a pending timed reservation': 'Solo se puede registrar el pago de una reserva pendiente con horario definido.',
  'The paid rate does not match the reserved bicycle type': 'La tarifa pagada no corresponde al tipo de bicicleta reservado.',
  'The reservation has expired': 'La reserva ha vencido.',
  'The reservation start time has not arrived': 'Aún no ha llegado la hora de inicio de la reserva.',
  'The reservation window has ended': 'El horario de la reserva ya terminó.',
  'The reserved bicycle is not available': 'La bicicleta reservada ya no está disponible.',
  'The selected bicycle is not available': 'La bicicleta seleccionada no está disponible.',
  'The selected rate does not match the bicycle type': 'La tarifa seleccionada no corresponde al tipo de bicicleta.',
  'The reservation has no payable amount': 'La reserva no tiene un importe pendiente de pago.',
  'This reservation already has a payment record': 'Esta reserva ya tiene un pago registrado.',
  'Registration data is required': 'Debes completar los datos de registro.',
  'email must be a valid email address': 'Escribe un correo electrónico válido.',
  'phone must be a string': 'El teléfono debe ser texto.',
  'No refresh token is available': 'La sesión venció. Inicia sesión nuevamente.',
  'Resource not found': 'No se encontró el recurso solicitado.',
  'Client not found or inactive': 'No se encontró el cliente o está inactivo.',
  'Rate no longer exists': 'La tarifa ya no está disponible.',
  'A rented bicycle cannot enter maintenance': 'No se puede enviar a mantenimiento una bicicleta alquilada.',
  'The selected bicycle already has an active rental': 'La bicicleta seleccionada ya tiene un alquiler activo.',
  'method must be cash or transfer': 'El método de pago debe ser efectivo o transferencia.',
  'status must be pending or successful': 'El estado del pago debe ser pendiente o exitoso.',
  'transaction_code is required for transfers': 'El código de transacción es obligatorio para las transferencias.',
};

function localizeApiMessage(message: string): string {
  const exact = translatedApiMessages[message];
  if (exact) return exact;

  const usernameLength = /^username must be between (\d+) and (\d+) characters$/i.exec(message);
  if (usernameLength) return `El usuario debe tener entre ${usernameLength[1]} y ${usernameLength[2]} caracteres.`;

  const maxLength = /^([a-z_]+) cannot exceed (\d+) characters$/i.exec(message);
  if (maxLength) return `${spanishColumn(maxLength[1])} no puede superar los ${maxLength[2]} caracteres.`;

  const mustBeString = /^([a-z_]+) must be a string$/i.exec(message);
  if (mustBeString) return `${spanishColumn(mustBeString[1])} debe ser texto.`;

  const mustBeBoolean = /^([a-z_]+) must be a boolean$/i.exec(message);
  if (mustBeBoolean) return `${spanishColumn(mustBeBoolean[1])} debe ser verdadero o falso.`;

  const required = /^([a-z_]+) is required$/i.exec(message);
  if (required) return `El campo ${spanishColumn(required[1])} es obligatorio.`;

  const positiveInteger = /^([a-z_]+) must be a positive integer$/i.exec(message);
  if (positiveInteger) return `${spanishColumn(positiveInteger[1])} debe ser un número entero positivo.`;

  const nonNegativeNumber = /^([a-z_]+) must be a non-negative number$/i.exec(message);
  if (nonNegativeNumber) return `${spanishColumn(nonNegativeNumber[1])} debe ser un número mayor o igual a cero.`;

  const unexpectedFields = /^Unexpected field\(s\): (.+)$/i.exec(message);
  if (unexpectedFields) {
    const fields = unexpectedFields[1].split(',').map((field) => spanishColumn(field.trim()));
    return `No se reconocen estos campos: ${fields.join(', ')}.`;
  }

  return message;
}

export function toApiMessage(error: unknown): string {
  if (error instanceof Error && !(error instanceof HttpErrorResponse)) return localizeApiMessage(error.message);
  if (!(error instanceof HttpErrorResponse)) return 'Ocurrió un error inesperado.';

  if (error.status === 0) {
    return 'No se pudo conectar con el servidor de PedalLibre.';
  }
  if (error.status === 401) {
    return 'La sesión no está autenticada o ha caducado.';
  }
  if (error.status === 403) {
    return 'La sesión no tiene permiso para realizar esta acción.';
  }
  if (isApiErrorBody(error.error) && typeof error.error.error === 'string') {
    return localizeApiMessage(error.error.error);
  }
  return `La solicitud falló (HTTP ${error.status}).`;
}
