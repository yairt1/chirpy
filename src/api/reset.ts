import type { Request, Response } from "express";
import { config } from "../config.js";
import { deleteAllUsers } from "../db/queries/users.js";
import { ForbiddenError } from "./errors.js";

export async function handlerReset(req: Request, res: Response) {
  config.api.fileserverHits = 0;

  if (config.api.platform !== "dev") {
    console.log(config.api.platform);
    throw new ForbiddenError("Can only delete all users in local dev");
  }

  await deleteAllUsers();

  res.write("All users were deleted");
  res.end();
}
