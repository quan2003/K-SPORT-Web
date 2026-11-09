import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_TOKEN_COOKIE } from "@/lib/admin-api";
import { updateEventItem, EventItem } from "@/lib/admin-store";
import { revalidatePath } from "next/cache";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Phiên đăng nhập hết hạn" }, { status: 401 });

  const { id } = await params;
  try {
    const updates = (await request.json()) as Partial<EventItem>;
    const updated = updateEventItem(id, updates);
    if (!updated) return NextResponse.json({ message: "Không tìm thấy giải đấu" }, { status: 404 });

    revalidatePath("/events");
    revalidatePath("/admin/events");

    return NextResponse.json({ item: updated, message: "Cập nhật giải đấu thành công" });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Lỗi xử lý" }, { status: 500 });
  }
}

