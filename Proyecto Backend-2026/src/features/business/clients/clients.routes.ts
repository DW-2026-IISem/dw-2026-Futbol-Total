import { Application } from "express";
import { ClientsController } from "./clients.controller";

export class ClientsRoutes {
  public clientsController: ClientsController = new ClientsController();

  public routes(app: Application): void {
    // Rutas del feature, sin autenticación ni middleware JWT en esta fase.
    // Se completarán en ISS-03-B a ISS-03-E.
  }
}
