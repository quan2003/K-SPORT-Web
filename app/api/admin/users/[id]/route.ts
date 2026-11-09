import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_TOKEN_COOKIE } from "@/lib/admin-api";
import { updateUserItem, deleteUserItem, AdminUserItem } from "@/lib/admin-store";
import { getPublicSession } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Phiên đăng nhập hết hạn" }, { status: 401 });

  const session = await getPublicSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ message: "Chỉ Quản trị viên tối cao mới có quyền cập nhật" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const updates = (await request.json()) as Partial<AdminUserItem>;
    const updated = updateUserItem(id, updates);
    if (!updated) return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 });

    return NextResponse.json({ item: updated, message: "Cập nhật thành công" });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Lỗi xử lý" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Phiên đăng nhập hết hạn" }, { status: 401 });

  const session = await getPublicSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ message: "Chỉ Quản trị viên tối cao mới có quyền xóa" }, { status: 403 });
  }

  const { id } = await params;
  const deleted = deleteUserItem(id);
  if (!deleted) return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Đã xóa người dùng" });
}

