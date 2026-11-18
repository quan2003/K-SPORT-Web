import { NextResponse } from "next/server";
import { getPublicSession } from "@/lib/auth";
import {
  getImportAuditReport,
  getQuestionBank,
  updateQuestionRecord,
  validateQuestionBankIntegrity,
} from "@/lib/wkf-exam/question-bank";
import type { VerificationStatus } from "@/lib/wkf-exam/types";

async function requireAdminSession() {
  const session = await getPublicSession();
  if (!session || (session.role !== "admin" && session.role !== "editor")) {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Truy cập bị từ chối. Yêu cầu quyền Quản trị viên K-SPORT." },
      { status: 401 }
    );
  }

  const bank = getQuestionBank();
  const auditReport = getImportAuditReport();
  const integrity = validateQuestionBankIntegrity(bank);

  return NextResponse.json({
    bank,
    auditReport,
    integrity,
  });
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Truy cập bị từ chối. Yêu cầu quyền Quản trị viên K-SPORT." },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      id?: unknown;
      textVi?: unknown;
      translationVerified?: unknown;
      explanationVi?: unknown;
      ruleReference?: unknown;
      verificationStatus?: unknown;
      correctAnswer?: unknown;
    };

    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id) {
      return NextResponse.json(
        { error: "Thiếu mã câu hỏi (id)." },
        { status: 400 }
      );
    }

    const validStatuses = new Set<VerificationStatus>([
      "verified",
      "needs_review",
      "unverified",
    ]);

    const verificationStatus =
      typeof body.verificationStatus === "string" &&
      validStatuses.has(body.verificationStatus as VerificationStatus)
        ? (body.verificationStatus as VerificationStatus)
        : undefined;

    const updated = updateQuestionRecord(
      id,
      {
        textVi:
          body.textVi === null || typeof body.textVi === "string"
            ? body.textVi
            : undefined,
        translationVerified:
          typeof body.translationVerified === "boolean"
            ? body.translationVerified
            : undefined,
        explanationVi:
          body.explanationVi === null || typeof body.explanationVi === "string"
            ? body.explanationVi
            : undefined,
        ruleReference:
          body.ruleReference === null || typeof body.ruleReference === "string"
            ? body.ruleReference
            : undefined,
        verificationStatus,
        correctAnswer:
          body.correctAnswer === null || typeof body.correctAnswer === "boolean"
            ? body.correctAnswer
            : undefined,
      },
      session.name
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Không tìm thấy câu hỏi cần cập nhật." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      question: updated,
      integrity: validateQuestionBankIntegrity(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Lỗi khi cập nhật câu hỏi WKF.",
      },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Truy cập bị từ chối. Yêu cầu quyền Quản trị viên K-SPORT." },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      action?: unknown;
      bankVersion?: unknown;
      updates?: Array<{
        id: string;
        textVi?: string | null;
        translationVerified?: boolean;
        explanationVi?: string | null;
        ruleReference?: string | null;
      }>;
    };

    const bank = getQuestionBank();
    if (body.action === "update_version" && typeof body.bankVersion === "string" && body.bankVersion.trim()) {
      bank.bankVersion = body.bankVersion.trim();
      return NextResponse.json({
        bankVersion: bank.bankVersion,
        integrity: validateQuestionBankIntegrity(bank),
      });
    }

    if (body.action === "batch_update" && Array.isArray(body.updates)) {
      let updatedCount = 0;
      for (const item of body.updates) {
        if (item && typeof item.id === "string") {
          const res = updateQuestionRecord(item.id, item, session.name);
          if (res) updatedCount += 1;
        }
      }
      return NextResponse.json({
        updatedCount,
        integrity: validateQuestionBankIntegrity(bank),
      });
    }

    return NextResponse.json(
      { error: "Hành động quản trị không hợp lệ." },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Lỗi khi xử lý tác vụ quản trị.",
      },
      { status: 400 }
    );
  }
}

