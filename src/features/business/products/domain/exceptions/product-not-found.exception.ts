import { EntityNotFoundException } from '../../../../../common/exceptions';

export class ProductNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Producto con id ${id} no encontrado`);
  }
}
