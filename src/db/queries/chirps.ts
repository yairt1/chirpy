import { asc, eq } from "drizzle-orm";
import { NotFoundError } from "../../api/errors.js";
import { db } from "../index.js";
import { chirps, NewChirp } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getChirps(userId?: string) {
  return await db
    .select()
    .from(chirps)
    .where(userId ? eq(chirps.userId, userId) : undefined)
    .orderBy(asc(chirps.createdAt));
}

export async function getChirpById(chirpId: string) {
  const rows = await db.select().from(chirps).where(eq(chirps.id, chirpId));

  if (rows.length === 0) {
    throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);
  }

  return rows[0];
}

export async function deleteChirpById(chirpId: string) {
  const rows = await db
    .delete(chirps)
    .where(eq(chirps.id, chirpId))
    .returning();

  if (rows.length === 0) {
    throw new NotFoundError(`Couldn't delete chirp with chirpId: ${chirpId}`);
  }

  return rows[0];
}
