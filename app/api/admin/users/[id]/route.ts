import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_TOKEN_COOKIE, adminApiFetch } from "@/lib/admin-api";
import { updateUserItem, deleteUserItem, setUserOverride, AdminUserItem } from "@/lib/admin-store";
import { getPublicSession } from "@/lib/auth";

const PROTECTED_EMAILS = new Set(["luuquan232003@gmail.com", "luuquankarate@gmail.com"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Phiên đăng nhập hết hạn" }, { status: 401 });

  const session = await getPublicSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ message: "Chỉ Quản trị viên tối cao mới có quyền cập nhật" }, { status: 403 });
  }

  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  try {
    const updates = (await request.json()) as Partial<AdminUserItem>;
    const targetEmail = String(updates.email || decodedId).trim().toLowerCase();

    if (
      PROTECTED_EMAILS.has(targetEmail) &&
      ((updates.role && updates.role !== "admin") || updates.status === "Tạm khóa")
    ) {
      return NextResponse.json(
        { message: "Không thể hạ quyền hoặc tạm khóa tài khoản Super Admin hệ thống." },
        { status: 403 },
      );
    }

    // Try VPS admin API first if supported
    try {
      const remoteRes = await adminApiFetch(`/api/admin/users/${encodeURIComponent(decodedId)}`, {
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
      if (remoteRes.status !== 404 && remoteRes.status !== 405) {
        return NextResponse.json(
          { message: remotePayload.message || `Máy chủ từ chối cập nhật (${remoteRes.status})` },
          { status: remoteRes.status },
        );
      }
    } catch {
      // VPS unreachable or PATCH not supported on license-server; apply local override below
    }

    const updated = updateUserItem(decodedId, updates);
    setUserOverride(decodedId, updates);

    return NextResponse.json({
      item: updated || { id: decodedId, ...updates },
      message: "Cập nhật tài khoản thành công",
    });
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
  const decodedId = decodeURIComponent(id);

  if (PROTECTED_EMAILS.has(decodedId.toLowerCase())) {
    return NextResponse.json(
      { message: "Không thể xóa tài khoản Super Admin hệ thống." },
      { status: 403 },
    );
  }

  try {
    const remoteRes = await adminApiFetch(`/api/admin/users/${encodeURIComponent(decodedId)}`, {
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

  const deleted = deleteUserItem(decodedId);
  if (!deleted) {
    return NextResponse.json(
      { message: "Không tìm thấy người dùng để xóa (hoặc tài khoản được bảo vệ)." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, message: "Đã xóa người dùng" });
}
