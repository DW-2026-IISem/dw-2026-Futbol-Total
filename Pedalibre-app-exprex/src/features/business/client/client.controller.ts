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

type EditableClientField =
  | "name"
  | "address"
  | "phone"
  | "email"
  | "password"
  | "status";

const editableFields: EditableClientField[] = [
  "name",
  "address",
  "phone",
  "email",
  "password",
  "status",
];

function clientUpdates(body: Partial<ClientI>): Partial<ClientI> {
  const updates: Partial<ClientI> = {};

  for (const field of editableFields) {
    if (body[field] !== undefined) {
      if (field === "status") {
        updates.status = body.status;
      } else {
        updates[field] = body[field];
      }
    }
  }

  return updates;
}

export class ClientController {
  public async getAllClients(_req: Request, res: Response): Promise<void> {
    try {
      const clients: ClientI[] = await Client.findAll({
        where: { status: "active" },
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

  private async updateClient(
    req: Request,
    res: Response,
    method: "PUT" | "PATCH"
  ): Promise<void> {
    try {
      const updates = clientUpdates(req.body);

      if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: `No hay campos para actualizar con ${method}` });
        return;
      }

      const [affectedRows] = await Client.update(updates, {
        where: { id: paramId(req) },
        individualHooks: true,
      });

      if (affectedRows === 0) {
        res.status(404).json({ error: "Cliente no encontrado" });
        return;
      }

      const client = await Client.findByPk(paramId(req), {
        attributes: clientPublicAttributes,
      });

      res.status(200).json({ client });
    } catch (error: any) {
      if (error?.name === "SequelizeUniqueConstraintError") {
        res.status(409).json({ error: "El correo ya esta registrado" });
        return;
      }

      res.status(400).json({ error: "No fue posible actualizar el cliente" });
    }
  }

  public async updateClientPut(req: Request, res: Response): Promise<void> {
    await this.updateClient(req, res, "PUT");
  }

  public async updateClientPatch(req: Request, res: Response): Promise<void> {
    await this.updateClient(req, res, "PATCH");
  }

  public async deletePhysical(req: Request, res: Response): Promise<void> {
    try {
      const id = paramId(req);
      const client = await Client.findByPk(id);

      if (!client) {
        res.status(404).json({ error: "Cliente no encontrado" });
        return;
      }

      await client.destroy();
      res.status(200).json({ message: "Cliente eliminado permanentemente", id });
    } catch {
      res.status(500).json({ error: "Error al eliminar el cliente" });
    }
  }

  public async deleteLogical(req: Request, res: Response): Promise<void> {
    try {
      const id = paramId(req);
      const client = await Client.findByPk(id);

      if (!client) {
        res.status(404).json({ error: "Cliente no encontrado" });
        return;
      }

      await client.update({ status: "inactive" });

      const publicClient = client.get({ plain: true });
      delete publicClient.password;

      res.status(200).json({
        message: "Cliente desactivado",
        client: publicClient,
      });
    } catch {
      res.status(500).json({ error: "Error al desactivar el cliente" });
    }
  }
}
