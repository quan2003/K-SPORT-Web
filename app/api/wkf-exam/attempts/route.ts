import { NextResponse } from "next/server";
import { getPublicSession } from "@/lib/auth";
import {
  createExamAttempt,
  getOwnerAttempts,
  getOwnerMistakes,
} from "@/lib/wkf-exam/attempt-service";
import type {
  ExamCategory,
  ExamLanguage,
  ExamMode,
  QuestionCountOption,
} from "@/lib/wkf-exam/types";

const VALID_CATEGORIES = new Set(["kumite", "kata", "mixed"]);
const VALID_MODES = new Set(["practice", "exam", "mistakes"]);
const VALID_COUNTS = new Set([20, 50, 100, "all"]);

export async function GET(request: Request) {
  try {
    const session = await getPublicSession();
    const { searchParams } = new URL(request.url);
    const anonOwnerId = searchParams.get("ownerId")?.trim();
    const ownerId = session?.userId || anonOwnerId || "";

    if (!ownerId) {
      return NextResponse.json({
        isAuthenticated: false,
        attempts: [],
        mistakes: [],
      });
    }

    return NextResponse.json({
      isAuthenticated: Boolean(session),
      user: session
        ? { userId: session.userId, name: session.name, role: session.role }
        : null,
      attempts: getOwnerAttempts(ownerId),
      mistakes: getOwnerMistakes(ownerId),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi máy chủ khi tải lịch sử." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      ownerId?: unknown;
      category?: unknown;
      mode?: unknown;
      language?: unknown;
      requestedCount?: unknown;
      timeLimitMinutes?: unknown;
      previousAttemptId?: unknown;
      previousOrderIds?: unknown;
      customQuestionIdsPool?: unknown;
    };

    const category = String(body.category || "") as ExamCategory | "mixed";
    const mode = String(body.mode || "") as ExamMode;
    const language: ExamLanguage | undefined =
      body.language === "en" || body.language === "vi"
        ? body.language
        : undefined;
    const rawCount = body.requestedCount;
    const requestedCount: QuestionCountOption =
      rawCount === "all"
        ? "all"
        : typeof rawCount === "number" && VALID_COUNTS.has(rawCount)
        ? (rawCount as QuestionCountOption)
        : 20;

    if (!VALID_CATEGORIES.has(category)) {
      return NextResponse.json(
        { error: "Bộ đề không hợp lệ. Chỉ chấp nhận kumite, kata hoặc mixed." },
        { status: 400 }
      );
    }

    if (!VALID_MODES.has(mode)) {
      return NextResponse.json(
        { error: "Chế độ làm bài không hợp lệ." },
        { status: 400 }
      );
    }

    const session = await getPublicSession();
    const clientOwnerId =
      typeof body.ownerId === "string" && body.ownerId.trim()
        ? body.ownerId.trim().slice(0, 80)
        : "anon-default";
    const ownerId = session?.userId || clientOwnerId;

    const previousOrderIds = Array.isArray(body.previousOrderIds)
      ? body.previousOrderIds.filter((id): id is string => typeof id === "string")
      : undefined;

    const customQuestionIdsPool = Array.isArray(body.customQuestionIdsPool)
      ? body.customQuestionIdsPool.filter(
          (id): id is string => typeof id === "string"
        )
      : undefined;

    const timeLimitMinutes =
      typeof body.timeLimitMinutes === "number" && body.timeLimitMinutes > 0
        ? body.timeLimitMinutes
        : null;

    const attempt = createExamAttempt({
      ownerId,
      isAuthenticated: Boolean(session),
      category,
      mode,
      language,
      requestedCount,
      timeLimitMinutes,
      previousAttemptId:
        typeof body.previousAttemptId === "string"
          ? body.previousAttemptId
          : null,
      previousOrderIds,
      customQuestionIdsPool,
    });

    return NextResponse.json({ attempt }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Không thể khởi tạo lượt làm bài mới.",
      },
      { status: 400 }
    );
  }
}

