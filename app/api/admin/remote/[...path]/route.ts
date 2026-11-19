import { NextResponse } from "next/server";
import { adminApiFetch } from "@/lib/admin-api";

/**
 * Thin, authenticated bridge to the existing license-server API.
 * Keeping this server-side means the VPS bearer token never reaches the browser.
 */
const ALLOWED_PREFIXES = [
  "stats/dashboard",
  "cloud-sync/tournaments",
  "cloud-sync/tournament/",
  "cloud-sync/purge/",
  "cloud-sync/trigger-auto-purge",
  "admin/payment-orders",
  "admin/pricing",
  "admin/payment-settings",
  "admin/users",
  "license/requests",
  "license/request/resolve",
];

function isAllowed(path: string) {
  return ALLOWED_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix));
}

async function forward(request: Request, pathParts: string[]) {
  const path = pathParts.join("/");
  if (!isAllowed(path)) return NextResponse.json({ message: "API quản trị không được phép." }, { status: 404 });

  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.text();
  try {
    const upstream = await adminApiFetch(`/api/${path}`, {
      method: request.method,
      body: body || undefined,
      headers: body ? { "Content-Type": request.headers.get("content-type") || "application/json" } : undefined,
      signal: AbortSignal.timeout(10_000),
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch {
    return NextResponse.json({ message: "Không thể kết nối máy chủ quản trị." }, { status: 503 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(request, (await params).path);
}
export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(request, (await params).path);
}
export async function PUT(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(request, (await params).path);
}
export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(request, (await params).path);
}
