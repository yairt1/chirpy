import { Request, Response } from "express";
import { getBearerToken, hashPassword, validateJWT } from "../auth.js";
import { config } from "../config.js";
import { createUser, updateEmailAndPassword } from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import { respondWithJSON } from "./json.js";

export type UserResponse = Omit<NewUser, "hashedPassword">;

export async function handlerUsersCreate(req: Request, res: Response) {
  type RequestData = {
    email: string;
    password: string;
  };

  const params: RequestData = req.body;

  if (!params.email || !params.email.includes("@")) {
    throw new BadRequestError("Email is missing or invalid");
  } else if (!params.password) {
    throw new BadRequestError("Password is missing");
  }

  const hash = await hashPassword(params.password);

  const user = await createUser({
    email: params.email,
    hashedPassword: hash,
  } satisfies NewUser);

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } satisfies UserResponse);
}

export async function handlerUserUpdate(req: Request, res: Response) {
  type RequestData = {
    email: string;
    password: string;
  };

  const accessToken = getBearerToken(req);
  const userId = validateJWT(accessToken, config.jwt.secret);

  const params: RequestData = req.body;

  if (!params.email || !params.email.includes("@")) {
    throw new BadRequestError("Email is missing or invalid");
  } else if (!params.password) {
    throw new BadRequestError("Password is missing");
  }

  const hash = await hashPassword(params.password);

  const updatedUser = await updateEmailAndPassword(userId, params.email, hash);

  respondWithJSON(res, 200, {
    id: updatedUser.id,
    email: updatedUser.email,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  } satisfies UserResponse);
}
