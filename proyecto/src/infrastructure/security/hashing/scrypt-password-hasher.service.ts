import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { Injectable } from '@nestjs/common';
import type { PasswordHasher } from './password-hasher.interface.js';

const scryptAsync = promisify(scrypt);

@Injectable()
export class ScryptPasswordHasherService implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derived = (await scryptAsync(plain, salt, 32)) as Buffer;
    return `${salt}:${derived.toString('hex')}`;
  }
}