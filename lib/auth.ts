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
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function parseUserSessionToken(token: string): UserSession | null {
  if (!token) return null;
  try {
    let payloadRaw = "";
    if (token.includes(".")) {
      payloadRaw = Buffer.from(token.split(".")[1], "base64url").toString("utf8");
    } else {
      try {
        payloadRaw = Buffer.from(token, "base64url").toString("utf8");
      } catch {
        payloadRaw = Buffer.from(token, "base64").toString("utf8");
      }
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
        : "learner");

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
      tournamentId: payload.tournamentId || (role === "btc" ? "giai-vo-dich-clb-karate-phu-tho-2026" : undefined),
      assignedTournament: payload.assignedTournament || (role === "btc" ? "Giải vô địch các CLB Karate tỉnh Phú Thọ năm 2026" : undefined),
    };
  } catch {
    return null;
  }
}

export async function getUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();

  // 1. Check user session cookie first
  const userToken = cookieStore.get(USER_SESSION_COOKIE)?.value;
  if (userToken) {
    const session = parseUserSessionToken(userToken);
    if (session) return session;
  }

  // 2. Fall back to admin token cookie
  const adminToken = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;
  if (adminToken) {
    const session = parseUserSessionToken(adminToken);
    if (session) {
      // The license server JWT identifies an admin by its signed cookie but
      // does not always include a `role` claim. The admin layout already
      // requires this cookie, so preserve the admin context for API guards.
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
