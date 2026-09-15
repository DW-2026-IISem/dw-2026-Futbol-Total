import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from './application.exception';

export class BusinessRuleException extends ApplicationException {
  constructor(message = 'Regla de negocio violada') {
    super(message, HttpStatus.CONFLICT);
  }
}
