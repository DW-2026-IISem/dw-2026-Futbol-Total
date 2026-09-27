import { Request, Response } from "express";
import { Client, ClientI } from "./client.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class ClientController {
  // ================== READ ==================
  // Se completa en ISS-03-B.

  // ================== CREATE ==================
  // Se completa en ISS-03-C.

  // ================== UPDATE ==================
  // Se completa en ISS-03-D.

  // ================== DELETE ==================
  // Se completa en ISS-03-E.
}
