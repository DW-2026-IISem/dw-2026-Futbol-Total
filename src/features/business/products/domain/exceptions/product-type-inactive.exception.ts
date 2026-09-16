import { BusinessRuleException } from '../../../../../common/exceptions';

export class ProductTypeInactiveException extends BusinessRuleException {
  constructor(productTypeId: number) {
    super(`El tipo de producto con id ${productTypeId} está inactivo`);
  }
}
