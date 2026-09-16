import { Inject, Injectable } from '@nestjs/common';
import { Sale } from '../../domain/entities/sale.entity';
import { SaleNotFoundException } from '../../domain/exceptions/sale-not-found.exception';
import { SALE_REPOSITORY, type ISaleRepository } from '../../domain/interfaces/sale.repository';

@Injectable()
export class GetSaleById {
  constructor(
    @Inject(SALE_REPOSITORY)
    private readonly repository: ISaleRepository,
  ) {}

  async execute(id: number): Promise<Sale> {
    const sale = await this.repository.findById(id);

    if (!sale) {
      throw new SaleNotFoundException(id);
    }

    return sale;
  }
}
