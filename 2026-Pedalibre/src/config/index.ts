import dotenv from "dotenv";
import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import { sequelize, getDatabaseInfo, testConnection } from "../database/db";
import "../features/business/clients/client.model";
import "../features/business/pedalibre.models";
import "../features/business/pedalibre.associations";
import "../features/auth/users/user.model";
import "../features/auth/roles/role.model";
import "../features/auth/resources/resource.model";
import "../features/auth/resource-roles/resource-role.model";
import "../features/auth/refresh-tokens/refresh-token.model";
import "../features/auth/rbac.associations";
import { Routes } from "../routes/index";
import { setupSwagger } from "../swagger/index";

dotenv.config();

export class App {
  public app: Application;
  public routePrv: Routes = new Routes();

  constructor(private port?: number | string) {
    this.app = express();
    this.settings();
    this.middlewares();
    this.routes();
    this.docs();
  }

  private settings(): void {
    this.app.set("port", this.port || process.env.PORT || 1704);
  }

  private middlewares(): void {
    this.app.use(morgan("dev"));
    this.app.use(
      cors({
        origin: ["http://localhost:2704", "http://127.0.0.1:2704"],
      }),
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  private routes(): void {
    this.routePrv.clientsRoutes.routes(this.app);
    this.routePrv.pedalibreRoutes.routes(this.app);
    this.routePrv.usersRoutes.routes(this.app);
    this.routePrv.rolesRoutes.routes(this.app);
    this.routePrv.resourcesRoutes.routes(this.app);
    this.routePrv.resourceRolesRoutes.routes(this.app);
    this.routePrv.refreshTokensRoutes.routes(this.app);
    this.routePrv.sessionRoutes.routes(this.app);
  }

  private docs(): void {
    setupSwagger(this.app);
  }

  private async dbConnection(): Promise<void> {
    try {
      const dbInfo = getDatabaseInfo();
      console.log(`Intentando conectar a: ${dbInfo.engine.toUpperCase()}`);

      const isConnected = await testConnection();

      if (!isConnected) {
        throw new Error(
          `No se pudo conectar a la base de datos ${dbInfo.engine.toUpperCase()}`,
        );
      }

      console.log("Conexión a MySQL establecida; el esquema se gestiona mediante el script SQL");
    } catch (error) {
      console.error("Error al conectar con la base de datos:", error);
      process.exit(1);
    }
  }

  async listen(): Promise<void> {
    await this.dbConnection();
    await this.app.listen(this.app.get("port"));
    console.log(`Servidor ejecutándose en puerto ${this.app.get("port")}`);
  }
}
