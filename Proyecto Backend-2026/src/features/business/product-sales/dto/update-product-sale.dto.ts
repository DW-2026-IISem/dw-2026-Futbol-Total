/**
 * Datos de entrada de `PUT /api/detalle-ventas/:id`.
 * El estado se cambia mediante borrado lógico para mantener stock y totales.
 */
export interface UpdateProductSaleDto {
  quantity: number;
}
