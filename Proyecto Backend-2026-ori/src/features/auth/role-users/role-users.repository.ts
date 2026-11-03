import { CreationAttributes, Transaction } from "sequelize";
import { Role } from "../roles/role.model";
import { User } from "../users/user.model";
import { RoleUser } from "./role-user.model";

const SUMMARIES = [
  { model: User, as: "user", attributes: ["id", "username", "email"] },
  { model: Role, as: "role", attributes: ["id", "name"] },
];

export class RoleUsersRepository {
  public async findAllActive(): Promise<RoleUser[]> {
    return RoleUser.findAll({
      where: { status: "active" },
      include: SUMMARIES,
    });
  }

  public async findById(
    id: number,
    transaction?: Transaction,
  ): Promise<RoleUser | null> {
    return RoleUser.findByPk(id, { include: SUMMARIES, transaction });
  }

  public async findByUserAndRole(
    userId: number,
    roleId: number,
    transaction?: Transaction,
  ): Promise<RoleUser | null> {
    return RoleUser.findOne({
      where: { user_id: userId, role_id: roleId },
      transaction,
    });
  }

  public async create(
    data: CreationAttributes<RoleUser>,
    transaction?: Transaction,
  ): Promise<RoleUser> {
    return RoleUser.create(data, { transaction });
  }

  public async update(
    roleUser: RoleUser,
    data: Partial<RoleUser>,
    transaction?: Transaction,
  ): Promise<RoleUser> {
    return roleUser.update(data, { transaction });
  }
}
