import { Application } from "express";
import { ClientController } from "./client.controller";

export class ClientRoutes {
  public clientController: ClientController = new ClientController();

  public routes(app: Application): void {
    // RUTAS SIN AUTENTICACION / SIN MIDDLEWARE JWT.
    // Se completa en ISS-03-B a ISS-03-E.
  }
}
