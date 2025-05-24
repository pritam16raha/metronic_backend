import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { verify, type JwtPayload } from "jsonwebtoken";
import { config } from "../config/config";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(
      createHttpError.Unauthorized("Missing or malformed Authorization header")
    );
  }

  const token = authHeader.slice(7);
  let payload: JwtPayload;
  try {
    payload = verify(token, config.jwtSecret as string) as JwtPayload;
  } catch {
    return next(createHttpError.Unauthorized("Invalid or expired token"));
  }

  if (!payload.sub || typeof payload.sub !== "string") {
    return next(createHttpError.Unauthorized("Invalid token payload"));
  }

  // Attach the user ID to req for downstream handlers
  req.userId = payload.sub;
  next();
}
