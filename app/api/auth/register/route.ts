import { NextResponse } from "next/server";
import { createUserSessionToken, USER_SESSION_COOKIE } from "@/lib/auth";
import { registerUser } from "@/lib/user-store";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, password, clubOrUnit } = body;

    const safeUser = registerUser({
      name,
      email,
      password,
      clubOrUnit,
      role: "learner",
    });

    const sessionToken = createUserSessionToken({
      userId: safeUser.id,
      name: safeUser.name,
      email: safeUser.email,
      role: safeUser.role,
      avatar: safeUser.avatarUrl,
      authProvider: safeUser.authProvider,
      clubOrUnit: safeUser.clubOrUnit,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: safeUser,
        message: "Đăng ký tài khoản thành công!",
      },
      { status: 201 }
    );

    response.cookies.set({
      name: USER_SESSION_COOKIE,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Đăng ký không thành công.",
      },
      { status: 400 }
    );
  }
}

