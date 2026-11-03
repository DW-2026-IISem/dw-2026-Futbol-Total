import { Request, Response } from "express";
import { requireAuthUser } from "../../shared/auth/auth-user";
import { BaseController } from "../../shared/http/base-controller";
import { PedalibreEntity, PedalibreService } from "./pedalibre.service";

export class PedalibreController extends BaseController {
  public constructor(
    private readonly service: PedalibreService = new PedalibreService(),
  ) {
    super();
  }

  public list(entity: PedalibreEntity) {
    return async (req: Request, res: Response): Promise<void> => {
      await this.run(res, async () => {
        const items = await this.service.list(entity, requireAuthUser(req).id);
        res.status(200).json({ items });
      });
    };
  }

  public getOne(entity: PedalibreEntity) {
    return async (req: Request, res: Response): Promise<void> => {
      await this.run(res, async () => {
        const item = await this.service.getOne(entity, this.paramId(req), requireAuthUser(req).id);
        res.status(200).json({ item });
      });
    };
  }

  public create(entity: PedalibreEntity) {
    return async (req: Request, res: Response): Promise<void> => {
      await this.run(res, async () => {
        const item = await this.service.create(entity, req.body, requireAuthUser(req).id);
        res.status(201).json({ item });
      });
    };
  }

  public update(entity: PedalibreEntity) {
    return async (req: Request, res: Response): Promise<void> => {
      await this.run(res, async () => {
        const item = await this.service.update(entity, this.paramId(req), req.body);
        res.status(200).json({ item });
      });
    };
  }

  public delete(entity: PedalibreEntity) {
    return async (req: Request, res: Response): Promise<void> => {
      await this.run(res, async () => {
        await this.service.delete(entity, this.paramId(req));
        res.status(204).send();
      });
    };
  }

  public availableBicycles(_req: Request, res: Response): Promise<void> {
    return this.run(res, async () => {
      const bicycles = await this.service.availableBicycles();
      res.status(200).json({ bicycles });
    });
  }

  public startRental(req: Request, res: Response): Promise<void> {
    return this.run(res, async () => {
      const rental = await this.service.startRental(req.body);
      res.status(201).json({ rental });
    });
  }

  public finishRental(req: Request, res: Response): Promise<void> {
    return this.run(res, async () => {
      const rental = await this.service.finishRental(req.body);
      res.status(200).json({ rental });
    });
  }

  public dockBicycle(req: Request, res: Response): Promise<void> {
    return this.run(res, async () => {
      const docking = await this.service.dockBicycle(req.body);
      res.status(201).json({ docking });
    });
  }

  public undockBicycle(req: Request, res: Response): Promise<void> {
    return this.run(res, async () => {
      const docking = await this.service.undockBicycle(this.paramId(req));
      res.status(200).json({ docking });
    });
  }
}
