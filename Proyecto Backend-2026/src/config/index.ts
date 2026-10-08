import dotenv from "dotenv";
import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import { sequelize, getDatabaseInfo, testConnection } from "../database/db";
import "../features/business/clients/client.model";
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
    this.app.set("port", this.port || process.env.PORT || 4000);
  }

  private middlewares(): void {
    this.app.use(morgan("dev"));
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  private routes(): void {
    this.routePrv.clientsRoutes.routes(this.app);
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

      await sequelize.sync({ force: false, alter: true });
      console.log("Base de datos sincronizada exitosamente");
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
