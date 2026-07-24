import { and, eq, gt, isNull } from "drizzle-orm";
import { BadRequestError } from "../../api/errors.js";
import { db } from "../index.js";
import { NewUser, refreshTokens, users } from "../schema.js";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function deleteAllUsers() {
  await db.delete(users);
}

export async function getUserByEmail(email: string) {
  const [result] = await db.select().from(users).where(eq(users.email, email));
  return result;
}

export async function getUserFromRefreshToken(token: string) {
  const [result] = await db
    .select({ user: users })
    .from(users)
    .innerJoin(refreshTokens, eq(users.id, refreshTokens.userId))
    .where(
      and(
        eq(refreshTokens.token, token),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return result;
}

export async function updateEmailAndPassword(
  id: string,
  email: string,
  hashedPassword: string,
) {
  const rows = await db
    .update(users)
    .set({ email: email, hashedPassword: hashedPassword })
    .where(and(eq(users.id, id)))
    .returning();

  if (rows.length === 0) {
    throw new BadRequestError("Couldn't update email and password");
  }

  return rows[0];
}

export async function updateChirpyRedById(id: string) {
  const [result] = await db
    .update(users)
    .set({ isChirpyRed: true })
    .where(eq(users.id, id))
    .returning();

  return result;
}
