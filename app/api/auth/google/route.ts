import { NextResponse } from "next/server";
import { createUserSessionToken, USER_SESSION_COOKIE } from "@/lib/auth";
import { authenticateWithGoogle } from "@/lib/user-store";

function decodeGoogleCredential(credentialToken: string): {
  email?: string;
  name?: string;
  picture?: string;
  sub?: string;
} | null {
  try {
    const parts = credentialToken.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8")
    ) as {
      email?: string;
      name?: string;
      picture?: string;
      sub?: string;
    };
    return payload;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let email = body.email as string | undefined;
    let name = body.name as string | undefined;
    let picture = body.picture as string | undefined;
    let googleId = body.googleId as string | undefined;

    // 1. If Google GIS credential token is provided
    if (typeof body.credential === "string" && body.credential.trim()) {
      const decoded = decodeGoogleCredential(body.credential);
      if (decoded && decoded.email) {
        email = decoded.email;
        name = decoded.name || email.split("@")[0];
        picture = decoded.picture;
        googleId = decoded.sub;
      }
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy thông tin email từ Google." },
        { status: 400 }
      );
    }

    const safeUser = authenticateWithGoogle({
      email,
      name: name || email.split("@")[0],
      picture,
      googleId,
    });

    const sessionToken = createUserSessionToken({
      userId: safeUser.id,
      name: safeUser.name,
      email: safeUser.email,
      role: safeUser.role,
      avatar: safeUser.avatarUrl,
      authProvider: "google",
      clubOrUnit: safeUser.clubOrUnit,
    });

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: "Đăng nhập Google thành công!",
      redirectUrl: "/wkf-exam",
    });

    response.cookies.set({
      name: USER_SESSION_COOKIE,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Đăng nhập Google thất bại.",
      },
      { status: 500 }
    );
  }
}

