import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_TOKEN_COOKIE } from "@/lib/admin-api";
import { getEventsStore, addEventItem, EventItem } from "@/lib/admin-store";
import { revalidatePath } from "next/cache";

export async function GET() {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Phiên đăng nhập hết hạn" }, { status: 401 });
  return NextResponse.json({ items: getEventsStore() });
}

export async function POST(request: Request) {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Phiên đăng nhập hết hạn" }, { status: 401 });

  try {
    const body = (await request.json()) as Partial<EventItem>;
    if (!body.name || !body.location) {
      return NextResponse.json({ message: "Vui lòng nhập tên giải và địa điểm" }, { status: 400 });
    }

    const newItem = addEventItem({
      name: body.name.trim(),
      location: body.location.trim(),
      date: body.date || "Sắp công bố",
      registrations: Number(body.registrations) || 0,
      status: body.status || "Mở đăng ký",
      organizer: body.organizer || "Ban Tổ Chức Giải Đấu K-SPORT",
      tatamiCount: Number(body.tatamiCount) || 3,
      categoriesCount: Number(body.categoriesCount) || 36,
    });

    revalidatePath("/events");
    revalidatePath("/admin/events");

    return NextResponse.json({ item: newItem, message: "Tạo giải đấu thành công" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Lỗi xử lý" }, { status: 500 });
  }
}

