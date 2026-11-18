import crypto from "node:crypto";
import { checkPracticeAnswer, gradeAttempt } from "./grading";
import {
  getQuestionBank,
  getQuestionsMap,
  getVerifiedQuestionsByCategory,
  toPublicQuestion,
} from "./question-bank";
import { selectAndShuffleQuestions } from "./shuffle";
import type {
  AttemptAnswerEntry,
  ExamAttempt,
  ExamCategory,
  ExamLanguage,
  ExamMode,
  MistakeRecord,
  PracticeAnswerCheckResult,
  QuestionCountOption,
} from "./types";

declare global {
  var __ksport_wkf_attempts: Map<string, ExamAttempt> | undefined;
  var __ksport_wkf_mistakes: Map<string, Map<string, MistakeRecord>> | undefined;
}

function getAttemptsStore(): Map<string, ExamAttempt> {
  if (!global.__ksport_wkf_attempts) {
    global.__ksport_wkf_attempts = new Map<string, ExamAttempt>();
  }
  return global.__ksport_wkf_attempts;
}

function getMistakesStore(): Map<string, Map<string, MistakeRecord>> {
  if (!global.__ksport_wkf_mistakes) {
    global.__ksport_wkf_mistakes = new Map<string, Map<string, MistakeRecord>>();
  }
  return global.__ksport_wkf_mistakes;
}

export type CreateAttemptParams = {
  ownerId: string;
  isAuthenticated: boolean;
  category: ExamCategory | "mixed";
  mode: ExamMode;
  language?: ExamLanguage;
  requestedCount: QuestionCountOption;
  timeLimitMinutes?: number | null;
  previousAttemptId?: string | null;
  previousOrderIds?: string[];
  customQuestionIdsPool?: string[];
};

export function createExamAttempt(params: CreateAttemptParams): ExamAttempt {
  const bank = getQuestionBank();
  const questionsMap = getQuestionsMap();
  const store = getAttemptsStore();

  let poolIds: string[] = [];
  if (params.customQuestionIdsPool && params.customQuestionIdsPool.length > 0) {
    poolIds = params.customQuestionIdsPool.filter((id) => {
      const q = questionsMap.get(id);
      return q && q.verificationStatus === "verified" && typeof q.correctAnswer === "boolean";
    });
  } else if (params.category === "mixed") {
    poolIds = [
      ...getVerifiedQuestionsByCategory("kumite").map((q) => q.id),
      ...getVerifiedQuestionsByCategory("kata").map((q) => q.id),
    ];
  } else {
    poolIds = getVerifiedQuestionsByCategory(params.category).map((q) => q.id);
  }

  if (poolIds.length === 0) {
    throw new Error("Không có câu hỏi hợp lệ đã xác minh trong bộ đề được chọn.");
  }

  let referencePreviousOrder = params.previousOrderIds;
  if (!referencePreviousOrder && params.previousAttemptId) {
    const prev = store.get(params.previousAttemptId);
    if (prev) {
      referencePreviousOrder = prev.questionIds;
    }
  }

  const shuffledIds = selectAndShuffleQuestions(
    poolIds,
    params.requestedCount,
    referencePreviousOrder
  );

  const publicQuestions = shuffledIds
    .map((id) => questionsMap.get(id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))
    .map((q) => toPublicQuestion(q));

  const now = new Date().toISOString();
  const attemptId = `wkf-att-${Date.now().toString(36)}-${crypto
    .randomBytes(4)
    .toString("hex")}`;

  const prevAttempt = params.previousAttemptId
    ? store.get(params.previousAttemptId)
    : undefined;
  const resolvedLanguage: ExamLanguage =
    params.language === "en" || params.language === "vi"
      ? params.language
      : prevAttempt?.language ?? "vi";

  const attempt: ExamAttempt = {
    attemptId,
    ownerId: params.ownerId,
    isAuthenticated: params.isAuthenticated,
    category: params.category,
    mode: params.mode,
    language: resolvedLanguage,
    bankVersion: bank.bankVersion,
    requestedCount: params.requestedCount,
    timeLimitMinutes:
      params.mode === "exam" &&
      typeof params.timeLimitMinutes === "number" &&
      params.timeLimitMinutes > 0
        ? Math.min(180, Math.max(1, Math.round(params.timeLimitMinutes)))
        : null,
    questionIds: shuffledIds,
    questions: publicQuestions,
    answers: {},
    flaggedQuestionIds: [],
    currentIndex: 0,
    startedAt: now,
    updatedAt: now,
    completedAt: null,
    status: "in_progress",
    previousAttemptId: params.previousAttemptId ?? null,
    result: null,
  };

  store.set(attemptId, attempt);
  return attempt;
}

