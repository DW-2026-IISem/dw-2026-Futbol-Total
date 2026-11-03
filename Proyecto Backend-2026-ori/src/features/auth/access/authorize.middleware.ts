import { NextFunction, Request, Response } from "express";
import { requireAuthUser } from "../../../shared/auth/auth-user";
import { isOperationGranted, normalizePath } from "../../../shared/auth/resource-match";
import { AppError } from "../../../shared/errors/app-error";
import { sendError } from "../../../shared/http/error-response";
import { UsersRepository } from "../users/users.repository";

const usersRepository = new UsersRepository();

export async function authorize(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authUser = requireAuthUser(req);
    const permissions = await usersRepository.getEffectivePermissions(authUser.id);
    const path = normalizePath(req.originalUrl);
    if (!isOperationGranted(permissions, req.method, path)) {
      throw new AppError(403, "Forbidden: no active grant for this operation");
    }

    next();
  } catch (error) {
    sendError(res, error);
  }
}
