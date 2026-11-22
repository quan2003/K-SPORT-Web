import { NextResponse } from "next/server";
import { recordSiteVisit } from "@/lib/analytics-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      path?: string;
      sessionId?: string;
    };
    const path = typeof body.path === "string" ? body.path : "/";
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 64) : "";
    const userAgent = request.headers.get("user-agent") || "";

    recordSiteVisit({ path, sessionId, userAgent });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

