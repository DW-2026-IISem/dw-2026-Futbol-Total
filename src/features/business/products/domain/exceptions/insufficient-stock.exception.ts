import { BusinessRuleException } from '../../../../../common/exceptions';

export class InsufficientStockException extends BusinessRuleException {
  constructor(productId: number | undefined, available: number, requested: number) {
    const productReference = productId ? ` para el producto ${productId}` : '';
    super(
      `Stock insuficiente${productReference}: disponible ${available}, solicitado ${requested}`,
    );
  }
}
