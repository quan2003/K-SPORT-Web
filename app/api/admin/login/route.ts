import { NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE, getAdminApiBase } from "@/lib/admin-api";

export async function POST(request: Request) {
  const { username, password } = await request.json().catch(() => ({}));
  if (typeof username !== "string" || typeof password !== "string") return NextResponse.json({ message: "Vui lòng nhập tên đăng nhập và mật khẩu" }, { status: 400 });
  const baseUrl = getAdminApiBase();
  if (!baseUrl) return NextResponse.json({ message: "Chưa cấu hình API quản trị" }, { status: 503 });
  const response = await fetch(`${baseUrl}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }), cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  // Older VPS login responses use HTTP 200 even when credentials are wrong.
  // Convert that payload-level failure into 401 so the client never treats it
  // as an authenticated session and bounces login -> admin -> login.
  if (!response.ok || !payload.success || !payload.token) {
    return NextResponse.json(
      { message: payload.message || "Không thể đăng nhập" },
      { status: response.ok ? 401 : response.status || 401 },
    );
  }
  const result = NextResponse.json({ user: payload.user });
  result.cookies.set(ADMIN_TOKEN_COOKIE, payload.token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 86400 });
  return result;
}
