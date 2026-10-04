import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import { ClientsService } from "./clients.service";

/**
 * Capa Controller del feature Clients.
 * Solo HTTP: lee req, llama al service y arma res.
 */
export class ClientsController extends BaseController {
  public constructor(
    private readonly service: ClientsService = new ClientsService()
  ) {
    super();
  }

  // ================== READ ==================
  // (rellenar en ISS-03-B) getAll, getOne

  // ================== CREATE ==================
  // (rellenar en ISS-03-C) create

  // ================== UPDATE ==================
  // (rellenar en ISS-03-D) updatePut, updatePatch

  // ================== DELETE ==================
  // (rellenar en ISS-03-E) deletePhysical, deleteLogical
}
