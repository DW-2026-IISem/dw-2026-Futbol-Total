import { EffectivePermissionDto } from "../resource-roles/dto";
import { ResourceRolesService } from "../resource-roles/resource-roles.service";
import { RefreshTokensService } from "../refresh-tokens/refresh-tokens.service";
import { User } from "../users/user.model";
import { UsersRepository } from "../users/users.repository";
import {
  LoginDto,
  LogoutSessionDto,
  ProfileDto,
  RefreshSessionDto,
  SessionTokensDto,
} from "./dto";
import { AppError } from "../../../shared/errors/app-error";
import { comparePassword, hashPassword } from "../../../shared/auth/password";
import { signAccessToken } from "../../../shared/auth/jwt";
import { sequelize } from "../../../database/db";
import { UniqueConstraintError } from "sequelize";
import { ClientsRepository } from "../../business/clients/clients.repository";
import { RolesRepository } from "../roles/roles.repository";
import { RegisterClientDto } from "./dto";

export class SessionService {
  public constructor(
    private readonly usersRepository: UsersRepository = new UsersRepository(),
    private readonly refreshTokensService: RefreshTokensService = new RefreshTokensService(),
    private readonly resourceRolesService: ResourceRolesService = new ResourceRolesService(),
    private readonly rolesRepository: RolesRepository = new RolesRepository(),
    private readonly clientsRepository: ClientsRepository = new ClientsRepository(),
  ) {}

  public async registerClient(body: RegisterClientDto): Promise<void> {
    if (!body || typeof body !== "object") {
      throw new AppError(400, "Registration data is required");
    }

    const trimmed = (value: unknown): string =>
      typeof value === "string" ? value.trim() : "";
    if (body.phone != null && typeof body.phone !== "string") {
      throw new AppError(400, "phone must be a string");
    }
    const username = trimmed(body.username).toLowerCase();
    const email = trimmed(body.email).toLowerCase();
    const firstName = trimmed(body.first_name);
    const lastName = trimmed(body.last_name);
    const documentType = trimmed(body.document_type);
    const documentNumber = trimmed(body.document_number);
    const phone = trimmed(body.phone) || null;

    if (!username || username.length < 3 || username.length > 100) {
      throw new AppError(400, "username must be between 3 and 100 characters");
    }
    if (
      !email ||
      email.length > 150 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      throw new AppError(400, "email must be a valid email address");
    }
    if (
      typeof body.password !== "string" ||
      body.password.length < 12 ||
      body.password.length > 128
    ) {
      throw new AppError(400, "password must be between 12 and 128 characters");
    }
    if (
      !firstName ||
      firstName.length > 100 ||
      !lastName ||
      lastName.length > 100
    ) {
      throw new AppError(400, "first_name and last_name are required (maximum 100 characters)");
    }
    if (!documentType || documentType.length > 30) {
      throw new AppError(400, "document_type is required (maximum 30 characters)");
    }
    if (!documentNumber || documentNumber.length > 50) {
      throw new AppError(400, "document_number is required (maximum 50 characters)");
    }
    if (phone && phone.length > 30) {
      throw new AppError(400, "phone must not exceed 30 characters");
    }

    const passwordHash = await hashPassword(body.password);
    try {
      await sequelize.transaction(async (transaction) => {
        const role = await this.rolesRepository.findByName(
          "CLIENTE",
          transaction,
        );
        if (!role || role.status !== "active") {
          throw new AppError(503, "Client registration is not configured");
        }

        if (await this.usersRepository.findByUsername(username, transaction)) {
          throw new AppError(409, "Username is already in use");
        }
        if (await this.usersRepository.findByEmail(email, transaction)) {
          throw new AppError(409, "Email is already in use");
        }
        if (
          await this.clientsRepository.findByDocumentNumber(
            documentNumber,
            transaction,
          )
        ) {
          throw new AppError(409, "Document number is already registered");
        }

        const user = await this.usersRepository.create(
          {
            role_id: role.id,
            username,
            email,
            password: passwordHash,
            is_active: true,
          },
          transaction,
        );
        await this.clientsRepository.create(
          {
            user_id: user.id,
            document_type: documentType,
            first_name: firstName,
            last_name: lastName,
            document_number: documentNumber,
            phone,
            email,
            is_active: true,
          },
          transaction,
        );
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new AppError(
          409,
          "Username, email or document number is already registered",
        );
      }
      throw error;
    }
  }

  public async login(
    body: LoginDto,
    deviceInfo: string | null
  ): Promise<SessionTokensDto> {
    if (!body.identifier || !body.password) {
      throw new AppError(400, "identifier and password are required");
    }

    const user = await this.usersRepository.findByUsernameOrEmail(body.identifier);
    if (!user || user.status !== "active") {
      throw new AppError(401, "Invalid credentials");
    }

    const matches = await comparePassword(body.password, user.password);
    if (!matches) {
      throw new AppError(401, "Invalid credentials");
    }

    const session = await this.refreshTokensService.issue(user.id, deviceInfo);
    return this.buildTokens(user, session.rawToken, session.expiresAt);
  }

  public async refresh(
    body: RefreshSessionDto,
    deviceInfo: string | null
  ): Promise<SessionTokensDto> {
    if (!body.refresh_token) {
      throw new AppError(400, "refresh_token is required");
    }

    const outcome = await this.refreshTokensService.rotate(
      body.refresh_token,
      deviceInfo
    );
    if (outcome.kind === "invalid") {
      throw new AppError(401, "Invalid refresh token");
    }
    if (outcome.kind === "expired") {
      throw new AppError(401, "Refresh token expired");
    }
    if (outcome.kind === "reuse") {
      throw new AppError(
        401,
        "Refresh token reuse detected: session family revoked"
      );
    }

    const user = await this.usersRepository.findById(outcome.userId);
    if (!user || user.status !== "active") {
      await this.refreshTokensService.revokeAllMine(outcome.userId);
      throw new AppError(401, "User is not active");
    }

    return this.buildTokens(user, outcome.rawToken, outcome.expiresAt);
  }

  public async logout(body: LogoutSessionDto): Promise<void> {
    if (!body.refresh_token) {
      throw new AppError(400, "refresh_token is required");
    }
    await this.refreshTokensService.revokeByToken(body.refresh_token);
  }

  public async profile(userId: number): Promise<ProfileDto> {
    const user = await this.usersRepository.findById(userId);
    if (!user || user.status !== "active") {
      throw new AppError(404, "User not found");
    }
    return toProfile(user);
  }

  public async myPermissions(
    userId: number
  ): Promise<EffectivePermissionDto[]> {
    return this.resourceRolesService.findEffectiveForUser(userId);
  }

  private buildTokens(
    user: User,
    refreshToken: string,
    refreshExpiresAt: Date
  ): SessionTokensDto {
    const access = signAccessToken({ id: user.id, username: user.username });
    return {
      access_token: access.token,
      token_type: "Bearer",
      expires_in: access.expiresIn,
      refresh_token: refreshToken,
      refresh_expires_in: Math.max(
        0,
        Math.floor((refreshExpiresAt.getTime() - Date.now()) / 1000)
      ),
    };
  }
}

function toProfile(user: User): ProfileDto {
  return {
    id: user.id,
    role_id: user.role_id,
    username: user.username,
    email: user.email,
    status: user.status,
  };
}
