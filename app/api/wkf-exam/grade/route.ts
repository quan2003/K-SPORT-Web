import { NextResponse } from "next/server";
import { getPublicSession } from "@/lib/auth";
import { submitAttemptOnServer } from "@/lib/wkf-exam/attempt-service";
import type {
  AttemptAnswerEntry,
  ExamCategory,
  ExamLanguage,
  ExamMode,
  QuestionCountOption,
} from "@/lib/wkf-exam/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      attemptId?: unknown;
      ownerId?: unknown;
      category?: unknown;
      mode?: unknown;
      language?: unknown;
      requestedCount?: unknown;
      timeLimitMinutes?: unknown;
      questionIds?: unknown;
      answers?: unknown;
      flaggedQuestionIds?: unknown;
      startedAt?: unknown;
    };

    const attemptId =
      typeof body.attemptId === "string" ? body.attemptId.trim() : "";
    if (!attemptId) {
      return NextResponse.json(
        { error: "Thiếu mã lượt thi (attemptId)." },
        { status: 400 }
      );
    }

    const questionIds = Array.isArray(body.questionIds)
      ? body.questionIds.filter((id): id is string => typeof id === "string")
      : [];

    if (questionIds.length === 0) {
      return NextResponse.json(
        { error: "Danh sách câu hỏi nộp bài không được để trống." },
        { status: 400 }
      );
    }

    const rawAnswers =
      body.answers && typeof body.answers === "object"
        ? (body.answers as Record<string, unknown>)
        : {};

    const sanitizedAnswers: Record<string, AttemptAnswerEntry> = {};
    for (const [qId, val] of Object.entries(rawAnswers)) {
      if (val && typeof val === "object") {
        const entry = val as {
          selectedAnswer?: unknown;
          answeredAt?: unknown;
        };
        if (typeof entry.selectedAnswer === "boolean") {
          sanitizedAnswers[qId] = {
            selectedAnswer: entry.selectedAnswer,
            answeredAt:
              typeof entry.answeredAt === "string"
                ? entry.answeredAt
                : new Date().toISOString(),
          };
        }
      }
    }

    const session = await getPublicSession();
    const ownerId =
      session?.userId ||
      (typeof body.ownerId === "string" && body.ownerId.trim()
        ? body.ownerId.trim().slice(0, 80)
        : "anon-default");

    const category: ExamCategory | "mixed" =
      body.category === "kata" || body.category === "mixed"
        ? body.category
        : "kumite";

    const mode: ExamMode =
      body.mode === "exam" || body.mode === "mistakes"
        ? body.mode
        : "practice";

    const requestedCount: QuestionCountOption =
      body.requestedCount === 20 ||
      body.requestedCount === 50 ||
      body.requestedCount === 100
        ? body.requestedCount
        : "all";

    const language: ExamLanguage | undefined =
      body.language === "en" || body.language === "vi"
        ? body.language
        : undefined;

    const completedAttempt = submitAttemptOnServer({
      attemptId,
      ownerId,
      isAuthenticated: Boolean(session),
      category,
      mode,
      language,
      requestedCount,
      timeLimitMinutes:
        typeof body.timeLimitMinutes === "number"
          ? body.timeLimitMinutes
          : null,
      questionIds,
      answers: sanitizedAnswers,
      flaggedQuestionIds: Array.isArray(body.flaggedQuestionIds)
        ? body.flaggedQuestionIds.filter(
            (id): id is string => typeof id === "string"
          )
        : [],
      startedAt:
        typeof body.startedAt === "string"
          ? body.startedAt
          : new Date().toISOString(),
    });

    return NextResponse.json({
      attempt: completedAttempt,
      result: completedAttempt.result,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Không thể chấm điểm lượt thi.",
      },
      { status: 400 }
    );
  }
}

