import { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";

export async function handlerUsersCreate(req: Request, res: Response) {
  type RequestData = {
    email: string;
  };

  const reqEmail: RequestData = req.body;

  if (!reqEmail.email || !reqEmail.email.includes("@")) {
    throw new BadRequestError("Invalid email");
  }

  const user = await createUser({ email: reqEmail.email });

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}