export function getAttemptForOwner(
  attemptId: string,
  ownerId?: string
): ExamAttempt | null {
  const store = getAttemptsStore();
  const attempt = store.get(attemptId);
  if (!attempt) return null;
  if (attempt.isAuthenticated && ownerId && attempt.ownerId !== ownerId) {
    return null;
  }
  return attempt;
}

export function recordPracticeAnswerOnServer(params: {
  attemptId?: string;
  ownerId: string;
  questionId: string;
  selectedAnswer: boolean;
}): {
  feedback: PracticeAnswerCheckResult;
  alreadyGraded: boolean;
} {
  const questionsMap = getQuestionsMap();
  const record = questionsMap.get(params.questionId);
  if (!record) {
    throw new Error("Không tìm thấy câu hỏi trong ngân hàng đề.");
  }

  const store = getAttemptsStore();
  const attempt = params.attemptId ? store.get(params.attemptId) : undefined;

  if (attempt) {
    if (attempt.status === "completed") {
      throw new Error("Lượt làm bài đã kết thúc, không thể thay đổi câu trả lời.");
    }
    if (attempt.mode === "exam") {
      throw new Error("Chế độ Thi thử không cho phép kiểm tra đáp án trước khi nộp bài.");
    }
    // Prevent overwriting an already-graded question in Practice mode
    const existingEntry = attempt.answers[params.questionId];
    if (existingEntry?.practiceFeedback) {
      return {
        feedback: existingEntry.practiceFeedback,
        alreadyGraded: true,
      };
    }
  }

  const feedback = checkPracticeAnswer(record, params.selectedAnswer);

  if (attempt) {
    attempt.answers[params.questionId] = {
      selectedAnswer: params.selectedAnswer,
      answeredAt: feedback.checkedAt,
      practiceFeedback: feedback,
    };
    attempt.updatedAt = feedback.checkedAt;
  }

  updateOwnerMistakeRecord(params.ownerId, record.id, params.selectedAnswer, feedback.isCorrect);

  return {
    feedback,
    alreadyGraded: false,
  };
}

