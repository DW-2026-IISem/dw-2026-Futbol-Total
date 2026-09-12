import { Status } from '../../../../../../common/enums/status.enum.js';
import { ScryptPasswordHasherService } from '../../../../../../infrastructure/security/hashing/scrypt-password-hasher.service.js';
import { ClientModel } from '../models/client.model.js';

export async function seedClients(): Promise<void> {
  if ((await ClientModel.count()) > 0) {
    return;
  }

  const hasher = new ScryptPasswordHasherService();
  await ClientModel.bulkCreate([
    {
      name: 'Juan Pérez',
      address: 'Calle Principal 123',
      phone: '+57 300 1234567',
      email: 'juan.perez@example.com',
      password: await hasher.hash('password123'),
      status: Status.ACTIVE,
    },
    {
      name: 'María García',
      address: 'Av. Central 456',
      phone: '+57 310 9876543',
      email: 'maria.garcia@example.com',
      password: await hasher.hash('password123'),
      status: Status.ACTIVE,
    },
  ]);
}