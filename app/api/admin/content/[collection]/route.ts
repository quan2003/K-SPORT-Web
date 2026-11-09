import { NextResponse } from "next/server";
import { adminApiFetch, ADMIN_TOKEN_COOKIE } from "@/lib/admin-api";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getBannersStore, getNewsStore } from "@/lib/admin-store";

const collections = new Set(["news", "banners"]);

function getLocalItems(collection: string) {
  if (collection === "banners") {
    return getBannersStore().map((b) => ({
      ...b,
      isPublished: true,
      imageUrl: b.image,
    }));
  }
  return getNewsStore().map((n) => ({
    ...n,
    id: n.slug,
    isPublished: true,
    imageUrl: n.image,
  }));
}

async function forward(request: Request, params: Promise<{ collection: string }>, method: "GET" | "POST") {
  const { collection } = await params;
  if (!collections.has(collection)) return NextResponse.json({ message: "Không tìm thấy nội dung" }, { status: 404 });
  if (!(await cookies()).get(ADMIN_TOKEN_COOKIE)?.value) {
    return NextResponse.json({ message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." }, { status: 401 });
  }

  // 1. Try remote API first with a fast timeout
  try {
    const response = await adminApiFetch(`/api/admin/content/${collection}`, {
      method,
      body: method === "POST" ? await request.text() : undefined,
      signal: AbortSignal.timeout(1500),
    });
    const payload = await response.json().catch(() => ({}));
    if (response.ok && method === "POST") {
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
    if (method === "GET") {
      const items = getLocalItems(collection);
      return NextResponse.json({ items });
    }
    // POST creation fallback
    try {
      const text = await request.text();
      const parsed = JSON.parse(text);
      const newItem = {
        ...parsed,
        id: parsed.id || `${collection}-${Date.now().toString(36)}`,
        isPublished: parsed.isPublished ?? true,
      };
      if (collection === "banners") {
        const store = getBannersStore();
        store.push({
          id: newItem.id,
          eyebrow: newItem.eyebrow || "GIẢI ĐẤU KARATE",
          title: newItem.title,
          description: newItem.description || "",
          image: newItem.imageUrl || newItem.image || "/images/karate-hero.png",
          primaryLabel: newItem.primaryLabel || "Xem chi tiết",
          primaryHref: newItem.primaryHref || "/events",
          secondaryLabel: newItem.secondaryLabel || "Khám phá",
          secondaryHref: newItem.secondaryHref || "/schedule",
          position: store.length + 1,
        });
      } else {
        const store = getNewsStore();
        store.unshift({
          slug: newItem.slug || `tin-tuc-${Date.now().toString(36)}`,
          title: newItem.title,
          category: newItem.category || "Tin tức",
          publishedAt: newItem.publishedAt || new Date().toISOString(),
          summary: newItem.summary || "",
          image: newItem.imageUrl || newItem.image || "/images/karate-venue.png",
          body: Array.isArray(newItem.body) ? newItem.body : [String(newItem.body || "")],
        });
      }
      revalidatePath("/");
      revalidatePath(`/${collection}`);
      return NextResponse.json({ item: newItem, message: "Lưu nội dung thành công" });
    } catch {
      return NextResponse.json({ message: "Không thể lưu nội dung" }, { status: 400 });
    }
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ collection: string }> }) {
  return forward(request, params, "GET");
}

export async function POST(request: Request, { params }: { params: Promise<{ collection: string }> }) {
  return forward(request, params, "POST");
}
