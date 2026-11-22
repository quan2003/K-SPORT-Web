import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_TOKEN_COOKIE, adminApiFetch } from "@/lib/admin-api";
import { updateEventItem, setEventTierOverride, EventItem } from "@/lib/admin-store";
import { revalidatePath } from "next/cache";

const VALID_TIERS = new Set(["national", "regional", "club"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Phiên đăng nhập hết hạn" }, { status: 401 });

  const { id } = await params;
  try {
    const updates = (await request.json()) as Partial<EventItem>;

    if (updates.tier && VALID_TIERS.has(updates.tier)) {
      setEventTierOverride(id, updates.tier);
    }

    // Also try forwarding to VPS if supported
    try {
      await adminApiFetch(`/api/admin/events/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(3_000),
      });
    } catch {
      // VPS may not expose /api/admin/events/:id yet; local override still applied
    }

    const updated = updateEventItem(id, updates);

    revalidatePath("/events");
    revalidatePath("/ranking");
    revalidatePath("/admin/events");

    return NextResponse.json({
      item: updated || { id, ...updates, tierSource: updates.tier ? "manual" : undefined },
      message: "Cập nhật giải đấu thành công",
    });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Lỗi xử lý" }, { status: 500 });
  }
}
