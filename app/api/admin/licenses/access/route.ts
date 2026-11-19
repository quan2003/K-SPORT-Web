import { NextResponse } from "next/server";
import { getPublicSession } from "@/lib/auth";
import { adminApiFetch } from "@/lib/admin-api";
import { createLicenseAccessCookie, hasLicenseGateSecret, LICENSE_ACCESS_COOKIE } from "@/lib/license-access";

export const dynamic = "force-dynamic";

function forbidden() { return NextResponse.json({ message: "Chỉ quản trị viên toàn quyền mới được mở quản lý license." }, { status: 403 }); }

export async function GET() {
  if ((await getPublicSession())?.role !== "admin") return forbidden();
  try {
    const response = await adminApiFetch("/api/license-manager/passcode/status", { signal: AbortSignal.timeout(8_000) });
    return NextResponse.json(await response.json().catch(() => ({})), { status: response.status });
  } catch {
    return NextResponse.json({ message: "Không thể kết nối máy chủ quản lý license." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if ((await getPublicSession())?.role !== "admin") return NextResponse.json({ message: "Chỉ quản trị viên toàn quyền mới được mở quản lý license." }, { status: 403 });
  if (!hasLicenseGateSecret()) return NextResponse.json({ message: "Máy chủ web chưa được cấu hình khóa phiên quản lý license." }, { status: 503 });
  const { passcode, confirmation, mode } = await request.json().catch(() => ({}));
  if (typeof passcode !== "string" || !/^\d{6}$/.test(passcode)) return NextResponse.json({ message: "Passcode phải gồm đúng 6 chữ số." }, { status: 400 });
  if (mode !== "setup" && mode !== "verify") return NextResponse.json({ message: "Thao tác passcode không hợp lệ." }, { status: 400 });
  try {
    const upstream = await adminApiFetch(`/api/license-manager/passcode/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode, confirmation }),
      signal: AbortSignal.timeout(8_000),
    });
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok || !payload.success) return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return NextResponse.json({ message: "Không thể kết nối máy chủ quản lý license." }, { status: 503 });
  }
  const value = await createLicenseAccessCookie();
  if (!value) return NextResponse.json({ message: "Phiên đăng nhập không hợp lệ." }, { status: 401 });
  const response = NextResponse.json({ success: true });
  // The protected portal spans several /admin/* routes. The normal /admin
  // dashboard remains public to the signed-in admin because its layout does
  // not check this cookie.
  response.cookies.set(LICENSE_ACCESS_COOKIE, value, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/admin", maxAge: 60 * 60 * 8 });
  return response;
}
