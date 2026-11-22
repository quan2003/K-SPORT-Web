import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_TOKEN_COOKIE, adminApiFetch } from "@/lib/admin-api";
import { getUsersStore, addUserItem, getUserOverrides, AdminUserItem } from "@/lib/admin-store";
import { getPublicSession } from "@/lib/auth";
import { listSafeUsers } from "@/lib/user-store";
import { createSupabaseUser, listSupabaseUsers } from "@/lib/supabase-users";

const SUPER_ADMIN_EMAILS = new Set(["luuquan232003@gmail.com", "luuquankarate@gmail.com"]);

function mapRole(rawRoleValue: unknown, emailValue: string, nameValue: string): AdminUserItem["role"] {
  const emailLower = emailValue.trim().toLowerCase();
  const nameLower = nameValue.trim().toLowerCase();
  const rawRole = String(rawRoleValue || "").trim().toLowerCase();

  if (
    rawRole === "admin" ||
    rawRole === "superadmin" ||
    rawRole === "super_admin" ||
    SUPER_ADMIN_EMAILS.has(emailLower) ||
    nameLower.includes("super admin")
  ) {
    return "admin";
  }
  if (rawRole === "btc") return "btc";
  if (rawRole === "editor") return "editor";
  if (["user", "viewer", "learner", "referee"].includes(rawRole)) return "user";
  return "editor";
}

export async function GET() {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Phiên đăng nhập hết hạn" }, { status: 401 });

  const session = await getPublicSession();
  if (session?.role === "btc") {
    return NextResponse.json({ message: "Khu vực giới hạn cho Quản trị viên" }, { status: 403 });
  }

  const overrides = getUserOverrides();
  const merged: AdminUserItem[] = [];
  const seenEmails = new Set<string>();

  // 1. Load persistent Supabase admin_accounts first (takes precedence for edits/roles/passwords)
  const supabaseUsers = await listSupabaseUsers();
  for (const su of supabaseUsers) {
    const emailLower = su.email.toLowerCase();
    const mapped: AdminUserItem = {
      ...su,
      role: mapRole(su.role, su.email, su.name),
    };
    merged.push(mapped);
    if (emailLower) seenEmails.add(emailLower);
  }

  // 2. Try real VPS admin users API
  try {
    const remoteRes = await adminApiFetch("/api/admin/users", {
      signal: AbortSignal.timeout(3_000),
    });
    if (remoteRes.ok) {
      const payload = (await remoteRes.json().catch(() => ({}))) as Record<string, unknown>;
      const rawUsers = (
        Array.isArray(payload.users)
          ? payload.users
          : Array.isArray(payload.items)
            ? payload.items
            : Array.isArray(payload.data)
              ? payload.data
              : []
      ) as Record<string, unknown>[];

      rawUsers.forEach((u, idx) => {
        const email = String(u.email || "");
        const emailLower = email.toLowerCase();
        if (emailLower && seenEmails.has(emailLower)) return;
        const name = String(u.name || u.fullName || u.username || "Người dùng");
        const id = String(u.id || u._id || email || `remote-${idx}`);
        const base: AdminUserItem = {
          id,
          username: String(u.username || email || `user-${idx}`),
          name,
          email,
          role: mapRole(u.role, email, name),
          assignedTournament: u.assignedTournament ? String(u.assignedTournament) : undefined,
          lastActive: String(u.lastActive || u.updatedAt || u.created_at || "Đã đồng bộ VPS"),
          status: u.isActive === false || u.status === "Tạm khóa" ? "Tạm khóa" : "Hoạt động",
        };
        const ov = overrides[id] || overrides[email];
        merged.push(ov ? { ...base, ...ov } : base);
        if (emailLower) seenEmails.add(emailLower);
      });
    }
  } catch {
    // VPS unreachable, continue with local users
  }

  // 3. Include web registered / normal users from user-store
  for (const wu of listSafeUsers()) {
    const emailLower = wu.email.toLowerCase();
    if (seenEmails.has(emailLower)) continue;
    const base: AdminUserItem = {
      id: wu.id,
      username: wu.email,
      name: wu.name,
      email: wu.email,
      role: mapRole(wu.role, wu.email, wu.name),
      lastActive: wu.lastLoginAt || wu.createdAt,
      status: "Hoạt động",
    };
    const ov = overrides[wu.id] || overrides[wu.email];
    merged.push(ov ? { ...base, ...ov } : base);
    seenEmails.add(emailLower);
  }

  // 4. Include locally created admin users
  for (const lu of getUsersStore()) {
    if (seenEmails.has(lu.email.toLowerCase())) continue;
    const ov = overrides[lu.id];
    merged.push(ov ? { ...lu, ...ov } : lu);
  }

  return NextResponse.json({ items: merged });
}

export async function POST(request: Request) {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Phiên đăng nhập hết hạn" }, { status: 401 });

  const session = await getPublicSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ message: "Chỉ Quản trị viên tối cao mới có quyền tạo người dùng" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Partial<AdminUserItem> & { password?: string };
    if (!body.username || !body.name) {
      return NextResponse.json({ message: "Vui lòng nhập tên đăng nhập và họ tên" }, { status: 400 });
    }

    const email = (body.email?.trim() || `${body.username.trim()}@k-sport.net`).toLowerCase();
    const username = body.username.trim().toLowerCase();
    const role = body.role || "btc";

    // Persist in Supabase admin_accounts first so account & password work across Vercel serverless
    const sbResult = await createSupabaseUser({
      username,
      name: body.name.trim(),
      email,
      role,
      assignedTournament: body.assignedTournament?.trim() || undefined,
      status: body.status || "Hoạt động",
      password: body.password || "Ksport!Btc2026",
    });

    if (sbResult.item) {
      return NextResponse.json({ item: sbResult.item, message: "Thêm người dùng thành công" }, { status: 201 });
    }

    try {
      const remoteRes = await adminApiFetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4_000),
      });
      const remotePayload = await remoteRes.json().catch(() => ({}));
      if (remoteRes.ok) {
        return NextResponse.json(
          { item: remotePayload.user || remotePayload.item || body, message: remotePayload.message || "Thêm người dùng thành công" },
          { status: 201 },
        );
      }
      if (remoteRes.status !== 404) {
        return NextResponse.json(
          { message: remotePayload.message || `Không thể tạo tài khoản trên máy chủ (${remoteRes.status})` },
          { status: remoteRes.status },
        );
      }
    } catch {
      // VPS unreachable, fall back to local store
    }

    const newItem = addUserItem({
      username,
      name: body.name.trim(),
      email,
      role,
      assignedTournament: body.assignedTournament?.trim() || undefined,
      status: body.status || "Hoạt động",
    });

    return NextResponse.json({ item: newItem, message: "Thêm người dùng thành công" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Lỗi xử lý" }, { status: 500 });
  }
}
