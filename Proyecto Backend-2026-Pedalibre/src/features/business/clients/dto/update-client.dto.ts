/**
 * Datos de entrada de `PUT /api/clientes/:id` (reemplazo completo).
 *
 * `status` no se incluye: el estado sólo cambia con el borrado lógico.
 */
export interface UpdateClientDto {
  user_id?: number | null;
  document_type: string;
  first_name: string;
  last_name: string;
  document_number: string;
  phone?: string | null;
  email?: string | null;
  is_active?: boolean;
}
