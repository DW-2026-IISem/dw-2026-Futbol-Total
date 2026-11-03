export interface Client {
  id: number;
  user_id: number | null;
  document_type: string;
  first_name: string;
  last_name: string;
  document_number: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientCreatePayload {
  user_id?: number | null;
  document_type?: string;
  first_name: string;
  last_name: string;
  document_number: string;
  phone?: string | null;
  email?: string | null;
  is_active?: boolean;
}

export interface ClientReplacePayload {
  user_id?: number | null;
  document_type: string;
  first_name: string;
  last_name: string;
  document_number: string;
  phone?: string | null;
  email?: string | null;
  is_active?: boolean;
}

export type ClientPatchPayload = Partial<ClientReplacePayload>;
