import { Transaction } from "sequelize";
import {
  CreateProductSaleDto,
  PatchProductSaleDto,
  ProductSaleResponseDto,
  toProductSaleResponse,
  UpdateProductSaleDto,
} from "./dto";
import { ProductSale } from "./product-sale.model";
import { ProductSalesRepository } from "./product-sales.repository";
import { SalesRepository } from "../sales/sales.repository";
import { ProductsRepository } from "../products/products.repository";
import { Product } from "../products/product.model";
import { AppError } from "../../../shared/errors/app-error";
import { withTransaction } from "../../../shared/database/with-transaction";

export class ProductSalesService {
  public constructor(
    private readonly repository: ProductSalesRepository = new ProductSalesRepository(),
    private readonly salesRepository: SalesRepository = new SalesRepository(),
    private readonly productsRepository: ProductsRepository = new ProductsRepository(),
  ) {}

  public async getAll(): Promise<ProductSaleResponseDto[]> {
    const rows = await this.repository.findAllActive();
    return rows.map(toProductSaleResponse);
  }

  public async getOne(id: number): Promise<ProductSaleResponseDto> {
    return toProductSaleResponse(await this.findOrFail(id));
  }

  public async create(body: CreateProductSaleDto): Promise<ProductSaleResponseDto> {
    if (
      !Number.isInteger(body.sale_id) ||
      body.sale_id < 1 ||
      !Number.isInteger(body.product_id) ||
      body.product_id < 1 ||
      !Number.isInteger(body.quantity) ||
      body.quantity < 1
    ) {
      throw new AppError(400, "sale_id, product_id and quantity (>=1) are required");
    }

    return withTransaction(async (transaction) => {
      const sale = await this.salesRepository.findByIdForUpdate(
        body.sale_id,
        transaction,
      );
      if (!sale) {
        throw new AppError(404, "Sale not found");
      }
      if (sale.status !== "active") {
        throw new AppError(400, "Sale must be active");
      }

      const product = await this.productsRepository.findByIdForUpdate(
        body.product_id,
        transaction,
      );
      if (!product) {
        throw new AppError(404, "Product not found");
      }
      if (product.status !== "active") {
        throw new AppError(400, "Product must be active");
      }
      const status = body.status ?? "active";
      if (status === "active" && product.quantity < body.quantity) {
        throw new AppError(
          400,
          `Insufficient stock (available: ${product.quantity}, requested: ${body.quantity})`,
        );
      }

      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * body.quantity;
      const productSale = await this.repository.create(
        {
          sale_id: body.sale_id,
          product_id: body.product_id,
          quantity: body.quantity,
          unit_price: unitPrice,
          line_total: lineTotal,
          status,
        },
        transaction,
      );

      if (status === "active") {
        await this.productsRepository.update(
          product,
          { quantity: product.quantity - body.quantity },
          transaction,
        );
      }
      await this.recalcSaleTotals(body.sale_id, transaction);
      return toProductSaleResponse(productSale);
    });
  }

  public async updatePut(
    id: number,
    body: UpdateProductSaleDto,
  ): Promise<ProductSaleResponseDto> {
    return withTransaction(async (transaction) => {
      const { productSale, product } = await this.lockLine(id, transaction);
      const newQuantity = Number(body.quantity);
      if (!Number.isInteger(newQuantity) || newQuantity < 1) {
        throw new AppError(400, "quantity (>=1) is required");
      }

      await this.applyQuantityDelta(productSale, product, newQuantity, transaction);
      await this.repository.update(
        productSale,
        {
          quantity: newQuantity,
          line_total: Number(productSale.unit_price) * newQuantity,
        },
        transaction,
      );
      await this.recalcSaleTotals(productSale.sale_id, transaction);
      return toProductSaleResponse(productSale);
    });
  }

