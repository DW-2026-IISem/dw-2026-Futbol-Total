import { ClientsRoutes } from "../features/business/clients/clients.routes";
import { PedalibreRoutes } from "../features/business/pedalibre.routes";
import { UsersRoutes } from "../features/auth/users/users.routes";
import { RolesRoutes } from "../features/auth/roles/roles.routes";
import { ResourcesRoutes } from "../features/auth/resources/resources.routes";
import { ResourceRolesRoutes } from "../features/auth/resource-roles/resource-roles.routes";
import { RefreshTokensRoutes } from "../features/auth/refresh-tokens/refresh-tokens.routes";
import { SessionRoutes } from "../features/auth/session/session.routes";

export class Routes {
  public clientsRoutes: ClientsRoutes = new ClientsRoutes();
  public pedalibreRoutes: PedalibreRoutes = new PedalibreRoutes();
  public usersRoutes: UsersRoutes = new UsersRoutes();
  public rolesRoutes: RolesRoutes = new RolesRoutes();
  public resourcesRoutes: ResourcesRoutes = new ResourcesRoutes();
  public resourceRolesRoutes: ResourceRolesRoutes = new ResourceRolesRoutes();
  public refreshTokensRoutes: RefreshTokensRoutes = new RefreshTokensRoutes();
  public sessionRoutes: SessionRoutes = new SessionRoutes();
}
