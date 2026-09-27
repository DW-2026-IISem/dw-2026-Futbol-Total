import { Request, Response } from "express";
import { Client, ClientI } from "./client.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

const clientPublicAttributes = {
  exclude: ["password"],
};

export class ClientController {
  public async getAllClients(_req: Request, res: Response): Promise<void> {
    try {
      const clients: ClientI[] = await Client.findAll({
        attributes: clientPublicAttributes,
      });
      res.status(200).json({ clients });
    } catch {
      res.status(500).json({ error: "Error al obtener clientes" });
    }
  }

  public async getOneClient(req: Request, res: Response): Promise<void> {
    try {
      const client = await Client.findByPk(paramId(req), {
        attributes: clientPublicAttributes,
      });

      if (!client) {
        res.status(404).json({ error: "Cliente no encontrado" });
        return;
      }

      res.status(200).json({ client });
    } catch {
      res.status(500).json({ error: "Error al obtener el cliente" });
    }
  }

  public async createClient(req: Request, res: Response): Promise<void> {
    try {
      const { name, address, phone, email, password, status } = req.body;

      const client = await Client.create({
        name,
        address,
        phone,
        email,
        password,
        status,
      });

      const publicClient = client.get({ plain: true });
      delete publicClient.password;

      res.status(201).json({ client: publicClient });
    } catch (error: any) {
      if (error?.name === "SequelizeUniqueConstraintError") {
        res.status(409).json({ error: "El correo ya esta registrado" });
        return;
      }

      res.status(400).json({ error: "No fue posible crear el cliente" });
    }
  }
}
