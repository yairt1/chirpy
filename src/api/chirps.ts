import { Request, Response } from "express";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";
import {
  createChirp,
  deleteChirpById,
  getChirpById,
  getChirps,
} from "../db/queries/chirps.js";
import { BadRequestError, ForbiddenError } from "./errors.js";
import { respondWithJSON } from "./json.js";

export async function handlerCreateChirp(req: Request, res: Response) {
  type RequestData = {
    body: string;
  };

  const maxBodyLength = 140;
  const profaneWords = ["kerfuffle", "sharbert", "fornax"];
  const hideWords = "****";

  const params: RequestData = req.body;

  const reqAuthToken = getBearerToken(req);
  const authorizedUserId = validateJWT(reqAuthToken, config.jwt.secret);

  if (params.body.length > maxBodyLength) {
    throw new BadRequestError(
      `Chirp is too long. Max length is ${maxBodyLength}`,
    );
  }

  const cleanBody = params.body
    .split(" ")
    .map((value) => {
      if (
        profaneWords.some((profane) => value.toLowerCase().includes(profane))
      ) {
        return hideWords;
      }
      return value;
    })
    .join(" ");

  const chirp = await createChirp({
    body: cleanBody,
    userId: authorizedUserId,
  });

  respondWithJSON(res, 201, {
    id: chirp.id,
    createdAt: chirp.createdAt,
    updatedAt: chirp.updatedAt,
    body: chirp.body,
    userId: chirp.userId,
  });
}

export async function handlerGetChirps(req: Request, res: Response) {
  const authorId = req.query.authorId;

  if (typeof authorId !== "string") {
    throw new BadRequestError("Invalid author id");
  }

  const chirps = await getChirps(authorId);

  respondWithJSON(res, 200, chirps);
}

export async function handlerGetChirpById(req: Request, res: Response) {
  const { chirpId } = req.params;

  if (typeof chirpId !== "string") {
    throw new BadRequestError("Invalid chirp id");
  }

  const chirp = await getChirpById(chirpId);

  respondWithJSON(res, 200, chirp);
}

export async function handlerDeleteChirpById(req: Request, res: Response) {
  const { chirpId } = req.params;

  if (typeof chirpId !== "string") {
    throw new BadRequestError("Invalid chirp id");
  }

  const accessToken = getBearerToken(req);
  const userId = validateJWT(accessToken, config.jwt.secret);

  const chirp = await getChirpById(chirpId);

  if (chirp.userId !== userId) {
    throw new ForbiddenError("You can't delete this chirp");
  }

  await deleteChirpById(chirpId);

  res.status(204).send();
}
