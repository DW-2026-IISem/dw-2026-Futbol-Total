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
    } catch (error) {
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
    } catch (error) {
      res.status(500).json({ error: "Error al obtener el cliente" });
    }
  }
}
