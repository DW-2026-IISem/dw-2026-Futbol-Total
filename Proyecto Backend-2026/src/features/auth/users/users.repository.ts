import { CreationAttributes, Op, Transaction } from "sequelize";
import { RefreshToken } from "../refresh-tokens/refresh-token.model";
import { Resource } from "../resources/resource.model";
import { ResourceRole } from "../resource-roles/resource-role.model";
import { RoleUser } from "../role-users/role-user.model";
import { Role } from "../roles/role.model";
import { User, UserI } from "./user.model";

export interface EffectivePermission {
  method: string;
  path: string;
}

export class UsersRepository {
  private static readonly WITHOUT_PASSWORD = { exclude: ["password"] };

  public async findAll(): Promise<User[]> {
    return User.findAll({
      where: { status: "active" },
      attributes: UsersRepository.WITHOUT_PASSWORD,
    });
  }

  public async findById(
    id: number,
    transaction?: Transaction,
  ): Promise<User | null> {
    return User.findByPk(id, {
      attributes: UsersRepository.WITHOUT_PASSWORD,
      transaction,
    });
  }

  public async findByIdWithPassword(id: number): Promise<User | null> {
    return User.findByPk(id);
  }

  public async findByUsernameOrEmail(identifier: string): Promise<User | null> {
    const value = identifier.trim().toLowerCase();
    return User.findOne({
      where: { [Op.or]: [{ username: value }, { email: value }] },
    });
  }

  public async findByUsername(
    username: string,
    transaction?: Transaction,
  ): Promise<User | null> {
    return User.findOne({
      where: { username: username.trim().toLowerCase() },
      attributes: ["id", "username"],
      transaction,
    });
  }

  public async findByEmail(
    email: string,
    transaction?: Transaction,
  ): Promise<User | null> {
    return User.findOne({
      where: { email: email.trim().toLowerCase() },
      attributes: ["id", "email"],
      transaction,
    });
  }

  public async create(
    data: CreationAttributes<User>,
    transaction?: Transaction,
  ): Promise<User> {
    return User.create(data, { transaction });
  }

  public async update(
    user: User,
    data: Partial<UserI>,
    transaction?: Transaction,
  ): Promise<User> {
    return user.update(data, { transaction });
  }

  public async deactivate(
    user: User,
    transaction?: Transaction,
  ): Promise<User> {
    return user.update({ status: "inactive" }, { transaction });
  }

  public async getEffectivePermissions(
    userId: number,
  ): Promise<EffectivePermission[]> {
    const assignments = await RoleUser.findAll({
      where: { user_id: userId, status: "active" },
      attributes: ["role_id"],
    });
    const assignedRoleIds = assignments.map(({ role_id }) => role_id);
    if (assignedRoleIds.length === 0) return [];

    const activeRoles = await Role.findAll({
      where: { id: { [Op.in]: assignedRoleIds }, status: "active" },
      attributes: ["id"],
    });
    const roleIds = activeRoles.map(({ id }) => id);
    if (roleIds.length === 0) return [];

    const grants = await ResourceRole.findAll({
      where: { role_id: { [Op.in]: roleIds }, status: "active" },
      attributes: ["resource_id"],
    });
    const resourceIds = [...new Set(grants.map(({ resource_id }) => resource_id))];
    if (resourceIds.length === 0) return [];

    const resources = await Resource.findAll({
      where: { id: { [Op.in]: resourceIds }, status: "active" },
      attributes: ["method", "path"],
    });
    const uniquePermissions = new Map<string, EffectivePermission>();
    for (const resource of resources) {
      const permission = { method: resource.method, path: resource.path };
      uniquePermissions.set(`${permission.method} ${permission.path}`, permission);
    }
    return [...uniquePermissions.values()];
  }

  public async deactivateActiveRefreshTokens(
    userId: number,
    transaction?: Transaction,
  ): Promise<void> {
    await RefreshToken.update(
      { status: "inactive" },
      { where: { user_id: userId, status: "active" }, transaction },
    );
  }
}
