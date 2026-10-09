import { ProductSale, ProductSaleI } from "../product-sale.model";

/** Respuesta plana de una línea de venta. */
export type ProductSaleResponseDto = ProductSaleI;

export function toProductSaleResponse(
  productSale: ProductSale,
): ProductSaleResponseDto {
  return productSale.toJSON() as ProductSaleResponseDto;
}
