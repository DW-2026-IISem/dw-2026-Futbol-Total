export const PASSWORD_HASHER = 'PASSWORD_HASHER';

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
}