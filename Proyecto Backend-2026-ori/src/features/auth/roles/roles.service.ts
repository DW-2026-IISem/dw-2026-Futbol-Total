import {
  CreateRoleDto,
  PatchRoleDto,
  RoleResponseDto,
  toRoleResponse,
  UpdateRoleDto,
} from "./dto";
import { AppError } from "../../../shared/errors/app-error";
import { Role } from "./role.model";
import { RolesRepository } from "./roles.repository";

export class RolesService {
  public constructor(
    private readonly repository: RolesRepository = new RolesRepository(),
  ) {}

  public async getAll(): Promise<RoleResponseDto[]> {
    const roles = await this.repository.findAllActive();
    return roles.map(toRoleResponse);
  }

  public async getOne(id: number): Promise<RoleResponseDto> {
    return toRoleResponse(await this.findOrFail(id));
  }

  public async create(body: CreateRoleDto): Promise<RoleResponseDto> {
    const name = body.name?.trim();
    if (!name) {
      throw new AppError(400, "name is required");
    }
    await this.assertNameAvailable(name);

    const role = await this.repository.create({
      name,
      description: body.description ?? null,
      status: body.status ?? "active",
    });
    return toRoleResponse(role);
  }

  public async updatePut(
    id: number,
    body: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    const role = await this.findOrFail(id);
    const name = body.name?.trim();
    if (!name) {
      throw new AppError(400, "name is required");
    }
    await this.assertNameAvailable(name, id);

    await this.repository.update(role, {
      name,
      description: body.description ?? null,
    });
    return toRoleResponse(role);
  }

  public async updatePatch(
    id: number,
    body: PatchRoleDto,
  ): Promise<RoleResponseDto> {
    const role = await this.findOrFail(id);
    const data: Partial<Pick<Role, "name" | "description">> = {};

    if (body.name !== undefined) {
      const name = body.name.trim();
      if (!name) {
        throw new AppError(400, "name cannot be empty");
      }
      await this.assertNameAvailable(name, id);
      data.name = name;
    }
    if (body.description !== undefined) {
      data.description = body.description;
    }

    await this.repository.update(role, data);
    return toRoleResponse(role);
  }

  public async deletePhysical(id: number): Promise<void> {
    const role = await this.findOrFail(id, false);
    await this.repository.delete(role);
  }

  public async deleteLogical(id: number): Promise<RoleResponseDto> {
    const role = await this.findOrFail(id);
    await this.repository.update(role, { status: "inactive" });
    return toRoleResponse(role);
  }

  private async findOrFail(id: number, onlyActive = true): Promise<Role> {
    const role = await this.repository.findById(id);
    if (!role || (onlyActive && role.status !== "active")) {
      throw new AppError(404, "Role not found");
    }
    return role;
  }

  private async assertNameAvailable(
    name: string,
    excludeId?: number,
  ): Promise<void> {
    const existing = await this.repository.findByName(name);
    if (existing && existing.id !== excludeId) {
      throw new AppError(409, "Role name already in use");
    }
  }
}
