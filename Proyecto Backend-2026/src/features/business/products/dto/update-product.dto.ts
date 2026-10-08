/**
 * Datos de entrada de `PUT /api/productos/:id` (reemplazo completo).
 *
 * `status` no está aquí a propósito: el estado sólo cambia con el borrado
 * lógico (`DELETE /api/productos/:id/deactivate`).
 */
export interface UpdateProductDto {
  name: string;
  brand: string;
  price: number;
  min_stock: number;
  quantity: number;
  product_type_id: number;
}
