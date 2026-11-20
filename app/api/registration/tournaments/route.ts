import { NextResponse } from "next/server";
import { listPublishedTournaments } from "@/lib/registration-supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await listPublishedTournaments();
  return NextResponse.json({ items });
}

