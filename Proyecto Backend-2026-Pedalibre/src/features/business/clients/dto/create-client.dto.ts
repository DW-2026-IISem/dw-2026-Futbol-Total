/** Datos de entrada de `POST /api/clientes`. */
export interface CreateClientDto {
  user_id?: number | null;
  document_type?: string;
  first_name: string;
  last_name: string;
  document_number: string;
  phone?: string | null;
  email?: string | null;
  is_active?: boolean;
}
