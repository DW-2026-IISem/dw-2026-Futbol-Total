import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from './application.exception';

export class DomainException extends ApplicationException {
  constructor(message = 'Error de dominio') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
