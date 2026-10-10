import { Application } from "express";
import { authenticate, authorize } from "../../auth/access";
import { ClientsController } from "./clients.controller";

export class ClientsRoutes {
  public clientsController: ClientsController = new ClientsController();

  public routes(app: Application): void {
    app
      .route("/api/clientes")
      .get(
        authenticate,
        authorize,
        this.clientsController.getAll.bind(this.clientsController),
      )
      .post(
        authenticate,
        authorize,
        this.clientsController.create.bind(this.clientsController),
      );

    app
      .route("/api/clientes/:id")
      .get(
        authenticate,
        authorize,
        this.clientsController.getOne.bind(this.clientsController),
      )
      .put(
        authenticate,
        authorize,
        this.clientsController.updatePut.bind(this.clientsController),
      )
      .patch(
        authenticate,
        authorize,
        this.clientsController.updatePatch.bind(this.clientsController),
      )
      .delete(
        authenticate,
        authorize,
        this.clientsController.deletePhysical.bind(this.clientsController),
      );

    app
      .route("/api/clientes/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.clientsController.deleteLogical.bind(this.clientsController),
      );
  }
}
