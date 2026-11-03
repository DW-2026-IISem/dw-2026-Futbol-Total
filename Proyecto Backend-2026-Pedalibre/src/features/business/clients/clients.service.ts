import { AppError } from "../../../shared/errors/app-error";
import { Client, ClientI } from "./client.model";
import {
  ClientResponseDto,
  CreateClientDto,
  PatchClientDto,
  toClientResponse,
  UpdateClientDto,
} from "./dto";
import { ClientsRepository } from "./clients.repository";

export class ClientsService {
  public constructor(
    private readonly repository: ClientsRepository = new ClientsRepository(),
  ) {}

  public async getAll(): Promise<ClientResponseDto[]> {
    return (await this.repository.findAllActive()).map(toClientResponse);
  }

  public async getOne(id: number): Promise<ClientResponseDto> {
    return toClientResponse(await this.findOrFail(id));
  }

  public async create(body: CreateClientDto): Promise<ClientResponseDto> {
    this.validateRequired(body.first_name, "first_name");
    this.validateRequired(body.last_name, "last_name");
    this.validateRequired(body.document_number, "document_number");
    const client = await this.repository.create({
      user_id: body.user_id ?? null,
      document_type: body.document_type?.trim() ?? "",
      first_name: body.first_name.trim(),
      last_name: body.last_name.trim(),
      document_number: body.document_number.trim(),
      phone: body.phone ?? null,
      email: body.email ?? null,
      is_active: body.is_active ?? true,
    });
    return toClientResponse(client);
  }

  public async updatePut(
    id: number,
    body: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    const client = await this.findOrFail(id);
    this.validateRequired(body.first_name, "first_name");
    this.validateRequired(body.last_name, "last_name");
    this.validateRequired(body.document_number, "document_number");
    return toClientResponse(
      await this.repository.update(client, {
        user_id: body.user_id,
        document_type: body.document_type.trim(),
        first_name: body.first_name.trim(),
        last_name: body.last_name.trim(),
        document_number: body.document_number.trim(),
        phone: body.phone,
        email: body.email,
        is_active: body.is_active,
      }),
    );
  }

  public async updatePatch(
    id: number,
    body: PatchClientDto,
  ): Promise<ClientResponseDto> {
    const client = await this.findOrFail(id);
    const data: Partial<ClientI> = {};
    if (body.user_id !== undefined) data.user_id = body.user_id;
    if (body.document_type !== undefined) data.document_type = body.document_type.trim();
    if (body.first_name !== undefined) {
      this.validateRequired(body.first_name, "first_name");
      data.first_name = body.first_name.trim();
    }
    if (body.last_name !== undefined) {
      this.validateRequired(body.last_name, "last_name");
      data.last_name = body.last_name.trim();
    }
    if (body.document_number !== undefined) {
      this.validateRequired(body.document_number, "document_number");
      data.document_number = body.document_number.trim();
    }
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.email !== undefined) data.email = body.email;
    if (body.is_active !== undefined) data.is_active = body.is_active;
    if (Object.keys(data).length === 0) {
      throw new AppError(400, "At least one editable field is required");
    }
    return toClientResponse(await this.repository.update(client, data));
  }

  public async deletePhysical(id: number): Promise<void> {
    await this.repository.delete(await this.findOrFail(id, false));
  }

  public async deleteLogical(id: number): Promise<ClientResponseDto> {
    const client = await this.findOrFail(id);
    await this.repository.update(client, { is_active: false });
    return toClientResponse(client);
  }

  private async findOrFail(id: number, onlyActive = true): Promise<Client> {
    const client = await this.repository.findById(id);
    if (!client || (onlyActive && !client.is_active)) {
      throw new AppError(404, "Client not found");
    }
    return client;
  }

  private validateRequired(value: string, field: string): void {
    if (!value?.trim()) throw new AppError(400, `${field} is required`);
  }
}
