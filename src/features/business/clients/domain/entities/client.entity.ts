export type ClientStatus = 'active' | 'inactive';

export interface ClientProperties {
  id?: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: ClientStatus;
}

export class Client {
  readonly id?: number;
  readonly name: string;
  readonly address?: string;
  readonly phone?: string;
  readonly email?: string;
  readonly status: ClientStatus;

  constructor(properties: ClientProperties) {
    this.id = properties.id;
    this.name = properties.name;
    this.address = properties.address;
    this.phone = properties.phone;
    this.email = properties.email;
    this.status = properties.status ?? 'active';
  }
}
