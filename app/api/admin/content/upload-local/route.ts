import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { ADMIN_TOKEN_COOKIE, adminApiFetch } from "@/lib/admin-api";

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

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Try remote presigned upload server-side (avoids browser CORS issues)
    try {
      const sigRes = await adminApiFetch("/api/admin/content/upload-url", {
        method: "POST",
        body: JSON.stringify({ contentType: file.type, sizeBytes: file.size }),
        signal: AbortSignal.timeout(4_000),
      });
      const sig = (await sigRes.json().catch(() => ({}))) as {
        uploadUrl?: string;
        fileUrl?: string;
      };
      if (sigRes.ok && sig.uploadUrl && sig.fileUrl) {
        const putRes = await fetch(sig.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: buffer,
          signal: AbortSignal.timeout(15_000),
        });
        if (putRes.ok) {
          return NextResponse.json({ fileUrl: sig.fileUrl });
        }
      }
    } catch {
      // Fall through to local disk storage
    }

    // 2. Fallback: save directly to public/uploads/content (or base64 Data URL on read-only serverless)
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "content");
      await fs.mkdir(uploadDir, { recursive: true });

      const fileName = `banner-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
      const targetPath = path.join(uploadDir, fileName);
      await fs.writeFile(targetPath, buffer);

      return NextResponse.json({ fileUrl: `/uploads/content/${fileName}` });
    } catch {
      if (file.size <= 2 * 1024 * 1024) {
        const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
        return NextResponse.json({ fileUrl: dataUrl });
      }
      return NextResponse.json(
        { message: "Kho lưu trữ ảnh từ xa chưa phản hồi và ảnh vượt quá 2 MB cho chế độ dự phòng." },
        { status: 503 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Không thể lưu ảnh trên máy chủ." },
      { status: 500 },
    );
  }
}
