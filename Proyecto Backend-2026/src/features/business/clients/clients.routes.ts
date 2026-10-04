import { Application } from "express";
import { ClientsController } from "./clients.controller";

export class ClientsRoutes {
  public clientsController: ClientsController = new ClientsController();

  public routes(app: Application): void {
    app
      .route("/api/clientes")
      .get(this.clientsController.getAll.bind(this.clientsController))
      .post(this.clientsController.create.bind(this.clientsController));

    app
      .route("/api/clientes/:id")
      .get(this.clientsController.getOne.bind(this.clientsController))
      .put(this.clientsController.updatePut.bind(this.clientsController))
      .patch(this.clientsController.updatePatch.bind(this.clientsController));
  }
}
