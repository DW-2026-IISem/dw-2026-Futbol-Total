import { Application } from "express";
import { authenticate, authorize } from "../../auth/access";
import { ProductTypesController } from "./product-types.controller";

export class ProductTypesRoutes {
  public productTypesController: ProductTypesController =
    new ProductTypesController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/tipos-producto")
      .get(
        authenticate,
        authorize,
        this.productTypesController.getAll.bind(this.productTypesController),
      );

    // getOne
    app
      .route("/api/tipos-producto/:id")
      .get(
        authenticate,
        authorize,
        this.productTypesController.getOne.bind(this.productTypesController),
      );

    // create
    app
      .route("/api/tipos-producto")
      .post(
        authenticate,
        authorize,
        this.productTypesController.create.bind(this.productTypesController),
      );

    // update (PUT / PATCH)
    app
      .route("/api/tipos-producto/:id")
      .put(
        authenticate,
        authorize,
        this.productTypesController.updatePut.bind(
          this.productTypesController,
        ),
      )
      .patch(
        authenticate,
        authorize,
        this.productTypesController.updatePatch.bind(
          this.productTypesController,
        ),
      );

    // delete físico
    app
      .route("/api/tipos-producto/:id")
      .delete(
        authenticate,
        authorize,
        this.productTypesController.deletePhysical.bind(
          this.productTypesController,
        ),
      );

    // delete lógico
    app
      .route("/api/tipos-producto/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.productTypesController.deleteLogical.bind(
          this.productTypesController,
        ),
      );
  }
}
