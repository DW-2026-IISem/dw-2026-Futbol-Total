import { CreationAttributes, Transaction } from "sequelize";
import { User, UserI } from "./user.model";

export class UsersRepository {
  public async findAll(): Promise<User[]> {
    return User.findAll();
  }

  public async findById(
    id: number,
    transaction?: Transaction,
  ): Promise<User | null> {
    return User.findByPk(id, { transaction });
  }

  public async findByUsername(
    username: string,
    transaction?: Transaction,
  ): Promise<User | null> {
    return User.findOne({
      where: { username: username.trim().toLowerCase() },
      transaction,
    });
  }

  public async findByEmail(
    email: string,
    transaction?: Transaction,
  ): Promise<User | null> {
    return User.findOne({
      where: { email: email.trim().toLowerCase() },
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
}
