import { DomainException } from '../../../../../common/exceptions';

export class EmptySaleException extends DomainException {
  constructor() {
    super('La venta no puede estar vacía');
  }
}
