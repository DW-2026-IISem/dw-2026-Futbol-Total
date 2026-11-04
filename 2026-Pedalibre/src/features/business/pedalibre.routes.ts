import { Application } from "express";
import { authenticate, authorize } from "../auth/access";
import { PedalibreController } from "./pedalibre.controller";
import { PedalibreEntity } from "./pedalibre.service";

const crudRoutes: ReadonlyArray<{
  entity: PedalibreEntity;
  path: string;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}> = [
  { entity: "stations", path: "/api/stations", canCreate: true, canUpdate: true, canDelete: true },
  { entity: "bicycles", path: "/api/bicycles", canCreate: true, canUpdate: true, canDelete: true },
  { entity: "docking_points", path: "/api/docking-points", canCreate: true, canUpdate: true, canDelete: true },
  { entity: "rates", path: "/api/rates", canCreate: true, canUpdate: true, canDelete: true },
  { entity: "reservations", path: "/api/reservations", canCreate: true, canUpdate: true, canDelete: false },
  { entity: "rentals", path: "/api/rentals", canCreate: false, canUpdate: false, canDelete: false },
  { entity: "rental_events", path: "/api/rental-events", canCreate: false, canUpdate: false, canDelete: false },
  { entity: "bicycle_dockings", path: "/api/bicycle-dockings", canCreate: false, canUpdate: false, canDelete: false },
  { entity: "penalties", path: "/api/penalties", canCreate: true, canUpdate: true, canDelete: true },
  { entity: "maintenances", path: "/api/maintenances", canCreate: true, canUpdate: true, canDelete: false },
  { entity: "payments", path: "/api/payments", canCreate: true, canUpdate: true, canDelete: true },
];

export class PedalibreRoutes {
  public constructor(
    private readonly controller: PedalibreController = new PedalibreController(),
  ) {}

  public routes(app: Application): void {
    app
      .route("/api/bicycles/available/")
      .get(authenticate, authorize, this.controller.availableBicycles.bind(this.controller));

    app
      .route("/api/rentals/start/")
      .post(authenticate, authorize, this.controller.startRental.bind(this.controller));
    app
      .route("/api/rentals/finish/")
      .post(authenticate, authorize, this.controller.finishRental.bind(this.controller));

    app
      .route("/api/bicycle-dockings/dock")
      .post(authenticate, authorize, this.controller.dockBicycle.bind(this.controller));
    app
      .route("/api/bicycle-dockings/:id/undock")
      .patch(authenticate, authorize, this.controller.undockBicycle.bind(this.controller));

    for (const route of crudRoutes) {
      const collection = app.route(route.path);
      collection.get(authenticate, authorize, this.controller.list(route.entity));
      if (route.canCreate) {
        collection.post(authenticate, authorize, this.controller.create(route.entity));
      }

      const item = app.route(`${route.path}/:id`);
      item.get(authenticate, authorize, this.controller.getOne(route.entity));
      if (route.canUpdate) {
        item.patch(authenticate, authorize, this.controller.update(route.entity));
      }
      if (route.canDelete) {
        item.delete(authenticate, authorize, this.controller.delete(route.entity));
      }
    }
  }
}
