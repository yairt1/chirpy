import { Request, Response } from "express";
import { createChirp, getChirps } from "../db/queries/chirps.js";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";

export async function handlerCreateChirp(req: Request, res: Response) {
  type RequestData = {
    body: string;
    userId: string;
  };

  const maxBodyLength = 140;
  const profaneWords = ["kerfuffle", "sharbert", "fornax"];
  const hideWords = "****";

  const params: RequestData = req.body;

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
    userId: params.userId,
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
  const chirps = await getChirps();

  respondWithJSON(res, 200, chirps);
}
