import { NextResponse } from "next/server";
import { getPublicSession } from "@/lib/auth";
import { recordPracticeAnswerOnServer } from "@/lib/wkf-exam/attempt-service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      attemptId?: unknown;
      ownerId?: unknown;
      mode?: unknown;
      questionId?: unknown;
      selectedAnswer?: unknown;
    };

    if (body.mode === "exam") {
      return NextResponse.json(
        {
          error:
            "Chế độ Thi thử không được phép xem đáp án đúng trước khi nộp bài.",
        },
        { status: 403 }
      );
    }

    const questionId =
      typeof body.questionId === "string" ? body.questionId.trim() : "";
    if (!questionId) {
      return NextResponse.json(
        { error: "Thiếu mã câu hỏi cần kiểm tra." },
        { status: 400 }
      );
    }

    if (typeof body.selectedAnswer !== "boolean") {
      return NextResponse.json(
        { error: "Lựa chọn trả lời phải là Đúng (true) hoặc Sai (false)." },
        { status: 400 }
      );
    }

    const session = await getPublicSession();
    const ownerId =
      session?.userId ||
      (typeof body.ownerId === "string" && body.ownerId.trim()
        ? body.ownerId.trim().slice(0, 80)
        : "anon-default");

    const { feedback, alreadyGraded } = recordPracticeAnswerOnServer({
      attemptId:
        typeof body.attemptId === "string" ? body.attemptId.trim() : undefined,
      ownerId,
      questionId,
      selectedAnswer: body.selectedAnswer,
    });

    return NextResponse.json({
      feedback,
      alreadyGraded,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Không thể kiểm tra câu trả lời.";
    const status = message.includes("Thi thử") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

