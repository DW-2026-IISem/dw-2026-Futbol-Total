import { Client, ClientI } from "../client.model";

export type ClientResponseDto = ClientI;

/** Convierte el modelo en un objeto plano para la respuesta HTTP. */
export function toClientResponse(client: Client): ClientResponseDto {
  return client.toJSON() as ClientI;
}
