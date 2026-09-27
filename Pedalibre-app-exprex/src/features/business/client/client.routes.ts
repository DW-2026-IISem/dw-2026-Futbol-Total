import { Application } from "express";
import { ClientController } from "./client.controller";

export class ClientRoutes {
  public clientController: ClientController = new ClientController();

  public routes(app: Application): void {
    app.route("/api/clientes")
      .get((req, res) => this.clientController.getAllClients(req, res))
      .post((req, res) => this.clientController.createClient(req, res));

    app.route("/api/clientes/:id")
      .get((req, res) => this.clientController.getOneClient(req, res))
      .put((req, res) => this.clientController.updateClientPut(req, res))
      .patch((req, res) => this.clientController.updateClientPatch(req, res));
  }
}
