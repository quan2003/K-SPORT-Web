import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { recordSiteVisit } from "@/lib/analytics-store";

function extractClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "";
  return request.headers.get("x-real-ip")?.trim() || "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      path?: string;
      sessionId?: string;
      platformHint?: string;
    };
    const path = typeof body.path === "string" ? body.path : "/";
    const userAgent = request.headers.get("user-agent") || "";
    const ip = extractClientIp(request);

    // Combine persistent client deviceId with server-side IP+UA hash fallback
    // so reopening tabs does not inflate unique user counts.
    const rawId = typeof body.sessionId === "string" ? body.sessionId.trim().slice(0, 64) : "";
    const fallbackDay = new Date().toISOString().slice(0, 10);
    const visitorId =
      rawId ||
      `fp-${crypto
        .createHash("sha256")
        .update(`${ip}|${userAgent}|${fallbackDay}`)
        .digest("hex")
        .slice(0, 20)}`;

    const platformHint = typeof body.platformHint === "string" ? body.platformHint.slice(0, 40) : "";

    await recordSiteVisit({ path, sessionId: visitorId, userAgent, platformHint });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
