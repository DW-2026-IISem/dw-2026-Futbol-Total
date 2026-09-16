import { EntityNotFoundException } from '../../../../../common/exceptions';

export class SaleNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Venta con id ${id} no encontrada`);
  }
}
