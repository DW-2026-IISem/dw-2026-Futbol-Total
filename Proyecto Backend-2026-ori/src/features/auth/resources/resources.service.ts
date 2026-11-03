import { AppError } from "../../../shared/errors/app-error";
import { normalizePath } from "../../../shared/auth/resource-match";
import {
  CreateResourceDto,
  PatchResourceDto,
  ResourceResponseDto,
  toResourceResponse,
  UpdateResourceDto,
} from "./dto";
import { Resource } from "./resource.model";
import { ResourcesRepository } from "./resources.repository";

export class ResourcesService {
  public constructor(
    private readonly repository: ResourcesRepository = new ResourcesRepository(),
  ) {}

  public async getAll(): Promise<ResourceResponseDto[]> {
    const resources = await this.repository.findAllActive();
    return resources.map(toResourceResponse);
  }

  public async getOne(id: number): Promise<ResourceResponseDto> {
    return toResourceResponse(await this.findOrFail(id));
  }

  public async create(body: CreateResourceDto): Promise<ResourceResponseDto> {
    const operation = this.normalizeOperation(body.method, body.path);
    await this.assertOperationAvailable(operation.method, operation.path);
    try {
      const resource = await this.repository.create({
        ...operation,
        description: body.description ?? null,
        status: body.status ?? "active",
      });
      return toResourceResponse(resource);
    } catch (error) {
      this.throwIfDuplicateOperation(error);
      throw error;
    }
  }

  public async updatePut(
    id: number,
    body: UpdateResourceDto,
  ): Promise<ResourceResponseDto> {
    const resource = await this.findOrFail(id);
    const operation = this.normalizeOperation(body.method, body.path);
    await this.assertOperationAvailable(operation.method, operation.path, id);
    try {
      const updated = await this.repository.update(resource, {
        ...operation,
        description: body.description ?? null,
      });
      return toResourceResponse(updated);
    } catch (error) {
      this.throwIfDuplicateOperation(error);
      throw error;
    }
  }

  public async updatePatch(
    id: number,
    body: PatchResourceDto,
  ): Promise<ResourceResponseDto> {
    const resource = await this.findOrFail(id);
    const data: Partial<Pick<Resource, "method" | "path" | "description">> = {};

    const method = body.method === undefined
      ? resource.method
      : body.method.trim().toUpperCase();
    const path = body.path === undefined
      ? resource.path
      : normalizePath(body.path.trim());

    if (body.method !== undefined || body.path !== undefined) {
      await this.assertOperationAvailable(method, path, id);
      data.method = method;
      data.path = path;
    }
    if (body.description !== undefined) data.description = body.description;
    try {
      const updated = await this.repository.update(resource, data);
      return toResourceResponse(updated);
    } catch (error) {
      this.throwIfDuplicateOperation(error);
      throw error;
    }
  }

  public async deletePhysical(id: number): Promise<void> {
    const resource = await this.findOrFail(id, false);
    await this.repository.delete(resource);
  }

  public async deleteLogical(id: number): Promise<ResourceResponseDto> {
    const resource = await this.findOrFail(id);
    const updated = await this.repository.update(resource, { status: "inactive" });
    return toResourceResponse(updated);
  }

  private async findOrFail(id: number, onlyActive = true): Promise<Resource> {
    const resource = await this.repository.findById(id);
    if (!resource || (onlyActive && resource.status !== "active")) {
      throw new AppError(404, "Resource not found");
    }
    return resource;
  }

  private normalizeOperation(
    method: string,
    path: string,
  ): { method: string; path: string } {
    return {
      method: method.trim().toUpperCase(),
      path: normalizePath(path.trim()),
    };
  }

  private async assertOperationAvailable(
    method: string,
    path: string,
    excludeId?: number,
  ): Promise<void> {
    const existing = await this.repository.findByOperation(method, path);
    if (existing && existing.id !== excludeId) {
      throw new AppError(409, "Resource operation already exists");
    }
  }

  private throwIfDuplicateOperation(error: unknown): void {
    if (
      error instanceof Error &&
      error.name === "SequelizeUniqueConstraintError"
    ) {
      throw new AppError(409, "Resource operation already exists");
    }
  }
}
