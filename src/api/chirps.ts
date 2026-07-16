import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";

export async function handlerValidation(req: Request, res: Response) {
  type requestData = {
    body: string;
  };

  const maxBodyLength = 140;
  const profaneWords = ["kerfuffle", "sharbert", "fornax"];
  const hideWords = "****";

  const parsedResponse: requestData = req.body;

  if (parsedResponse.body.length > maxBodyLength) {
    throw new BadRequestError(
      `Chirp is too long. Max length is ${maxBodyLength}`,
    );
  }

  const cleanBody = parsedResponse.body
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

  respondWithJSON(res, 200, { cleanedBody: cleanBody });
}
