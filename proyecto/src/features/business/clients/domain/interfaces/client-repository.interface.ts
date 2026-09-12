import type { Client } from '../entities/client.entity.js';

export const CLIENT_REPOSITORY = 'CLIENT_REPOSITORY';

export interface IClientRepository {
  create(client: Client): Promise<Client>;
  findByEmail(email: string): Promise<Client | null>;
}