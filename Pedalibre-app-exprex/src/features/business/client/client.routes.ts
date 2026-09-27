import { Application } from "express";
import { ClientController } from "./client.controller";

export class ClientRoutes {
  public clientController: ClientController = new ClientController();

  public routes(app: Application): void {
    app.route("/api/clientes")
      .get(this.clientController.getAllClients)
      .post(this.clientController.createClient);

    app.route("/api/clientes/:id")
      .get(this.clientController.getOneClient);
  }
}
