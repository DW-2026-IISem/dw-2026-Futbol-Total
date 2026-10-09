export interface SaleItemDto {
  product_id: number;
  quantity: number;
}

export interface CreateSaleDto {
  client_id: number;
  tax?: number;
  discounts?: number;
  sale_date?: Date | string;
  status?: "active" | "inactive";
  items: SaleItemDto[];
}
