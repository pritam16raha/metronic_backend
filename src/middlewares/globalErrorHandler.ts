import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { HttpError } from "http-errors";
import { config } from "../config/config";

/**
 * 404 catcher: any route that falls through ends up here
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(404).json({ message: "Route not found" });
}

/**
 * Global error handler
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // err is any, so cast to HttpError if you want statusCode
  const httpErr = err as HttpError;
  const statusCode = httpErr.statusCode ?? 500;

  res.status(statusCode).json({
    message: httpErr.message,
    // only expose stack in development
    errorStack: config.env === "development" ? err.stack : undefined,
  });
};
