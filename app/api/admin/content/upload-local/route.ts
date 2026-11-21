import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { ADMIN_TOKEN_COOKIE } from "@/lib/admin-api";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await cookies()).get(ADMIN_TOKEN_COOKIE)?.value) {
    return NextResponse.json(
      { message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." },
      { status: 401 },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Không tìm thấy tệp ảnh tải lên." }, { status: 400 });
    }

    const ext = MIME_TO_EXT[file.type];
    if (!ext) {
      return NextResponse.json({ message: "Chỉ nhận ảnh JPG, PNG hoặc WebP." }, { status: 400 });
    }

    if (file.size < 1 || file.size > MAX_BYTES) {
      return NextResponse.json({ message: "Dung lượng ảnh tối đa 8 MB." }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "content");
    await fs.mkdir(uploadDir, { recursive: true });

    const fileName = `banner-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
    const targetPath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(targetPath, buffer);

    return NextResponse.json({ fileUrl: `/uploads/content/${fileName}` });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Không thể lưu ảnh trên máy chủ." },
      { status: 500 },
    );
  }
}

