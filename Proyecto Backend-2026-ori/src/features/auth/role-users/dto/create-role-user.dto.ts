/**
 * Datos para asignar un rol a un usuario.
 *
 * Si la asignación ya existe inactiva, el servicio la reactiva en vez de
 * crear una fila duplicada.
 */
export interface CreateRoleUserDto {
  user_id: number;
  role_id: number;
}
