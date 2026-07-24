import { Request, Response } from "express";
import { updateChirpyRedById } from "../db/queries/users.js";
import { BadRequestError, NotFoundError } from "./errors.js";

export async function handlerWebhookChirpyRed(req: Request, res: Response) {
  type RequestData = {
    event: string;
    data: {
      userId: string;
    };
  };

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
