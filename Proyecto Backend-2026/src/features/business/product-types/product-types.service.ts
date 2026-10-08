import {
  CreateProductTypeDto,
  PatchProductTypeDto,
  ProductTypeResponseDto,
  toProductTypeResponse,
  UpdateProductTypeDto,
} from "./dto";
import { ProductType } from "./product-type.model";
import { ProductTypesRepository } from "./product-types.repository";
import { AppError } from "../../../shared/errors/app-error";

/**
 * Capa Service del feature ProductTypes.
 * Aplica las reglas de negocio y delega la persistencia en el repository.
 */
export class ProductTypesService {
  public constructor(
    private readonly repository: ProductTypesRepository = new ProductTypesRepository(),
  ) {}

  // ================== READ ==================
  public async getAll(): Promise<ProductTypeResponseDto[]> {
    const productTypes = await this.repository.findAllActive();
    return productTypes.map((productType) => toProductTypeResponse(productType));
  }

  public async getOne(id: number): Promise<ProductTypeResponseDto> {
    return toProductTypeResponse(await this.findOrFail(id));
  }

  // ================== CREATE ==================
  public async create(body: CreateProductTypeDto): Promise<ProductTypeResponseDto> {
    const productType = await this.repository.create({
      name: body.name,
      description: body.description ?? null,
      status: body.status ?? "active",
    });
    return toProductTypeResponse(productType);
  }

  // ================== UPDATE ==================
  public async updatePut(
    id: number,
    body: UpdateProductTypeDto,
  ): Promise<ProductTypeResponseDto> {
    const productType = await this.findOrFail(id);

    await this.repository.update(productType, {
      name: body.name,
      description: body.description ?? null,
    });
    return toProductTypeResponse(productType);
  }

  public async updatePatch(
    id: number,
    body: PatchProductTypeDto,
  ): Promise<ProductTypeResponseDto> {
    const productType = await this.findOrFail(id);

    await this.repository.update(productType, body);
    return toProductTypeResponse(productType);
  }

  // ================== DELETE ==================
  /** Eliminación física. */
  public async deletePhysical(id: number): Promise<void> {
    const productType = await this.findOrFail(id, false);
    await this.repository.delete(productType);
  }

  /** Eliminación lógica -> status = inactive. */
  public async deleteLogical(id: number): Promise<ProductTypeResponseDto> {
    const productType = await this.findOrFail(id);

    await this.repository.update(productType, { status: "inactive" });
    return toProductTypeResponse(productType);
  }

  // ================== HELPERS ==================
  private async findOrFail(id: number, onlyActive = true): Promise<ProductType> {
    const productType = await this.repository.findById(id);
    if (!productType || (onlyActive && productType.status !== "active")) {
      throw new AppError(404, "Product type not found");
    }
    return productType;
  }
}
