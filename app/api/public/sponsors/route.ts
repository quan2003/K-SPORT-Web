import { NextResponse } from "next/server";
import { getSponsorsStore } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const allSponsors = getSponsorsStore();
  const activeSponsors = allSponsors.filter((s) => s.isActive);
  return NextResponse.json({ items: activeSponsors });
}

