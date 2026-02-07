import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_TOKEN_COOKIE = "admin_token";

/**
 * Generate a HMAC-based token from the admin password.
 * The token is deterministic (same password → same token)
 * but the raw password cannot be recovered from it.
 */
function generateAdminToken(): string {
  const secret = process.env.ADMIN_PASSWORD!;
  return crypto.createHmac("sha256", secret).update("admin-session").digest("hex");
}

export async function setAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_TOKEN_COOKIE, generateAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_TOKEN_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get(ADMIN_TOKEN_COOKIE);
  if (!adminToken?.value) return false;
  return adminToken.value === generateAdminToken();
}
