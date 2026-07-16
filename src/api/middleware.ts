import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { respondWithError } from "./json.js";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "./errors.js";

export function middlewareLogResponses(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.on("finish", () => {
    const statusCode = res.statusCode;
    if (statusCode >= 300) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
    }
  });
  next();
}

export function middlewareMetricsInc(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  config.api.fileserverHits++;
  next();
}

export function errorMiddleWare(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let statusCode = 500;
  let errorMessage = "Something went wrong on our end";

  if (err instanceof BadRequestError) {
    statusCode = 400;
    errorMessage = err.message;
  } else if (err instanceof UnauthorizedError) {
    statusCode = 401;
    errorMessage = err.message;
  } else if (err instanceof ForbiddenError) {
    statusCode = 403;
    errorMessage = err.message;
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    errorMessage = err.message;
  }

  if (statusCode >= 500) {
    console.log(err.message);
  }

  respondWithError(res, statusCode, errorMessage);
}
