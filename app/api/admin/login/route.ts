import { NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE, getAdminApiBase } from "@/lib/admin-api";
import { createUserSessionToken, type AdminRole } from "@/lib/auth";

type LocalAdminAuth = {
  valid: boolean;
  role: AdminRole;
  name: string;
  tournamentId?: string;
};

function checkLocalCredentials(usernameInput: string, passwordInput: string): LocalAdminAuth {
  const u = usernameInput.trim().toLowerCase();
  const p = passwordInput;

  const envAdminUser = process.env.WEB_ADMIN_USERNAME?.trim().toLowerCase();
  const envAdminPass = process.env.WEB_ADMIN_INITIAL_PASSWORD;
  if (envAdminUser && envAdminPass && u === envAdminUser && p === envAdminPass) {
    return {
      valid: true,
      role: "admin",
      name: "Quản trị viên Hệ thống",
    };
  }

  // Development-only fallback accounts (never active in production)
  if (process.env.NODE_ENV !== "production") {
    if (u === "admin-k-sport" && p === "Ksport!Quan_2026#") {
      return { valid: true, role: "admin", name: "Quản trị viên Hệ thống" };
    }
    if (u === "btc-phutho" && p === "Ksport!Btc2026") {
      return {
        valid: true,
        role: "btc",
        name: "Ban Tổ Chức Phú Thọ 2026",
        tournamentId: "giai-vo-dich-clb-karate-phu-tho-2026",
      };
    }
    if (u === "truyenthong" && p === "Ksport!Media_2026#") {
      return { valid: true, role: "editor", name: "Ban Thư ký & Truyền thông" };
    }
  }

  return { valid: false, role: "admin", name: "" };
}

function createSessionResponse(
  username: string,
  role: AdminRole,
  name: string,
  tournamentId?: string,
  apiToken?: string,
) {
  const sessionToken =
    apiToken ||
    createUserSessionToken({
      userId: username,
      name,
      email: `${username}@k-sport.net`,
      role,
      authProvider: "admin",
      tournamentId: tournamentId || "giai-vo-dich-clb-karate-phu-tho-2026",
    });

  const redirectUrl = role === "btc" ? "/admin/btc" : "/admin";

  const result = NextResponse.json({
    user: { username, role, name },
    redirectUrl,
    message: "Đăng nhập thành công",
  });

  result.cookies.set(ADMIN_TOKEN_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 86400 * 7,
  });

  return result;
}

export async function POST(request: Request) {
  const { username, password } = await request.json().catch(() => ({}));
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ message: "Vui lòng nhập tên đăng nhập và mật khẩu" }, { status: 400 });
  }

  // Prefer the production identity service when explicitly configured. Its JWT is
  // kept in the same httpOnly cookie and is required by the license API proxy.
  if (process.env.KSPORT_ADMIN_API_URL) {
    try {
      const response = await fetch(`${getAdminApiBase()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
        signal: AbortSignal.timeout(5_000),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        token?: string;
        user?: { username?: string; role?: AdminRole; name?: string };
        message?: string;
      };
      if (response.ok && payload.success && payload.token) {
        const user = payload.user;
        return createSessionResponse(
          user?.username || username.trim(),
          user?.role || "admin",
          user?.name || "Quản trị viên",
          undefined,
          payload.token,
        );
      }
      return NextResponse.json(
        { message: payload.message || "Tên đăng nhập hoặc mật khẩu không chính xác." },
        { status: 401 },
      );
    } catch {
      return NextResponse.json({ message: "Không thể kết nối dịch vụ đăng nhập quản trị." }, { status: 503 });
    }
  }

  const localAuth = checkLocalCredentials(username, password);
  if (localAuth.valid) {
    return createSessionResponse(username.trim(), localAuth.role, localAuth.name, localAuth.tournamentId);
  }

  return NextResponse.json(
    { message: "Tên đăng nhập hoặc mật khẩu không chính xác." },
    { status: 401 },
  );
}
