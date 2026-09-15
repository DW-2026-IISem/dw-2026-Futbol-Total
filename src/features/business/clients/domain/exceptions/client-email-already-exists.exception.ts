import { BusinessRuleException } from '../../../../../common/exceptions';

export class ClientEmailAlreadyExistsException extends BusinessRuleException {
  constructor(email: string) {
    super(`El email ${email} ya está registrado`);
  }
}
