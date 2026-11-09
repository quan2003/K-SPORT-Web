import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_TOKEN_COOKIE } from "@/lib/admin-api";
import { getSponsorsStore, addSponsorItem, SponsorItem } from "@/lib/admin-store";
import { revalidatePath } from "next/cache";

export async function GET() {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: "Phiên đăng nhập hết hạn" }, { status: 401 });
  }

  const items = getSponsorsStore();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: "Phiên đăng nhập hết hạn" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<SponsorItem>;
    if (!body.name || !body.category) {
      return NextResponse.json({ message: "Vui lòng nhập tên nhà tài trợ và danh mục" }, { status: 400 });
    }

    const newItem = addSponsorItem({
      name: body.name.trim(),
      category: body.category.trim(),
      tier: body.tier || "equipment",
      logo: body.logo || "/images/karate-venue.png",
      website: body.website || "https://k-sport.net",
      description: body.description || "",
      placements: body.placements && body.placements.length > 0 ? body.placements : ["home", "footer"],
      isActive: body.isActive !== undefined ? body.isActive : true,
      order: body.order || 1,
      contactPerson: body.contactPerson,
      contractDate: body.contractDate || new Date().toISOString().slice(0, 10),
    });

    revalidatePath("/");
    revalidatePath("/events");

    return NextResponse.json({ item: newItem, message: "Thêm nhà tài trợ thành công" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Lỗi xử lý" }, { status: 500 });
  }
}

