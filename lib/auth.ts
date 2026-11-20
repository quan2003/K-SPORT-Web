import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { UserRole } from "./user-store";

export type AdminRole = "admin" | "btc" | "editor" | "viewer";

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  authProvider?: "email" | "google" | "admin";
  clubOrUnit?: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  tournamentId?: string;
  assignedTournament?: string;
}

export type PublicSession = UserSession;

export const USER_SESSION_COOKIE = "ksport_user_session";
export const ADMIN_TOKEN_COOKIE = "ksport_admin_token";

function getSessionSecret(): string {
  return (
    process.env.AUTH_SECRET?.trim() ||
    process.env.LICENSE_MANAGER_GATE_SECRET?.trim() ||
    "ksport-dev-session-secret-change-in-prod"
  );
}

function signPayload(encodedPayload: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function verifySignature(encodedPayload: string, signature: string): boolean {
  const expected = signPayload(encodedPayload);
  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function createUserSessionToken(user: UserSession): string {
  const payload = {
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    authProvider: user.authProvider || "email",
    clubOrUnit: user.clubOrUnit,
    phone: user.phone,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    tournamentId: user.tournamentId,
    assignedTournament: user.assignedTournament,
    iat: Date.now(),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signPayload(encoded)}`;
}

export function parseUserSessionToken(
  token: string,
  options?: { allowRemoteJwt?: boolean },
): UserSession | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    let payloadRaw = "";

    if (parts.length === 2) {
      const [encoded, signature] = parts;
      if (!encoded || !signature || !verifySignature(encoded, signature)) {
        return null;
      }
      payloadRaw = Buffer.from(encoded, "base64url").toString("utf8");
    } else if (parts.length === 3 && options?.allowRemoteJwt) {
      // Remote JWT issued by KSPORT_ADMIN_API_URL (verified upstream by the license server).
      payloadRaw = Buffer.from(parts[1], "base64url").toString("utf8");
    } else {
      return null;
    }

    const payload = JSON.parse(payloadRaw) as {
      userId?: string;
      u?: string;
      username?: string;
      name?: string;
      email?: string;
      role?: UserRole;
      avatar?: string;
      authProvider?: "email" | "google" | "admin";
      clubOrUnit?: string;
      phone?: string;
      gender?: "male" | "female" | "other";
      dateOfBirth?: string;
      tournamentId?: string;
      assignedTournament?: string;
    };

    const userId = payload.userId || payload.username || payload.u;
    if (!userId) return null;

    const email = payload.email || `${userId}@k-sport.net`;
    const role: UserRole =
      payload.role ||
      (userId.startsWith("btc")
        ? "btc"
        : userId.startsWith("admin")
        ? "admin"
        : "user");

    const defaultName =
      role === "btc"
        ? "Ban Tổ Chức Phú Thọ 2026"
        : role === "admin"
        ? "Quản trị viên Hệ thống"
        : role === "referee"
        ? "Trọng tài WKF"
        : "Học viên Karate";

    return {
      userId,
      name: payload.name || defaultName,
      email,
      role,
      avatar: payload.avatar,
      authProvider: payload.authProvider || "email",
      clubOrUnit: payload.clubOrUnit,
      phone: payload.phone,
      gender: payload.gender,
      dateOfBirth: payload.dateOfBirth,
      tournamentId:
        payload.tournamentId ||
        (role === "btc" ? "giai-vo-dich-clb-karate-phu-tho-2026" : undefined),
      assignedTournament: payload.assignedTournament || undefined,
    };
  } catch {
    return null;
  }
}

export async function getUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();

  // 1. Check signed user session cookie first
  const userToken = cookieStore.get(USER_SESSION_COOKIE)?.value;
  if (userToken) {
    const session = parseUserSessionToken(userToken);
    if (session) return session;
  }

  // 2. Fall back to admin token cookie
  const adminToken = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;
  if (adminToken) {
    const session = parseUserSessionToken(adminToken, {
      allowRemoteJwt: Boolean(process.env.KSPORT_ADMIN_API_URL),
    });
    if (session) {
      if (session.role !== "admin" && session.role !== "btc") {
        return { ...session, role: "admin" };
      }
      return session;
    }
  }

  return null;
}

// Backward-compatible alias
export async function getPublicSession(): Promise<PublicSession | null> {
  return getUserSession();
}

export function isAuthConfigured() {
  return Boolean(process.env.KSPORT_ADMIN_API_URL || process.env.KSPORT_PUBLIC_API_URL);
}
