export interface SessionTokens {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
}

export interface ClientRegistrationPayload {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  phone: string | null;
}

export interface SessionUser {
  id: number;
  role_id: number;
  username: string;
  email: string | null;
  status: string;
}

export interface EffectivePermission {
  resource_id: number;
  method: string;
  path: string;
  description: string | null;
  role_id: number;
  role_name: string;
}
