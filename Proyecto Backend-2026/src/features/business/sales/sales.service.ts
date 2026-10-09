import { Transaction } from "sequelize";
import {
  CreateSaleDto,
  CreateSaleResultDto,
  PatchSaleDto,
  SaleResponseDto,
  toSaleResponse,
  UpdateSaleDto,
} from "./dto";
import { toProductSaleResponse } from "../product-sales/dto";
import { SalesRepository } from "./sales.repository";
import { ProductSalesRepository } from "../product-sales/product-sales.repository";
import { ProductsRepository } from "../products/products.repository";
import { ClientsRepository } from "../clients/clients.repository";
import { Product } from "../products/product.model";
import { ProductSale } from "../product-sales/product-sale.model";
import { Sale } from "./sale.model";
import { AppError } from "../../../shared/errors/app-error";
import { withTransaction } from "../../../shared/database/with-transaction";

type SaleLine = {
  product_id: number;
  quantity: number;
  unit_price: number;
  line_total: number;
  product: Product;
};

export class SalesService {
  public constructor(
    private readonly repository: SalesRepository = new SalesRepository(),
    private readonly productSalesRepository: ProductSalesRepository = new ProductSalesRepository(),
    private readonly productsRepository: ProductsRepository = new ProductsRepository(),
    private readonly clientsRepository: ClientsRepository = new ClientsRepository(),
  ) {}

  public async getAll(): Promise<SaleResponseDto[]> {
    const sales = await this.repository.findAllActiveWithItems();
    return sales.map(toSaleResponse);
  }

  public async getOne(id: number): Promise<SaleResponseDto> {
    return toSaleResponse(await this.findOrFail(id));
  }

  public async create(body: CreateSaleDto): Promise<CreateSaleResultDto> {
    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new AppError(400, "Sale requires at least one item");
    }
    if (!Number.isInteger(body.client_id) || body.client_id < 1) {
      throw new AppError(400, "client_id must be a positive integer");
    }
    if (body.status !== undefined && body.status !== "active" && body.status !== "inactive") {
      throw new AppError(400, "status must be active or inactive");
    }
    if (
      body.items.some(
        (item) =>
          !item ||
          !Number.isInteger(item.product_id) ||
          item.product_id < 1 ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1,
      )
    ) {
      throw new AppError(400, "Each item requires a positive product_id and quantity");
    }

    const tax = Number(body.tax ?? 0);
    const discounts = Number(body.discounts ?? 0);
    if (!Number.isFinite(tax) || tax < 0 || !Number.isFinite(discounts) || discounts < 0) {
      throw new AppError(400, "tax and discounts must be non-negative numbers");
    }

