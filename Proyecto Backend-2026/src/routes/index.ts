import { ClientsRoutes } from "../features/business/clients/clients.routes";
import { ProductTypesRoutes } from "../features/business/product-types/product-types.routes";
import { ProductsRoutes } from "../features/business/products/products.routes";
import { SalesRoutes } from "../features/business/sales/sales.routes";

export class Routes {
  public clientsRoutes: ClientsRoutes = new ClientsRoutes();
  public productTypesRoutes: ProductTypesRoutes = new ProductTypesRoutes();
  public productsRoutes: ProductsRoutes = new ProductsRoutes();
  public salesRoutes: SalesRoutes = new SalesRoutes();
}
