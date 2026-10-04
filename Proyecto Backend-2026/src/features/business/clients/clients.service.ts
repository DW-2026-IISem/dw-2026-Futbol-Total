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
    private readonly repository: ClientsRepository = new ClientsRepository()
  ) {}

  // ================== READ ==================
  public async getAll(): Promise<ClientResponseDto[]> {
    const clients = await this.repository.findAllActive();
    return clients.map((client) => toClientResponse(client));
  }

  public async getOne(id: number): Promise<ClientResponseDto> {
    return toClientResponse(await this.findOrFail(id));
  }

  // ================== CREATE ==================
  public async create(body: CreateClientDto): Promise<ClientResponseDto> {
    const client = await this.repository.create({
      name: body.name,
      address: body.address,
      phone: body.phone,
      email: body.email,
      password: body.password,
      status: body.status ?? "active",
    });
    return toClientResponse(client);
  }

  // ================== UPDATE ==================
  public async updatePut(
    id: number,
    body: UpdateClientDto
  ): Promise<ClientResponseDto> {
    const client = await this.findOrFail(id);
    const data: Partial<ClientI> = {
      name: body.name,
      address: body.address,
      phone: body.phone,
      email: body.email,
    };

    if (body.password !== undefined) {
      data.password = body.password;
    }

    return toClientResponse(await this.repository.update(client, data));
  }

  public async updatePatch(
    id: number,
    body: PatchClientDto
  ): Promise<ClientResponseDto> {
    const client = await this.findOrFail(id);
    const data: Partial<ClientI> = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.address !== undefined) data.address = body.address;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.email !== undefined) data.email = body.email;
    if (body.password !== undefined) data.password = body.password;

    return toClientResponse(await this.repository.update(client, data));
  }

  // ================== DELETE ==================
  // (rellenar en ISS-03-E) deletePhysical, deleteLogical

  // ================== HELPERS ==================
  private async findOrFail(id: number, onlyActive = true): Promise<Client> {
    const client = await this.repository.findById(id);
    if (!client || (onlyActive && client.status !== "active")) {
      throw new AppError(404, "Client not found");
    }
    return client;
  }
}
