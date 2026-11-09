import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_TOKEN_COOKIE } from "@/lib/admin-api";
import { getUsersStore, addUserItem, AdminUserItem } from "@/lib/admin-store";
import { getPublicSession } from "@/lib/auth";

export async function GET() {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Phiên đăng nhập hết hạn" }, { status: 401 });

  const session = await getPublicSession();
  if (session?.role === "btc") {
    return NextResponse.json({ message: "Khu vực giới hạn cho Quản trị viên" }, { status: 403 });
  }

  return NextResponse.json({ items: getUsersStore() });
}

export async function POST(request: Request) {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Phiên đăng nhập hết hạn" }, { status: 401 });

  const session = await getPublicSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ message: "Chỉ Quản trị viên tối cao mới có quyền tạo người dùng" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Partial<AdminUserItem>;
    if (!body.username || !body.name) {
      return NextResponse.json({ message: "Vui lòng nhập tên đăng nhập và họ tên" }, { status: 400 });
    }

    const newItem = addUserItem({
      username: body.username.trim().toLowerCase(),
      name: body.name.trim(),
      email: body.email?.trim() || `${body.username}@k-sport.net`,
      role: body.role || "btc",
      assignedTournament: body.assignedTournament || "Giải vô địch các CLB Karate tỉnh Phú Thọ năm 2026",
      status: body.status || "Hoạt động",
    });

    return NextResponse.json({ item: newItem, message: "Thêm người dùng thành công" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Lỗi xử lý" }, { status: 500 });
  }
}

