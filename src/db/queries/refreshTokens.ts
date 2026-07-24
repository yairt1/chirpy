import { eq } from "drizzle-orm";
import { config } from "../../config.js";
import { db } from "../index.js";
import { refreshTokens } from "../schema.js";

export async function saveRefreshToken(userId: string, token: string) {
  const rows = await db
    .insert(refreshTokens)
    .values({
      userId: userId,
      token: token,
      expiresAt: new Date(Date.now() + config.jwt.refreshDuration),
      revokedAt: null,
    })
    .onConflictDoNothing()
    .returning();

  return rows.length > 0;
}

export async function revokeRefreshToken(token: string) {
  const rows = await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.token, token))
    .returning();

  if (rows.length === 0) {
    throw new Error("Couldn't revoke token");
  }
}
