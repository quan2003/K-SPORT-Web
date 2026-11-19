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
    let email: string | undefined;
    let name: string | undefined;
    let picture: string | undefined;
    let googleId: string | undefined;

    // 1. If Google GIS credential token is provided
    if (typeof body.credential === "string" && body.credential.trim()) {
      const tokenInfoResponse = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.credential)}`,
        { signal: AbortSignal.timeout(5_000) },
      );
      const verified = tokenInfoResponse.ok
        ? ((await tokenInfoResponse.json()) as { email?: string; name?: string; picture?: string; sub?: string; aud?: string })
        : null;
      const expectedClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!verified?.email || (expectedClientId && verified.aud !== expectedClientId)) {
        return NextResponse.json({ success: false, error: "Thông tin Google không hợp lệ." }, { status: 401 });
      }
      email = verified.email;
      name = verified.name || email.split("@")[0];
      picture = verified.picture;
      googleId = verified.sub;
    }

    if (!body.credential || !email || !email.includes("@")) {
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
      phone: safeUser.phone,
      gender: safeUser.gender,
      dateOfBirth: safeUser.dateOfBirth,
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

