import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminApiFetch, ADMIN_TOKEN_COOKIE } from "@/lib/admin-api";

export async function POST(request: Request) {
  if (!(await cookies()).get(ADMIN_TOKEN_COOKIE)?.value) {
    return NextResponse.json(
      { message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." },
      { status: 401 }
    );
  }

  try {
    const response = await adminApiFetch("/api/admin/content/upload-url", {
      method: "POST",
      body: await request.text(),
    });
    const payload = await response.json().catch(() => ({}));
    const result = NextResponse.json(payload, { status: response.status });
    if (response.status === 401 || response.status === 403) {
      result.cookies.delete(ADMIN_TOKEN_COOKIE);
    }
    return result;
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Không thể kết nối máy chủ ảnh" },
      { status: 503 }
    );
  }
}
