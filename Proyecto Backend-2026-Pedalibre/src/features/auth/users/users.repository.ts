import { CreationAttributes, Op, Transaction } from "sequelize";
import { RefreshToken } from "../refresh-tokens/refresh-token.model";
import { User, UserI } from "./user.model";
import { ResourceRolesRepository } from "../resource-roles/resource-roles.repository";

export interface EffectivePermission {
  method: string;
  path: string;
}

export class UsersRepository {
  private static readonly WITHOUT_PASSWORD = { exclude: ["password"] };

  public async findAll(): Promise<User[]> {
    return User.findAll({
      where: { is_active: true },
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
    return user.update({ is_active: false }, { transaction });
  }

  public async delete(user: User): Promise<void> {
    await user.destroy();
  }

  public async getEffectivePermissions(
    userId: number,
  ): Promise<EffectivePermission[]> {
    const permissions = await new ResourceRolesRepository().findEffectiveForUser(userId);
    return permissions.map(({ method, path }) => ({ method, path }));
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
