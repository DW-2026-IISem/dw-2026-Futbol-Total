import { EntityNotFoundException } from '../../../../../common/exceptions';

export class ProductTypeNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Tipo de producto con id ${id} no encontrado`);
  }
}