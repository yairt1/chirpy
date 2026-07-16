import type { Request, Response } from "express";
import { config } from "../config.js";

export async function handlerMetrics(req: Request, res: Response) {
  res.set("Content-Type", "text/html; charset=utf-8").send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
  </body>
</html>`);
}
