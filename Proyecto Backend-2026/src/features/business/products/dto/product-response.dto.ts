import { Product, ProductI } from "../product.model";

/**
 * Respuesta HTTP de un producto. Lo usan `GET /api/productos`,
 * `GET /api/productos/:id` y la salida de create/update/delete lógico.
 *
 * Product no guarda campos internos, por eso el contrato coincide hoy con el
 * modelo. Si aparece uno, la proyección se vuelve explícita y el mapper lo omite.
 */
export type ProductResponseDto = ProductI;

/** Mapper modelo -> DTO de respuesta (objeto plano, sin métodos de Sequelize). */
export function toProductResponse(product: Product): ProductResponseDto {
  return product.toJSON() as ProductResponseDto;
}
