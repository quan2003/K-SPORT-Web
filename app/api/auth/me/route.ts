import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: session,
    });
  } catch (err) {
    return NextResponse.json(
      {
        authenticated: false,
        error: err instanceof Error ? err.message : "Lỗi kiểm tra phiên.",
      },
      { status: 500 }
    );
  }
}

