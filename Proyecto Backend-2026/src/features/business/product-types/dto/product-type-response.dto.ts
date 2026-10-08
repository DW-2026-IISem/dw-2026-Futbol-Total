import { ProductType, ProductTypeI } from "../product-type.model";

/**
 * Respuesta HTTP de un tipo de producto. Lo usan `GET /api/tipos-producto`,
 * `GET /api/tipos-producto/:id` y la salida de create/update/delete lógico.
 *
 * ProductType no guarda campos internos, por eso el contrato coincide hoy con
 * el modelo. Si aparece uno, la proyección se vuelve explícita aquí y el mapper
 * lo omite.
 */
export type ProductTypeResponseDto = ProductTypeI;

/** Mapper modelo -> DTO de respuesta (objeto plano, sin métodos de Sequelize). */
export function toProductTypeResponse(
  productType: ProductType,
): ProductTypeResponseDto {
  return productType.toJSON() as ProductTypeResponseDto;
}
