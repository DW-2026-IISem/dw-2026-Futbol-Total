import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { AppError } from "../errors/app-error";

const ALGORITHM = "HS256";

export const TOKEN_ISSUER = "app-storelab-express";
export const TOKEN_AUDIENCE = "app-storelab-api";

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  username: string;
  jti: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new AppError(
      500,
      "JWT_SECRET no configurado (mínimo 32 caracteres). Ver .env",
    );
  }
  return secret;
}

function getAccessTokenTtl(): number {
  const ttl = Number(process.env.JWT_ACCESS_TTL ?? 900);
  if (!Number.isSafeInteger(ttl) || ttl <= 0) {
    throw new AppError(500, "JWT_ACCESS_TTL debe ser un entero positivo.");
  }
  return ttl;
}

export function signAccessToken(user: {
  id: number;
  username: string;
}): { token: string; expiresIn: number } {
  if (!Number.isSafeInteger(user.id) || user.id <= 0 || !user.username) {
    throw new AppError(500, "No se puede emitir un token para un usuario inválido.");
  }

  const expiresIn = getAccessTokenTtl();
  const options: SignOptions = {
    algorithm: ALGORITHM,
    subject: String(user.id),
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
    expiresIn,
    jwtid: randomUUID(),
  };
  const token = jwt.sign({ username: user.username }, getSecret(), options);
  return { token, expiresIn };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  let payload: string | JwtPayload;
  try {
    payload = jwt.verify(token, getSecret(), {
      algorithms: [ALGORITHM],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
      clockTolerance: 5,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(401, "Invalid or expired access token");
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.sub !== "string" ||
    !/^[1-9]\d*$/.test(payload.sub) ||
    typeof payload.jti !== "string" ||
    payload.jti.length === 0 ||
    typeof payload.username !== "string" ||
    payload.username.length === 0 ||
    typeof payload.exp !== "number"
  ) {
    throw new AppError(401, "Invalid or expired access token");
  }

  return payload as AccessTokenPayload;
}

export function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const match = /^Bearer ([^\s]+)$/i.exec(header);
  return match ? match[1] : null;
}
