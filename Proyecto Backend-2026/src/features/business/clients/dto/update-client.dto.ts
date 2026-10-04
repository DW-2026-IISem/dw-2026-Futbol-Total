/**
 * Datos de entrada de `PUT /api/clientes/:id` (reemplazo completo).
 *
 * `status` no se incluye: el estado sólo cambia con el borrado lógico.
 */
export interface UpdateClientDto {
  name: string;
  address: string;
  phone: string;
  email: string;
  /** Si no se envía, el service conserva el hash actual. */
  password?: string;
}
