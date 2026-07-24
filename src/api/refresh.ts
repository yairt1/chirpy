import { Request, Response } from "express";
import { getBearerToken, makeJWT } from "../auth.js";
import { config } from "../config.js";
import { getUserFromRefreshToken } from "../db/queries/users.js";
import { UnauthorizedError } from "./errors.js";
import { respondWithJSON } from "./json.js";

export async function handlerRefresh(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);
  const result = await getUserFromRefreshToken(refreshToken);

  if (!result) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const user = result.user;
  const accessToken = makeJWT(
    user.id,
    config.jwt.defaultDuration,
    config.jwt.secret,
  );

  type ResponseBody = { token: string };

  respondWithJSON(res, 200, {
    token: accessToken,
  } satisfies ResponseBody);
}
