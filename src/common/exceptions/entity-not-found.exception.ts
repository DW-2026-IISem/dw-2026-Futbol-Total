import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from './application.exception';

export class EntityNotFoundException extends ApplicationException {
  constructor(message = 'Entidad no encontrada') {
    super(message, HttpStatus.NOT_FOUND);
  }
}
