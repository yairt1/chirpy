import { Request, Response } from "express";
import { checkPasswordHash, makeJWT } from "../auth.js";
import { config } from "../config.js";
import { getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { UserResponse } from "./users.js";

type LoginResponse = UserResponse & {
  token: string;
};

export async function handlerLoginUser(req: Request, res: Response) {
  type RequestData = {
    password: string;
    email: string;
    expiresIn?: number;
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

  let duration = config.jwt.defaultDuration;
  if (params.expiresIn && params.expiresIn < config.jwt.defaultDuration) {
    duration = params.expiresIn;
  }

  const accessToken = makeJWT(user.id, duration, config.jwt.secret);

  respondWithJSON(res, 200, {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    token: accessToken,
  } satisfies LoginResponse);
}