    return withTransaction(async (transaction) => {
      await this.assertActiveClient(body.client_id, transaction);

      const quantities = new Map<number, number>();
      for (const item of body.items) {
        quantities.set(
          item.product_id,
          (quantities.get(item.product_id) ?? 0) + item.quantity,
        );
      }

      const products = new Map<number, Product>();
      for (const [productId, quantity] of [...quantities.entries()].sort(
        ([first], [second]) => first - second,
      )) {
        const product = await this.productsRepository.findByIdForUpdate(
          productId,
          transaction,
        );
        if (!product) {
          throw new AppError(404, `Product not found: ${productId}`);
        }
        if (product.status !== "active") {
          throw new AppError(400, `Product must be active: ${productId}`);
        }
        if (product.quantity < quantity) {
          throw new AppError(
            400,
            `Insufficient stock for product ${productId} (available: ${product.quantity}, requested: ${quantity})`,
          );
        }
        products.set(productId, product);
      }

      const lineRows: SaleLine[] = body.items.map((item) => {
        const product = products.get(item.product_id)!;
        const unit_price = Number(product.price);
        const line_total = unit_price * item.quantity;
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price,
          line_total,
          product,
        };
      });
      const subtotal = lineRows.reduce((sum, line) => sum + line.line_total, 0);
      const status = body.status ?? "active";
      const sale = await this.repository.create(
        {
          sale_date: body.sale_date ?? new Date(),
          subtotal,
          tax,
          discounts,
          total: subtotal + tax - discounts,
          client_id: body.client_id,
          status,
        },
        transaction,
      );

      const items: ProductSale[] = [];
      for (const line of lineRows) {
        items.push(
          await this.productSalesRepository.create(
            {
              sale_id: sale.id,
              product_id: line.product_id,
              quantity: line.quantity,
              unit_price: line.unit_price,
              line_total: line.line_total,
              status,
            },
            transaction,
          ),
        );
      }

      if (status === "active") {
        for (const [productId, quantity] of [...quantities.entries()].sort(
          ([first], [second]) => first - second,
        )) {
          const product = products.get(productId)!;
          await this.productsRepository.update(
            product,
            { quantity: product.quantity - quantity },
            transaction,
          );
        }
      }

      return {
        sale: toSaleResponse(sale),
        items: items.map(toProductSaleResponse),
      };
    });
  }

  public async updatePut(
    id: number,
    body: UpdateSaleDto,
  ): Promise<SaleResponseDto> {
    const sale = await this.findOrFail(id);
    if (body.client_id !== undefined) {
      this.assertValidClientId(body.client_id);
      await this.assertActiveClient(body.client_id);
    }

    const tax = Number(body.tax ?? 0);
    const discounts = Number(body.discounts ?? 0);
    if (!Number.isFinite(tax) || tax < 0 || !Number.isFinite(discounts) || discounts < 0) {
      throw new AppError(400, "tax and discounts must be non-negative numbers");
    }

    await this.repository.update(sale, {
      sale_date: body.sale_date ?? sale.sale_date,
      tax,
      discounts,
      total: Number(sale.subtotal) + tax - discounts,
      client_id: body.client_id ?? sale.client_id,
    });
    return toSaleResponse(sale);
  }

  public async updatePatch(
    id: number,
    body: PatchSaleDto,
  ): Promise<SaleResponseDto> {
    const sale = await this.findOrFail(id);
    if (body.client_id !== undefined) {
      this.assertValidClientId(body.client_id);
      await this.assertActiveClient(body.client_id);
    }

    const tax = body.tax !== undefined ? Number(body.tax) : Number(sale.tax);
    const discounts =
      body.discounts !== undefined ? Number(body.discounts) : Number(sale.discounts);
    if (!Number.isFinite(tax) || tax < 0 || !Number.isFinite(discounts) || discounts < 0) {
      throw new AppError(400, "tax and discounts must be non-negative numbers");
    }
    const needsRecalc = body.tax !== undefined || body.discounts !== undefined;

    await this.repository.update(sale, {
      sale_date: body.sale_date ?? sale.sale_date,
      client_id: body.client_id ?? sale.client_id,
      tax,
      discounts,
      total: needsRecalc
        ? Number(sale.subtotal) + tax - discounts
        : Number(sale.total),
    });
    return toSaleResponse(sale);
  }

  public async deletePhysical(id: number): Promise<void> {
    await withTransaction(async (transaction) => {
      const sale = await this.repository.findByIdForUpdate(id, transaction);
      if (!sale) {
        throw new AppError(404, "Sale not found");
      }
      await this.releaseStockOfActiveLines(id, transaction);
      await this.productSalesRepository.deleteBySaleId(id, transaction);
      await this.repository.delete(sale, transaction);
    });
  }

  public async deleteLogical(id: number): Promise<SaleResponseDto> {
    return withTransaction(async (transaction) => {
      const sale = await this.findOrFail(id, transaction);
      await this.repository.findByIdForUpdate(id, transaction);
      await this.releaseStockOfActiveLines(id, transaction);
      await this.repository.update(sale, { status: "inactive" }, transaction);
      await this.productSalesRepository.deactivateBySaleId(id, transaction);

      const updated = await this.repository.findWithItemsById(id, transaction);
      return toSaleResponse(updated ?? sale);
    });
  }

  private async releaseStockOfActiveLines(
    saleId: number,
    transaction: Transaction,
  ): Promise<void> {
    const lines = await this.productSalesRepository.findActiveBySaleId(
      saleId,
      transaction,
    );
    const ordered = [...lines].sort((first, second) => first.product_id - second.product_id);

    for (const line of ordered) {
      const product = await this.productsRepository.findByIdForUpdate(
        line.product_id,
        transaction,
      );
      if (!product) {
        continue;
      }
      await this.productsRepository.update(
        product,
        { quantity: product.quantity + line.quantity },
        transaction,
      );
    }
  }

  private async findOrFail(
    id: number,
    transaction?: Transaction,
  ): Promise<Sale> {
    const sale = await this.repository.findWithItemsById(id, transaction);
    if (!sale || sale.status !== "active") {
      throw new AppError(404, "Sale not found");
    }
    return sale;
  }

  private async assertActiveClient(
    clientId: number,
    transaction?: Transaction,
  ): Promise<void> {
    const client = await this.clientsRepository.findById(clientId, transaction);
    if (!client) {
      throw new AppError(404, "Client not found");
    }
    if (client.status !== "active") {
      throw new AppError(400, "Client must be active");
    }

    private assertValidClientId(clientId: number): void {
      if (!Number.isInteger(clientId) || clientId < 1) {
        throw new AppError(400, "client_id must be a positive integer");
      }
    }
  }
}
