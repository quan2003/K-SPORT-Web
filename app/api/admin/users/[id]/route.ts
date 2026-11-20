import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_TOKEN_COOKIE, adminApiFetch } from "@/lib/admin-api";
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

    // Try VPS admin API first
    try {
      const remoteRes = await adminApiFetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(4_000),
      });
      const remotePayload = await remoteRes.json().catch(() => ({}));
      if (remoteRes.ok) {
        return NextResponse.json({
          item: remotePayload.user || remotePayload.item || updates,
          message: remotePayload.message || "Cập nhật thành công",
        });
      }
      // If VPS explicitly rejected (e.g., protected Super Admin, 400/403), surface its message
      if (remoteRes.status !== 404) {
        return NextResponse.json(
          { message: remotePayload.message || `Máy chủ từ chối cập nhật (${remoteRes.status})` },
          { status: remoteRes.status },
        );
      }
    } catch {
      // VPS unreachable, fall through to local store
    }

    const updated = updateUserItem(id, updates);
    if (!updated) {
      return NextResponse.json(
        { message: "Không thể cập nhật tài khoản này trên máy chủ (hoặc tài khoản được bảo vệ)." },
        { status: 404 },
      );
    }

    return NextResponse.json({ item: updated, message: "Cập nhật thành công" });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Lỗi xử lý" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Phiên đăng nhập hết hạn" }, { status: 401 });

  const session = await getPublicSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ message: "Chỉ Quản trị viên tối cao mới có quyền xóa" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const remoteRes = await adminApiFetch(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: "DELETE",
      signal: AbortSignal.timeout(4_000),
    });
    const remotePayload = await remoteRes.json().catch(() => ({}));
    if (remoteRes.ok) {
      return NextResponse.json({ success: true, message: remotePayload.message || "Đã xóa người dùng" });
    }
    if (remoteRes.status !== 404) {
      return NextResponse.json(
        { message: remotePayload.message || `Máy chủ từ chối xóa (${remoteRes.status})` },
        { status: remoteRes.status },
      );
    }
  } catch {
    // VPS unreachable, fall through to local store
  }

  const deleted = deleteUserItem(id);
  if (!deleted) {
    return NextResponse.json(
      { message: "Không tìm thấy người dùng để xóa (hoặc tài khoản được bảo vệ)." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, message: "Đã xóa người dùng" });
}
