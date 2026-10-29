import { NextResponse } from "next/server";
import { adminApiFetch, ADMIN_TOKEN_COOKIE } from "@/lib/admin-api";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const collections = new Set(["news", "banners"]);
async function forward(request: Request, params: Promise<{ collection: string; id: string }>, method: "PUT" | "DELETE") {
  const { collection, id } = await params;
  if (!collections.has(collection)) return NextResponse.json({ message: "Không tìm thấy nội dung" }, { status: 404 });
  if (!(await cookies()).get(ADMIN_TOKEN_COOKIE)?.value) {
    return NextResponse.json({ message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." }, { status: 401 });
  }
  try {
    const response = await adminApiFetch(`/api/admin/content/${collection}/${encodeURIComponent(id)}`, { method, body: method === "PUT" ? await request.text() : undefined });
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
  } catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : "Không thể kết nối API quản trị" }, { status: 503 }); }
}
export async function PUT(request: Request, { params }: { params: Promise<{ collection: string; id: string }> }) { return forward(request, params, "PUT"); }
export async function DELETE(request: Request, { params }: { params: Promise<{ collection: string; id: string }> }) { return forward(request, params, "DELETE"); }
