export interface UpdateSaleDto {
  client_id?: number;
  tax?: number;
  discounts?: number;
  sale_date?: Date | string;
}
