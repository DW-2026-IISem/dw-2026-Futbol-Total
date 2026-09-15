import { BusinessRuleException } from '../../../../../common/exceptions';

export class ProductTypeNameAlreadyExistsException extends BusinessRuleException {
  constructor(name: string) {
    super(`El tipo de producto ${name} ya está registrado`);
  }
}