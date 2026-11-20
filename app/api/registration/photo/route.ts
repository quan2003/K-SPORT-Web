import { NextResponse } from "next/server";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

function resolveApiBase(): string {
  const publicUrl = process.env.KSPORT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
  if (publicUrl) return publicUrl.replace(/\/api\/public$/, "");
  const adminUrl = process.env.KSPORT_ADMIN_API_URL?.replace(/\/$/, "") || "";
  if (adminUrl) return adminUrl;
  return "https://api.k-sport.net";
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const athleteId = String(form.get("athleteId") || "").trim();
    const tournamentId = String(form.get("tournamentId") || "").trim();
    const clubId = String(form.get("clubId") || "").trim();

    if (!(file instanceof File) || !athleteId || !tournamentId || !clubId) {
      return NextResponse.json(
        { message: "Thiếu thông tin ảnh thẻ hoặc mã định danh VĐV." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: "Ảnh thẻ phải là JPG, PNG hoặc WebP." },
        { status: 400 },
      );
    }

    if (file.size < 1 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { message: "Ảnh thẻ không được vượt quá 5 MB." },
        { status: 400 },
      );
    }

    const apiBase = resolveApiBase();
    const sigRes = await fetch(
      `${apiBase}/api/public/registration/athletes/${encodeURIComponent(athleteId)}/photo-upload-url`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId,
          clubId,
          contentType: file.type,
          sizeBytes: file.size,
        }),
        signal: AbortSignal.timeout(8_000),
      },
    );

    const sig = (await sigRes.json().catch(() => ({}))) as {
      uploadUrl?: string;
      objectKey?: string;
      message?: string;
    };
    if (!sigRes.ok || !sig.uploadUrl || !sig.objectKey) {
      return NextResponse.json(
        { message: sig.message || "Máy chủ chưa hỗ trợ lưu ảnh thẻ cho giải này." },
        { status: 502 },
      );
    }

    const putRes = await fetch(sig.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: await file.arrayBuffer(),
      signal: AbortSignal.timeout(15_000),
    });
    if (!putRes.ok) {
      return NextResponse.json(
        { message: "Không thể tải ảnh thẻ lên kho lưu trữ." },
        { status: 502 },
      );
    }

    const completeRes = await fetch(
      `${apiBase}/api/public/registration/athletes/${encodeURIComponent(athleteId)}/photo-complete`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId,
          clubId,
          objectKey: sig.objectKey,
          contentType: file.type,
          sizeBytes: file.size,
        }),
        signal: AbortSignal.timeout(8_000),
      },
    );

    const completed = await completeRes.json().catch(() => ({}));
    if (!completeRes.ok) {
      return NextResponse.json(
        { message: (completed as { message?: string }).message || "Không thể xác nhận ảnh thẻ." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, completed });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Lỗi tải ảnh thẻ." },
      { status: 500 },
    );
  }
}

