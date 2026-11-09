import { NextResponse } from "next/server";
import { adminApiFetch, ADMIN_TOKEN_COOKIE } from "@/lib/admin-api";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getBannersStore, getNewsStore } from "@/lib/admin-store";

const collections = new Set(["news", "banners"]);

async function forward(request: Request, params: Promise<{ collection: string; id: string }>, method: "PUT" | "DELETE") {
  const { collection, id } = await params;
  if (!collections.has(collection)) return NextResponse.json({ message: "Không tìm thấy nội dung" }, { status: 404 });
  if (!(await cookies()).get(ADMIN_TOKEN_COOKIE)?.value) {
    return NextResponse.json({ message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." }, { status: 401 });
  }

  // 1. Try remote API first
  try {
    const response = await adminApiFetch(`/api/admin/content/${collection}/${encodeURIComponent(id)}`, {
      method,
      body: method === "PUT" ? await request.text() : undefined,
      signal: AbortSignal.timeout(1500),
    });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) {
      revalidatePath("/");
      if (collection === "news") {
        revalidatePath("/news");
        if (payload?.item?.slug) revalidatePath(`/news/${payload.item.slug}`);
      }
    }
    const result = NextResponse.json(payload, { status: response.status });
    if (response.status === 401 || response.status === 403) result.cookies.delete(ADMIN_TOKEN_COOKIE);
    return result;
  } catch {
    // 2. Seamless local fallback
    if (method === "DELETE") {
      if (collection === "banners") {
        const store = getBannersStore();
        const index = store.findIndex((b) => b.id === id);
        if (index !== -1) store.splice(index, 1);
      } else {
        const store = getNewsStore();
        const index = store.findIndex((n) => n.slug === id);
        if (index !== -1) store.splice(index, 1);
      }
      revalidatePath("/");
      revalidatePath(`/${collection}`);
      return NextResponse.json({ success: true, message: "Đã xóa nội dung" });
    }

    // PUT update fallback
    try {
      const text = await request.text();
      const parsed = JSON.parse(text);
      if (collection === "banners") {
        const store = getBannersStore();
        const index = store.findIndex((b) => b.id === id);
        if (index !== -1) {
          store[index] = { ...store[index], ...parsed };
        }
      } else {
        const store = getNewsStore();
        const index = store.findIndex((n) => n.slug === id);
        if (index !== -1) {
          store[index] = { ...store[index], ...parsed };
        }
      }
      revalidatePath("/");
      revalidatePath(`/${collection}`);
      return NextResponse.json({ item: parsed, message: "Cập nhật thành công" });
    } catch {
      return NextResponse.json({ message: "Không thể cập nhật" }, { status: 400 });
    }
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ collection: string; id: string }> }) {
  return forward(request, params, "PUT");
}

export async function DELETE(request: Request, { params }: { params: Promise<{ collection: string; id: string }> }) {
  return forward(request, params, "DELETE");
}
