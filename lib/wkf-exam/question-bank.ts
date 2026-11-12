import fs from "node:fs";
import path from "node:path";
import rawBankJson from "@/data/wkf-exam/questions.json";
import rawAuditJson from "@/data/wkf-exam/import-report.json";
import type {
  ExamCategory,
  ImportAuditReport,
  PublicQuestionView,
  QuestionBankPayload,
  TranslationStatus,
  VerificationStatus,
  WkfQuestionRecord,
} from "./types";

declare global {
  var __ksport_wkf_bank: QuestionBankPayload | undefined;
  var __ksport_wkf_audit: ImportAuditReport | undefined;
}

function cloneBank(payload: QuestionBankPayload): QuestionBankPayload {
  return JSON.parse(JSON.stringify(payload)) as QuestionBankPayload;
}

export function getQuestionBank(): QuestionBankPayload {
  const diskPath = path.join(process.cwd(), "data", "wkf-exam", "questions.json");
  if (fs.existsSync(diskPath)) {
    try {
      const diskContent = fs.readFileSync(diskPath, "utf-8");
      return JSON.parse(diskContent) as QuestionBankPayload;
    } catch {
      // Fallback below
    }
  }

  if (!global.__ksport_wkf_bank) {
    global.__ksport_wkf_bank = cloneBank(rawBankJson as unknown as QuestionBankPayload);
  }
  return global.__ksport_wkf_bank;
}

export function getImportAuditReport(): ImportAuditReport {
  if (!global.__ksport_wkf_audit) {
    global.__ksport_wkf_audit = JSON.parse(
      JSON.stringify(rawAuditJson)
    ) as ImportAuditReport;
  }
  return global.__ksport_wkf_audit;
}

/**
 * Strips all sensitive answer-key and explanation fields before sending a question to the client.
 * Never leaks correctAnswer, rawAnswerMark, answerColor, explanationVi, or ruleReference.
 */
export function toPublicQuestion(record: WkfQuestionRecord): PublicQuestionView {
  const rawVi = record.questionVi ?? record.textVi ?? null;
  const isVerifiedVi =
    Boolean(rawVi) &&
    (record.translationStatus === "verified" ||
      (record.translationStatus === undefined && record.translationVerified));
  const translationStatus: TranslationStatus = isVerifiedVi
    ? "verified"
    : rawVi
    ? "pending_review"
    : "missing";

  return {
    id: record.id,
    category: record.category,
    questionNumber: record.questionNumber,
    textEn: record.textEn,
    questionEn: record.questionEn ?? record.textEn,
    textVi: isVerifiedVi ? rawVi : null,
    questionVi: isVerifiedVi ? rawVi : null,
    translationStatus,
    translationVerified: isVerifiedVi,
    verificationStatus: record.verificationStatus,
    questionSourceVersion: record.questionSourceVersion,
  };
}

export function getQuestionsMap(): Map<string, WkfQuestionRecord> {
  const bank = getQuestionBank();
  const map = new Map<string, WkfQuestionRecord>();
  for (const q of bank.questions) {
    map.set(q.id, q);
  }
  return map;
}

export function getQuestionById(id: string): WkfQuestionRecord | undefined {
  return getQuestionsMap().get(id);
}

/**
 * Returns only questions whose answers are verified and eligible for official grading.
 */
export function getVerifiedQuestionsByCategory(
  category: ExamCategory
): WkfQuestionRecord[] {
  const bank = getQuestionBank();
  return bank.questions.filter(
    (q) =>
      q.category === category &&
      q.verificationStatus === "verified" &&
      typeof q.correctAnswer === "boolean"
  );
}

export function getAllQuestionsByCategory(
  category?: ExamCategory
): WkfQuestionRecord[] {
  const bank = getQuestionBank();
  if (!category) return bank.questions;
  return bank.questions.filter((q) => q.category === category);
}

export type QuestionUpdateInput = {
  textVi?: string | null;
  questionVi?: string | null;
  translationStatus?: TranslationStatus;
  translationVerified?: boolean;
  explanationVi?: string | null;
  ruleReference?: string | null;
  verificationStatus?: VerificationStatus;
  correctAnswer?: boolean | null;
};

