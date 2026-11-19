import { NextResponse } from "next/server";
import {
  ADMIN_TOKEN_COOKIE,
  createUserSessionToken,
  USER_SESSION_COOKIE,
} from "@/lib/auth";
import type { AdminRole } from "@/lib/auth";
import { getAdminApiBase } from "@/lib/admin-api";
import { authenticateWithPassword } from "@/lib/user-store";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, username, password } = body;
    const loginIdentifier = (email || username || "").trim();

    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập email/tên đăng nhập và mật khẩu." },
        { status: 400 }
      );
    }

    // When the license API is configured, authenticate administrators there
    // first so the admin cookie contains the server-issued JWT required by
    // protected license endpoints. Keep local auth as a fallback for normal
    // website accounts and development.
    if (process.env.KSPORT_ADMIN_API_URL) {
      try {
        const remoteResponse = await fetch(`${getAdminApiBase()}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: loginIdentifier, password }),
          signal: AbortSignal.timeout(5_000),
        });
        const remotePayload = (await remoteResponse.json().catch(() => ({}))) as {
          success?: boolean;
          token?: string;
          user?: { username?: string; email?: string; name?: string; role?: AdminRole };
        };
        if (remoteResponse.ok && remotePayload.success && remotePayload.token) {
          const remoteUser = remotePayload.user;
          const userSessionToken = createUserSessionToken({
            userId: remoteUser?.username || remoteUser?.email || loginIdentifier,
            name: remoteUser?.name || "Quản trị viên Hệ thống",
            email: remoteUser?.email || `${loginIdentifier}@k-sport.net`,
            role: "admin",
            authProvider: "admin",
          });
          const response = NextResponse.json({
            success: true,
            user: {
              username: remoteUser?.username || loginIdentifier,
              role: "admin",
              name: remoteUser?.name || "Quản trị viên Hệ thống",
            },
            redirectUrl: "/admin",
          });
          response.cookies.set({ name: USER_SESSION_COOKIE, value: userSessionToken, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60 });
          response.cookies.set({ name: ADMIN_TOKEN_COOKIE, value: remotePayload.token, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 24 * 60 * 60 });
          return response;
        }
      } catch {
        // Fall through to local website authentication when the API is unavailable.
      }
    }

    const user = authenticateWithPassword(loginIdentifier, String(password));
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Email/tên đăng nhập hoặc mật khẩu không chính xác.",
        },
        { status: 401 }
      );
    }

    const sessionToken = createUserSessionToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatarUrl,
      authProvider: user.authProvider,
      clubOrUnit: user.clubOrUnit,
      tournamentId: user.role === "btc" ? "giai-vo-dich-clb-karate-phu-tho-2026" : undefined,
    });

    const response = NextResponse.json({
      success: true,
      user,
      redirectUrl:
        user.role === "admin"
          ? "/admin"
          : user.role === "btc"
          ? "/admin/btc"
          : "/wkf-exam",
    });

    // Set user session cookie
    response.cookies.set({
      name: USER_SESSION_COOKIE,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    // Also set admin cookie if user has admin/btc role
    if (user.role === "admin" || user.role === "btc") {
      response.cookies.set({
        name: ADMIN_TOKEN_COOKIE,
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Đăng nhập thất bại.",
      },
      { status: 500 }
    );
  }
}

