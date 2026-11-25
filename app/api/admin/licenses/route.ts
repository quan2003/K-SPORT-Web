import { NextResponse } from "next/server";
import { adminApiFetch } from "@/lib/admin-api";
import { mayManageLicenses } from "@/lib/license-access";

export const dynamic = "force-dynamic";

async function ensureAccess() {
  return (await mayManageLicenses()) ? null : NextResponse.json({ message: "Cần xác thực mã quản lý license trước khi tiếp tục." }, { status: 403 });
}

async function forward(path: string, init: RequestInit) {
  try {
    const upstream = await adminApiFetch(path, { ...init, signal: AbortSignal.timeout(8_000) });
    return NextResponse.json(await upstream.json().catch(() => ({})), { status: upstream.status });
  } catch {
    return NextResponse.json({ message: "Không thể kết nối máy chủ license. Kiểm tra KSPORT_ADMIN_API_URL và trạng thái VPS." }, { status: 503 });
  }
}

export async function GET() {
  const denied = await ensureAccess();
  return denied || forward("/api/license/list", { method: "GET" });
}

export async function POST(request: Request) {
  const denied = await ensureAccess();
  if (denied) return denied;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: "Dữ liệu không hợp lệ." }, { status: 400 });
  const op = typeof body.op === "string" ? body.op : "create";
  const paths: Record<string, string> = { create: "/api/license/create", reset: "/api/license/reset", revoke: "/api/license/revoke", extend: "/api/license/extend", smartSchedule: "/api/license/smart-schedule" };
  if (!paths[op]) return NextResponse.json({ message: "Thao tác license không hợp lệ." }, { status: 400 });
  const payload = { ...body };
  delete payload.op;
  return forward(paths[op], { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}

export async function DELETE(request: Request) {
  const denied = await ensureAccess();
  if (denied) return denied;
  const { id } = await request.json().catch(() => ({}));
  if (typeof id !== "string" || !id) return NextResponse.json({ message: "Thiếu mã license." }, { status: 400 });
  return forward(`/api/license/${encodeURIComponent(id)}`, { method: "DELETE" });
}
