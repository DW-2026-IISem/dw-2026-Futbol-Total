import { Role, RoleI } from "../role.model";

export type RoleResponseDto = RoleI;

export function toRoleResponse(role: Role): RoleResponseDto {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    status: role.status,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}