export function submitAttemptOnServer(params: {
  attemptId: string;
  ownerId: string;
  isAuthenticated: boolean;
  category: ExamCategory | "mixed";
  mode: ExamMode;
  language?: ExamLanguage;
  requestedCount?: QuestionCountOption;
  timeLimitMinutes?: number | null;
  questionIds: string[];
  answers: Record<string, AttemptAnswerEntry>;
  flaggedQuestionIds?: string[];
  startedAt: string;
}): ExamAttempt {
  const store = getAttemptsStore();
  const questionsMap = getQuestionsMap();
  const bank = getQuestionBank();

  const existing = store.get(params.attemptId);
  if (existing) {
    if (existing.isAuthenticated && existing.ownerId !== params.ownerId) {
      throw new Error("Bạn không có quyền truy cập lượt thi của người dùng khác.");
    }
    // Idempotent: if already completed, return the locked result without re-grading
    if (existing.status === "completed" && existing.result) {
      return existing;
    }
  }

  const canonicalQuestionIds = existing
    ? existing.questionIds
    : params.questionIds.filter((id) => questionsMap.has(id));

  if (canonicalQuestionIds.length === 0) {
    throw new Error("Danh sách câu hỏi của lượt thi không hợp lệ.");
  }

  // Merge answers, preserving any already-locked practice answers on the server
  const mergedAnswers: Record<string, AttemptAnswerEntry> = {};
  for (const qId of canonicalQuestionIds) {
    const serverExisting = existing?.answers[qId];
    const clientProvided = params.answers[qId];
    if (serverExisting?.practiceFeedback) {
      mergedAnswers[qId] = serverExisting;
    } else if (
      clientProvided &&
      typeof clientProvided.selectedAnswer === "boolean"
    ) {
      mergedAnswers[qId] = {
        selectedAnswer: clientProvided.selectedAnswer,
        answeredAt: clientProvided.answeredAt || new Date().toISOString(),
        practiceFeedback: clientProvided.practiceFeedback,
      };
    } else if (serverExisting) {
      mergedAnswers[qId] = serverExisting;
    }
  }

  const completedAt = new Date().toISOString();
  const startedAt = existing?.startedAt || params.startedAt || completedAt;
  const mode = existing?.mode || params.mode;
  const category = existing?.category || params.category;

  const result = gradeAttempt({
    attemptId: params.attemptId,
    category,
    mode,
    bankVersion: existing?.bankVersion || bank.bankVersion,
    questionIds: canonicalQuestionIds,
    answers: mergedAnswers,
    startedAt,
    completedAt,
    questionsMap,
  });

  // Update mistake tracking for every answered question in the submitted attempt
  for (const item of result.items) {
    if (item.selectedAnswer !== null && item.status !== "unverified") {
      updateOwnerMistakeRecord(
        params.ownerId,
        item.questionId,
        item.selectedAnswer,
        item.status === "correct"
      );
    }
  }

  const completedAttempt: ExamAttempt = {
    attemptId: params.attemptId,
    ownerId: existing?.ownerId || params.ownerId,
    isAuthenticated: existing?.isAuthenticated ?? params.isAuthenticated,
    category,
    mode,
    language:
      params.language === "en" || params.language === "vi"
        ? params.language
        : existing?.language ?? "vi",
    bankVersion: existing?.bankVersion || bank.bankVersion,
    requestedCount: existing?.requestedCount || params.requestedCount || "all",
    timeLimitMinutes: existing?.timeLimitMinutes ?? params.timeLimitMinutes ?? null,
    questionIds: canonicalQuestionIds,
    questions: canonicalQuestionIds
      .map((id) => questionsMap.get(id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q))
      .map((q) => toPublicQuestion(q)),
    answers: mergedAnswers,
    flaggedQuestionIds:
      params.flaggedQuestionIds ?? existing?.flaggedQuestionIds ?? [],
    currentIndex: existing?.currentIndex ?? 0,
    startedAt,
    updatedAt: completedAt,
    completedAt,
    status: "completed",
    previousAttemptId: existing?.previousAttemptId ?? null,
    result,
  };

  store.set(params.attemptId, completedAttempt);
  return completedAttempt;
}

export function updateOwnerMistakeRecord(
  ownerId: string,
  questionId: string,
  selectedAnswer: boolean,
  isCorrect: boolean
) {
  const questionsMap = getQuestionsMap();
  const bank = getQuestionBank();
  const record = questionsMap.get(questionId);
  if (!record) return;

  const mistakesStore = getMistakesStore();
  let ownerMap = mistakesStore.get(ownerId);
  if (!ownerMap) {
    ownerMap = new Map<string, MistakeRecord>();
    mistakesStore.set(ownerId, ownerMap);
  }

  const key = `${record.category}:${record.id}`;
  const existing = ownerMap.get(key);
  const now = new Date().toISOString();

  if (!isCorrect) {
    ownerMap.set(key, {
      key,
      questionId: record.id,
      category: record.category,
      questionNumber: record.questionNumber,
      bankVersion: bank.bankVersion,
      textEn: record.textEn,
      textVi: record.translationVerified ? record.textVi : null,
      translationVerified: Boolean(record.translationVerified && record.textVi),
      wrongCount: (existing?.wrongCount ?? 0) + 1,
      correctCount: existing?.correctCount ?? 0,
      lastSelectedAnswer: selectedAnswer,
      lastResult: "wrong",
      lastAnsweredAt: now,
      resolved: false,
    });
  } else if (existing) {
    ownerMap.set(key, {
      ...existing,
      correctCount: existing.correctCount + 1,
      lastSelectedAnswer: selectedAnswer,
      lastResult: "correct",
      lastAnsweredAt: now,
      resolved: true,
    });
  }
}

export function getOwnerAttempts(ownerId: string): ExamAttempt[] {
  const store = getAttemptsStore();
  const list: ExamAttempt[] = [];
  for (const att of store.values()) {
    if (att.ownerId === ownerId) {
      list.push(att);
    }
  }
  return list.sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
}

export function getOwnerMistakes(ownerId: string): MistakeRecord[] {
  const mistakesStore = getMistakesStore();
  const ownerMap = mistakesStore.get(ownerId);
  if (!ownerMap) return [];
  return Array.from(ownerMap.values()).sort(
    (a, b) => Date.parse(b.lastAnsweredAt) - Date.parse(a.lastAnsweredAt)
  );
}
