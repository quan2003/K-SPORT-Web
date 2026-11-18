import { NextResponse } from "next/server";
import { getPublicSession } from "@/lib/auth";
import { getAttemptForOwner } from "@/lib/wkf-exam/attempt-service";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getPublicSession();
    const { searchParams } = new URL(request.url);
    const anonOwnerId = searchParams.get("ownerId")?.trim();
    const ownerId = session?.userId || anonOwnerId || undefined;

    const attempt = getAttemptForOwner(id, ownerId);
    if (!attempt) {
      return NextResponse.json(
        { error: "Không tìm thấy lượt làm bài trên máy chủ." },
        { status: 404 }
      );
    }

    return NextResponse.json({ attempt });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Lỗi khi truy xuất lượt làm bài.",
      },
      { status: 500 }
    );
  }
}