  public async updatePatch(
    id: number,
    body: PatchProductSaleDto,
  ): Promise<ProductSaleResponseDto> {
    return withTransaction(async (transaction) => {
      const { productSale, product } = await this.lockLine(id, transaction);
      if (body.quantity !== undefined) {
        const newQuantity = Number(body.quantity);
        if (!Number.isInteger(newQuantity) || newQuantity < 1) {
          throw new AppError(400, "quantity must be >= 1");
        }
        await this.applyQuantityDelta(
          productSale,
          product,
          newQuantity,
          transaction,
        );
        await this.repository.update(
          productSale,
          {
            quantity: newQuantity,
            line_total: Number(productSale.unit_price) * newQuantity,
          },
          transaction,
        );
      }

      await this.recalcSaleTotals(productSale.sale_id, transaction);
      return toProductSaleResponse(productSale);
    });
  }

  public async deletePhysical(id: number): Promise<void> {
    await withTransaction(async (transaction) => {
      const { productSale, product } = await this.lockLine(id, transaction, false);
      if (productSale.status === "active") {
        await this.productsRepository.update(
          product,
          { quantity: product.quantity + productSale.quantity },
          transaction,
        );
      }

      await this.repository.delete(productSale, transaction);
      await this.recalcSaleTotals(productSale.sale_id, transaction);
    });
  }

  public async deleteLogical(id: number): Promise<ProductSaleResponseDto> {
    return withTransaction(async (transaction) => {
      const { productSale, product } = await this.lockLine(id, transaction);
      await this.productsRepository.update(
        product,
        { quantity: product.quantity + productSale.quantity },
        transaction,
      );
      await this.repository.update(
        productSale,
        { status: "inactive" },
        transaction,
      );
      await this.recalcSaleTotals(productSale.sale_id, transaction);
      return toProductSaleResponse(productSale);
    });
  }

  private async findOrFail(id: number, onlyActive = true): Promise<ProductSale> {
    const productSale = await this.repository.findById(id);
    if (!productSale || (onlyActive && productSale.status !== "active")) {
      throw new AppError(404, "Product sale not found");
    }
    return productSale;
  }

  private async lockLine(
    id: number,
    transaction: Transaction,
    onlyActive = true,
  ): Promise<{ productSale: ProductSale; product: Product }> {
    const snapshot = await this.repository.findById(id, transaction);
    if (!snapshot) {
      throw new AppError(404, "Product sale not found");
    }

    const sale = await this.salesRepository.findByIdForUpdate(
      snapshot.sale_id,
      transaction,
    );
    if (!sale) {
      throw new AppError(404, "Sale not found");
    }
    const product = await this.productsRepository.findByIdForUpdate(
      snapshot.product_id,
      transaction,
    );
    if (!product) {
      throw new AppError(404, "Product not found");
    }

    const productSale = await this.repository.findByIdForUpdate(id, transaction);
    if (!productSale || (onlyActive && productSale.status !== "active")) {
      throw new AppError(404, "Product sale not found");
    }
    return { productSale, product };
  }

  private async applyQuantityDelta(
    productSale: ProductSale,
    product: Product,
    newQuantity: number,
    transaction: Transaction,
  ): Promise<void> {
    const delta = newQuantity - productSale.quantity;
    if (delta > 0 && product.quantity < delta) {
      throw new AppError(
        400,
        `Insufficient stock (available: ${product.quantity}, requested_extra: ${delta})`,
      );
    }
    if (delta !== 0) {
      await this.productsRepository.update(
        product,
        { quantity: product.quantity - delta },
        transaction,
      );
    }
  }

  private async recalcSaleTotals(
    saleId: number,
    transaction: Transaction,
  ): Promise<void> {
    const items = await this.repository.findActiveBySaleId(saleId, transaction);
    const subtotal = items.reduce(
      (sum, row) => sum + Number(row.line_total),
      0,
    );
    const sale = await this.salesRepository.findById(saleId, transaction);
    if (!sale) {
      throw new AppError(404, "Sale not found");
    }

    await this.salesRepository.update(
      sale,
      { subtotal, total: subtotal + Number(sale.tax) - Number(sale.discounts) },
      transaction,
    );
  }
}
