import { NextResponse } from "next/server";
import {
  submitClubAthletes,
  type RegistrationAthletePayload,
} from "@/lib/registration-supabase";

type SubmitBody = {
  tournamentId?: string;
  tournamentName?: string;
  startTime?: string;
  endTime?: string;
  clubName?: string;
  clubId?: string;
  teamLeaderName?: string;
  coachName?: string;
  additionalCoaches?: string[];
  athletes?: RegistrationAthletePayload[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitBody;

    if (!body.tournamentId || !body.tournamentName) {
      return NextResponse.json(
        { message: "Thiếu thông tin giải đấu." },
        { status: 400 },
      );
    }

    const now = Date.now();
    if (body.startTime) {
      const start = Date.parse(body.startTime);
      if (!Number.isNaN(start) && now < start) {
        return NextResponse.json(
          { message: "Hệ thống chưa đến thời gian mở đăng ký cho giải đấu này." },
          { status: 403 },
        );
      }
    }
    if (body.endTime) {
      const end = Date.parse(body.endTime);
      if (!Number.isNaN(end) && now > end) {
        return NextResponse.json(
          { message: "Đã hết hạn đăng ký trực tuyến cho giải đấu này." },
          { status: 403 },
        );
      }
    }

    const clubName = String(body.clubName || "").trim();
    if (!clubName) {
      return NextResponse.json(
        { message: "Vui lòng nhập tên Câu lạc bộ / Đoàn." },
        { status: 400 },
      );
    }

    const athletes = Array.isArray(body.athletes) ? body.athletes : [];
    if (athletes.length === 0) {
      return NextResponse.json(
        { message: "Vui lòng thêm ít nhất 1 Vận động viên trước khi nộp." },
        { status: 400 },
      );
    }

    const result = await submitClubAthletes({
      tournamentId: body.tournamentId,
      tournamentName: body.tournamentName,
      clubName,
      clubId: body.clubId || crypto.randomUUID(),
      teamLeaderName: String(body.teamLeaderName || ""),
      coachName: String(body.coachName || ""),
      additionalCoaches: Array.isArray(body.additionalCoaches)
        ? body.additionalCoaches.map((s) => String(s).trim()).filter(Boolean)
        : [],
      athletes,
    });

    if (!result.ok) {
      return NextResponse.json(
        { message: result.error || "Không thể nộp danh sách lên máy chủ." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      localTime: result.localTime,
      message: "Đã nộp danh sách VĐV trực tiếp cho Ban Tổ Chức.",
    });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Lỗi xử lý dữ liệu." },
      { status: 500 },
    );
  }
}

