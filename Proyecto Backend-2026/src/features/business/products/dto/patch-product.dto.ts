import { UpdateProductDto } from "./update-product.dto";

/** Datos de entrada de `PATCH /api/productos/:id` (actualización parcial). */
export type PatchProductDto = Partial<UpdateProductDto>;
