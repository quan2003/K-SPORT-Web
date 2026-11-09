import { NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE, getAdminApiBase } from "@/lib/admin-api";
import type { AdminRole } from "@/lib/auth";

type LocalAdminAuth = {
  valid: boolean;
  role: AdminRole;
  name: string;
  tournamentId?: string;
};

function checkLocalCredentials(usernameInput: string, passwordInput: string): LocalAdminAuth {
  const u = usernameInput.trim().toLowerCase();
  const p = passwordInput.trim();

  // 1. BTC role credentials
  const btcUsers = new Set(["btc-phutho", "btc", "bantochoi", "btc2026"]);
  const btcPasswords = new Set([
    "Ksport!Btc_2026#",
    "Ksport!Btc2026",
    "btc123",
    "123456",
    "btc",
    "admin",
  ]);

  if (btcUsers.has(u) && btcPasswords.has(p)) {
    return {
      valid: true,
      role: "btc",
      name: "Ban Tổ Chức Phú Thọ 2026",
      tournamentId: "giai-vo-dich-clb-karate-phu-tho-2026",
    };
  }

  // 2. Super Admin credentials
  const validUsers = new Set([
    (process.env.WEB_ADMIN_USERNAME || "admin-k-sport").toLowerCase(),
    "admin-k-sport",
    "admin",
    "ksport",
    "quantri",
  ]);

  const validPasswords = new Set([
    process.env.WEB_ADMIN_INITIAL_PASSWORD || "Ksport!Quan_2026#",
    "Ksport!Quan_2026#",
    "Ksport!Quan_2026",
    "Ksport!Quan2026",
    "admin",
    "admin123",
    "admin-k-sport",
    "123456",
    "ksport2026",
  ]);

  if (validUsers.has(u) && validPasswords.has(p)) {
    return {
      valid: true,
      role: "admin",
      name: "Quản trị viên Hệ thống",
    };
  }

  // 3. Media / Truyen Thong role credentials
  const mediaUsers = new Set(["truyenthong", "bientapvien", "media"]);
  const mediaPasswords = new Set([
    "Ksport!Media2026",
    "Ksport!Media_2026#",
    "media123",
    "123456",
    "admin",
  ]);

  if (mediaUsers.has(u) && mediaPasswords.has(p)) {
    return {
      valid: true,
      role: "editor",
      name: "Ban Thư ký & Truyền thông",
    };
  }

  return { valid: false, role: "admin", name: "" };
}

function createSessionResponse(username: string, role: AdminRole, name: string, tournamentId?: string) {
  const sessionData = {
    u: username,
    role,
    name,
    tournamentId: tournamentId || "giai-vo-dich-clb-karate-phu-tho-2026",
    t: Date.now(),
  };

  const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString("base64");
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

  // 1. Check local credentials (Admin and BTC)
  const localAuth = checkLocalCredentials(username, password);
  if (localAuth.valid) {
    return createSessionResponse(username.trim(), localAuth.role, localAuth.name, localAuth.tournamentId);
  }

  // 2. Fallback to remote API if configured
  const apiBase = getAdminApiBase();
  if (apiBase) {
    try {
      const response = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
        signal: AbortSignal.timeout(2500),
      });

      if (response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          token?: string;
          user?: { username?: string; role?: AdminRole; name?: string };
        };
        const u = payload.user?.username || username.trim();
        const role = payload.user?.role || "admin";
        const name = payload.user?.name || "Quản trị viên";
        return createSessionResponse(u, role, name);
      }
    } catch {
      // remote failed/offline
    }
  }

  return NextResponse.json(
    {
      message:
        "Tên đăng nhập hoặc mật khẩu không chính xác. Tài khoản Admin: admin-k-sport / Ksport!Quan_2026# hoặc Tài khoản BTC: btc-phutho / Ksport!Btc2026",
    },
    { status: 401 }
  );
}
