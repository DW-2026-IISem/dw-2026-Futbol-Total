import { EntityNotFoundException } from '../../../../../common/exceptions';

export class ClientNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Cliente con id ${id} no encontrado`);
  }
}
