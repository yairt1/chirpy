import { Request, Response } from "express";
import { checkPasswordHash } from "../auth.js";
import { getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { UserResponse } from "./users.js";

export async function handlerLoginUser(req: Request, res: Response) {
  type RequestData = {
    password: string;
    email: string;
  };

  const params: RequestData = req.body;

  if (!params.email || !params.email.includes("@")) {
    throw new BadRequestError("Email is missing or invalid");
  } else if (!params.password) {
    throw new BadRequestError("Password is missing");
  }

  const user = await getUserByEmail(params.email);

  if (!user) {
    throw new UnauthorizedError("incorrect email or password");
  }

  const checkPassword = await checkPasswordHash(
    params.password,
    user.hashedPassword,
  );

  if (!checkPassword) {
    throw new UnauthorizedError("incorrect email or password");
  }

  respondWithJSON(res, 200, {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
  } satisfies UserResponse);
}
