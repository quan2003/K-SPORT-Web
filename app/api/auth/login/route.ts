import { NextResponse } from "next/server";
import {
  ADMIN_TOKEN_COOKIE,
  createUserSessionToken,
  USER_SESSION_COOKIE,
} from "@/lib/auth";
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