export function updateQuestionRecord(
  id: string,
  updates: QuestionUpdateInput,
  editorName: string
): WkfQuestionRecord | null {
  const bank = getQuestionBank();
  const idx = bank.questions.findIndex((q) => q.id === id);
  if (idx === -1) return null;

  const existing = bank.questions[idx];
  const now = new Date().toISOString();
  const nextVerification = updates.verificationStatus ?? existing.verificationStatus;

  const changedFields: string[] = [];
  if (updates.textVi !== undefined && updates.textVi !== existing.textVi) {
    changedFields.push("bản dịch tiếng Việt");
  }
  if (
    updates.translationVerified !== undefined &&
    updates.translationVerified !== existing.translationVerified
  ) {
    changedFields.push(
      updates.translationVerified ? "duyệt bản dịch" : "hủy duyệt bản dịch"
    );
  }
  if (
    updates.explanationVi !== undefined &&
    updates.explanationVi !== existing.explanationVi
  ) {
    changedFields.push("giải thích luật");
  }
  if (
    updates.ruleReference !== undefined &&
    updates.ruleReference !== existing.ruleReference
  ) {
    changedFields.push("điều khoản tham chiếu");
  }
  if (
    updates.correctAnswer !== undefined &&
    updates.correctAnswer !== existing.correctAnswer
  ) {
    changedFields.push(
      `đáp án (${String(existing.correctAnswer)} -> ${String(updates.correctAnswer)})`
    );
  }
  if (nextVerification !== existing.verificationStatus) {
    changedFields.push(
      `trạng thái xác minh (${existing.verificationStatus} -> ${nextVerification})`
    );
  }

  const history = [...(existing.editHistory ?? [])];
  if (changedFields.length > 0) {
    history.unshift({
      editedAt: now,
      editedBy: editorName,
      summary: `Cập nhật: ${changedFields.join(", ")}`,
      previousVerificationStatus: existing.verificationStatus,
      newVerificationStatus: nextVerification,
    });
  }

  const nextCorrectAnswer =
    updates.correctAnswer !== undefined ? updates.correctAnswer : existing.correctAnswer;

  const incomingVi =
    updates.questionVi !== undefined
      ? updates.questionVi
      : updates.textVi !== undefined
      ? updates.textVi
      : existing.textVi;
  const normalizedVi = incomingVi ? incomingVi.trim() || null : null;

  const nextTranslationVerified =
    updates.translationStatus !== undefined
      ? updates.translationStatus === "verified" && Boolean(normalizedVi)
      : updates.translationVerified !== undefined
      ? Boolean(updates.translationVerified && normalizedVi)
      : Boolean(existing.translationVerified && normalizedVi);

  const nextTranslationStatus: TranslationStatus = !normalizedVi
    ? "missing"
    : nextTranslationVerified
    ? "verified"
    : "pending_review";

  const updated: WkfQuestionRecord = {
    ...existing,
    questionEn: existing.questionEn ?? existing.textEn,
    textVi: normalizedVi,
    questionVi: normalizedVi,
    translationStatus: nextTranslationStatus,
    translationVerified: nextTranslationVerified,
    explanationVi:
      updates.explanationVi !== undefined
        ? updates.explanationVi?.trim() || null
        : existing.explanationVi,
    ruleReference:
      updates.ruleReference !== undefined
        ? updates.ruleReference?.trim() || null
        : existing.ruleReference,
    verificationStatus: nextVerification,
    correctAnswer: nextCorrectAnswer,
    rawAnswerMark:
      nextCorrectAnswer === true ? "T" : nextCorrectAnswer === false ? "F" : null,
    updatedAt: now,
    editHistory: history.slice(0, 25),
  };

  bank.questions[idx] = updated;

  // Recompute category true/false counts
  for (const cat of ["kumite", "kata"] as const) {
    const catQuestions = bank.questions.filter((q) => q.category === cat);
    bank.categories[cat].questionCount = catQuestions.length;
    bank.categories[cat].trueCount = catQuestions.filter(
      (q) => q.correctAnswer === true
    ).length;
    bank.categories[cat].falseCount = catQuestions.filter(
      (q) => q.correctAnswer === false
    ).length;
  }

  // Persist to disk when writable in development/runtime
  try {
    const filePath = path.join(process.cwd(), "data", "wkf-exam", "questions.json");
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(bank, null, 2), "utf8");
    }
  } catch {
    // Ignore read-only filesystem errors in serverless builds
  }

  return updated;
}

export function validateQuestionBankIntegrity(
  bank: QuestionBankPayload = getQuestionBank()
) {
  const kumite = bank.questions.filter((q) => q.category === "kumite");
  const kata = bank.questions.filter((q) => q.category === "kata");
  const uniqueIds = new Set(bank.questions.map((q) => q.id));

  const kumiteNumbers = new Set(kumite.map((q) => q.questionNumber));
  const kataNumbers = new Set(kata.map((q) => q.questionNumber));

  const missingKumite: number[] = [];
  for (let i = 1; i <= 246; i += 1) {
    if (!kumiteNumbers.has(i)) missingKumite.push(i);
  }

  const missingKata: number[] = [];
  for (let i = 1; i <= 132; i += 1) {
    if (!kataNumbers.has(i)) missingKata.push(i);
  }

  const foreignPattern =
    /\b(les|des|dans|pour|avec|une|sont|être|l'athlète|compétition|los|las|una|del|por|para(?!\s+karate)|está|competición)\b/i;
  const languageLeaks = bank.questions.filter((q) => foreignPattern.test(q.textEn));

  const invalidVerified = bank.questions.filter(
    (q) => q.verificationStatus === "verified" && typeof q.correctAnswer !== "boolean"
  );

  return {
    isValid:
      bank.questions.length === 378 &&
      kumite.length === 246 &&
      kata.length === 132 &&
      uniqueIds.size === 378 &&
      missingKumite.length === 0 &&
      missingKata.length === 0 &&
      languageLeaks.length === 0 &&
      invalidVerified.length === 0,
    totalCount: bank.questions.length,
    kumiteCount: kumite.length,
    kataCount: kata.length,
    uniqueIdsCount: uniqueIds.size,
    missingKumite,
    missingKata,
    languageLeaksCount: languageLeaks.length,
    invalidVerifiedCount: invalidVerified.length,
    verifiedCount: bank.questions.filter((q) => q.verificationStatus === "verified")
      .length,
    unverifiedCount: bank.questions.filter(
      (q) => q.verificationStatus !== "verified"
    ).length,
  };
}

