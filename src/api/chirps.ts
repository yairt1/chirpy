import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";
import { createChirp } from "../db/queries/chirps.js";

export async function handlerChirps(req: Request, res: Response) {
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
