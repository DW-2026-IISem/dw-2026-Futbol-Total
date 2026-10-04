import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import {
  CreateClientDto,
  PatchClientDto,
  UpdateClientDto,
} from "./dto";
import { ClientsService } from "./clients.service";

export class ClientsController extends BaseController {
  public constructor(
    private readonly service: ClientsService = new ClientsService()
  ) {
    super();
  }

  // ================== READ ==================
  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const clients = await this.service.getAll();
      res.status(200).json({ clients });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const client = await this.service.getOne(this.paramId(req));
      res.status(200).json({ client });
    });
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const client = await this.service.create(req.body as CreateClientDto);
      res.status(201).json({ client });
    });
  }

  // ================== UPDATE ==================
  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const client = await this.service.updatePut(
        this.paramId(req),
        req.body as UpdateClientDto
      );
      res.status(200).json({ client });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const client = await this.service.updatePatch(
        this.paramId(req),
        req.body as PatchClientDto
      );
      res.status(200).json({ client });
    });
  }

  // ================== DELETE ==================
  // (rellenar en ISS-03-E) deletePhysical, deleteLogical
}
