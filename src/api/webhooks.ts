import { Request, Response } from "express";
import { getAPIKey } from "../auth.js";
import { config } from "../config.js";
import { updateChirpyRedById } from "../db/queries/users.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "./errors.js";

export async function handlerWebhookChirpyRed(req: Request, res: Response) {
  type RequestData = {
    event: string;
    data: {
      userId: string;
    };
  };

  const apiKey = getAPIKey(req);

  if (apiKey !== config.api.polkaKey) {
    throw new UnauthorizedError("Invalid api key");
  }

  const EVENT = "user.upgraded";

  const params: RequestData = req.body;

  if (!params.data.userId || !params.event) {
    throw new BadRequestError("User id or event is missing");
  }

  if (params.event !== EVENT) {
    res.status(204).send();
    return;
  }

  const upgradedUser = await updateChirpyRedById(params.data.userId);

  if (!upgradedUser) {
    throw new NotFoundError(
      `User with the id ${params.data.userId} does not exist`,
    );
  }

  res.status(204).send();
}
