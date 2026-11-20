import { NextResponse } from "next/server";
import { adminApiFetch, ADMIN_TOKEN_COOKIE } from "@/lib/admin-api";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getBannersStore, getNewsStore } from "@/lib/admin-store";
import { getBanners, getNews } from "@/lib/public-data";

const collections = new Set(["news", "banners"]);

async function getPublicFallbackItems(collection: string) {
  if (collection === "banners") {
    const items = await getBanners().catch(() => []);
    return items.map((b) => ({
      ...b,
      isPublished: true,
      imageUrl: b.image,
    }));
  }
  const items = await getNews().catch(() => []);
  return items.map((n) => ({
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

  const bodyText = method === "POST" ? await request.text() : "";

  // 1. Try remote API first with a fast timeout if configured
  try {
    const response = await adminApiFetch(`/api/admin/content/${collection}`, {
      method,
      body: method === "POST" ? bodyText : undefined,
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) {
      throw new Error(`Remote API returned status ${response.status}`);
    }
    const payload = await response.json().catch(() => ({}));
    if (method === "POST") {
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
    // 2. Public API fallback (never serve mock data)
    if (method === "GET") {
      const items = await getPublicFallbackItems(collection);
      return NextResponse.json({ items });
    }
    // POST creation fallback
    try {
      const parsed = JSON.parse(bodyText || "{}");
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
