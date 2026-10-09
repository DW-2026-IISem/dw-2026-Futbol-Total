import { Sale, SaleI } from "../sale.model";
import { ProductSaleResponseDto } from "../../product-sales/dto";

export type SaleResponseDto = SaleI & { items?: ProductSaleResponseDto[] };

export interface CreateSaleResultDto {
  sale: SaleResponseDto;
  items: ProductSaleResponseDto[];
}

export function toSaleResponse(sale: Sale): SaleResponseDto {
  return sale.toJSON() as SaleResponseDto;
}
