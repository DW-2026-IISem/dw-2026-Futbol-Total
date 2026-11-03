import { Client, ClientI } from "../client.model";

/**
 * Respuesta HTTP de un cliente. Lo usan GET de clientes y las respuestas de
 * creación, actualización y borrado lógico.
 * La contraseña nunca se expone.
 */
export type ClientResponseDto = Omit<ClientI, "password">;

/** Convierte el modelo en un objeto plano sin la contraseña. */
export function toClientResponse(client: Client): ClientResponseDto {
  const { password, ...safe } = client.toJSON() as ClientI & { password?: string };
  return safe;
}
