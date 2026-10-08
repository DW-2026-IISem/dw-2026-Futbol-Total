import { ClientsRoutes } from "../features/business/clients/clients.routes";
import { ProductTypesRoutes } from "../features/business/product-types/product-types.routes";
import { ProductsRoutes } from "../features/business/products/products.routes";

export class Routes {
  public clientsRoutes: ClientsRoutes = new ClientsRoutes();
  public productTypesRoutes: ProductTypesRoutes = new ProductTypesRoutes();
  public productsRoutes: ProductsRoutes = new ProductsRoutes();
}
