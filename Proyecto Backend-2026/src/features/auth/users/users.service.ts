import { sequelize } from "../../../database/db";
import { comparePassword } from "../../../shared/auth/password";
import { AppError } from "../../../shared/errors/app-error";
import {
  ChangePasswordDto,
  CreateUserDto,
  PatchUserDto,
  toUserResponse,
  UpdateUserDto,
  UserResponseDto,
} from "./dto";
import { User, UserI } from "./user.model";
import { UsersRepository } from "./users.repository";

export class UsersService {
  public constructor(
    private readonly repository: UsersRepository = new UsersRepository(),
  ) {}

  public async getAll(): Promise<UserResponseDto[]> {
    const users = await this.repository.findAll();
    return users.map(toUserResponse);
  }

  public async getOne(id: number): Promise<UserResponseDto> {
    return toUserResponse(await this.findOrFail(id));
  }

  public async create(body: CreateUserDto): Promise<UserResponseDto> {
    await this.ensureUniqueFields(body.username, body.email);
    const user = await this.repository.create({
      username: body.username,
      email: body.email,
      password: body.password,
      avatar: body.avatar,
      status: body.status,
    });
    return toUserResponse(user);
  }

  public async updatePut(
    id: number,
    body: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.findOrFail(id);
    await this.ensureUniqueFields(body.username, body.email, user.id);
    const data: Partial<UserI> = {
      username: body.username,
      email: body.email,
      avatar: body.avatar,
    };
    return toUserResponse(await this.repository.update(user, data));
  }

  public async updatePatch(
    id: number,
    body: PatchUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.findOrFail(id);
    await this.ensureUniqueFields(body.username, body.email, user.id);
    const data: Partial<UserI> = {};
    if (body.username !== undefined) data.username = body.username;
    if (body.email !== undefined) data.email = body.email;
    if (body.avatar !== undefined) data.avatar = body.avatar;
    return toUserResponse(await this.repository.update(user, data));
  }

  public async changePassword(
    id: number,
    body: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.findOrFail(id);
    if (!(await comparePassword(body.current_password, user.password))) {
      throw new AppError(401, "Current password is incorrect");
    }

    await sequelize.transaction(async (transaction) => {
      await this.repository.update(
        user,
        { password: body.new_password },
        transaction,
      );
      if (body.revoke_sessions) {
        await this.repository.deactivateActiveRefreshTokens(user.id, transaction);
      }
    });
  }

  public async deleteLogical(id: number): Promise<UserResponseDto> {
    const user = await this.findOrFail(id);
    await sequelize.transaction(async (transaction) => {
      await this.repository.deactivate(user, transaction);
      await this.repository.deactivateActiveRefreshTokens(user.id, transaction);
    });
    return toUserResponse(user);
  }

  private async findOrFail(id: number): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    return user;
  }

  private async ensureUniqueFields(
    username?: string,
    email?: string,
    exceptUserId?: number,
  ): Promise<void> {
    const normalizedUsername = username?.trim().toLowerCase();
    if (normalizedUsername) {
      const existing = await this.repository.findByUsername(normalizedUsername);
      if (existing && existing.id !== exceptUserId) {
        throw new AppError(409, "Username is already in use");
      }
    }

    const normalizedEmail = email?.trim().toLowerCase();
    if (normalizedEmail) {
      const existing = await this.repository.findByEmail(normalizedEmail);
      if (existing && existing.id !== exceptUserId) {
        throw new AppError(409, "Email is already in use");
      }
    }
  }
}
