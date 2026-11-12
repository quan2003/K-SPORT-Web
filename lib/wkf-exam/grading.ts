import type {
  AttemptAnswerEntry,
  ExamCategory,
  ExamMode,
  ExamResultSummary,
  GradedQuestionItem,
  PracticeAnswerCheckResult,
  WkfQuestionRecord,
} from "./types";

/**
 * Checks a single question answer in Practice or Mistake Review mode.
 * Throws if the question is not verified for official grading.
 */
export function checkPracticeAnswer(
  question: WkfQuestionRecord,
  selectedAnswer: boolean,
  checkedAt: string = new Date().toISOString()
): PracticeAnswerCheckResult {
  if (
    question.verificationStatus !== "verified" ||
    typeof question.correctAnswer !== "boolean"
  ) {
    throw new Error(
      `Câu hỏi ${question.id} chưa được xác minh đáp án nên không đưa vào chấm điểm chính thức.`
    );
  }

  return {
    questionId: question.id,
    selectedAnswer,
    isCorrect: selectedAnswer === question.correctAnswer,
    correctAnswer: question.correctAnswer,
    explanationVi: question.explanationVi,
    ruleReference: question.ruleReference,
    questionSourceVersion: question.questionSourceVersion,
    answerKeyVersion: question.answerKeyVersion,
    checkedAt,
  };
}

export type GradeAttemptInput = {
  attemptId: string;
  category: ExamCategory | "mixed";
  mode: ExamMode;
  bankVersion: string;
  questionIds: readonly string[];
  answers: Record<string, AttemptAnswerEntry>;
  startedAt: string;
  completedAt?: string;
  questionsMap: ReadonlyMap<string, WkfQuestionRecord>;
};

/**
 * Grades an attempt on the server strictly by questionId (never by shuffled position).
 * Excludes any unverified questions from official scoring per WKF Academy rules.
 * Formula: Accuracy = Correct Answers / Total Gradable Questions * 100
 */
export function gradeAttempt(input: GradeAttemptInput): ExamResultSummary {
  const completedAt = input.completedAt ?? new Date().toISOString();
  const startMs = Date.parse(input.startedAt);
  const endMs = Date.parse(completedAt);
  const durationSeconds =
    Number.isFinite(startMs) && Number.isFinite(endMs) && endMs >= startMs
      ? Math.max(1, Math.round((endMs - startMs) / 1000))
      : 0;

  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  let unverifiedCount = 0;

  const items: GradedQuestionItem[] = [];

  for (let idx = 0; idx < input.questionIds.length; idx += 1) {
    const qId = input.questionIds[idx];
    const record = input.questionsMap.get(qId);
    if (!record) {
      continue;
    }

    const answerEntry = input.answers[qId];
    const selectedAnswer =
      answerEntry && typeof answerEntry.selectedAnswer === "boolean"
        ? answerEntry.selectedAnswer
        : null;

    const isVerified =
      record.verificationStatus === "verified" &&
      typeof record.correctAnswer === "boolean";

    let status: GradedQuestionItem["status"];
    if (!isVerified) {
      status = "unverified";
      unverifiedCount += 1;
    } else if (selectedAnswer === null) {
      status = "unanswered";
      unansweredCount += 1;
    } else if (selectedAnswer === record.correctAnswer) {
      status = "correct";
      correctCount += 1;
    } else {
      status = "wrong";
      wrongCount += 1;
    }

    const rawVi = record.questionVi ?? record.textVi ?? null;
    const isVerifiedVi =
      Boolean(rawVi) &&
      (record.translationStatus === "verified" ||
        (record.translationStatus === undefined && record.translationVerified));

    items.push({
      position: idx + 1,
      questionId: record.id,
      category: record.category,
      questionNumber: record.questionNumber,
      textEn: record.textEn,
      questionEn: record.questionEn ?? record.textEn,
      textVi: isVerifiedVi ? rawVi : null,
      questionVi: isVerifiedVi ? rawVi : null,
      translationStatus: isVerifiedVi
        ? "verified"
        : rawVi
        ? "pending_review"
        : "missing",
      translationVerified: isVerifiedVi,
      selectedAnswer,
      correctAnswer: isVerified ? record.correctAnswer : null,
      status,
      explanationVi: record.explanationVi,
      ruleReference: record.ruleReference,
      questionSourceVersion: record.questionSourceVersion,
      answerKeyVersion: record.answerKeyVersion,
    });
  }

  const totalQuestions = items.length;
  const gradableQuestions = totalQuestions - unverifiedCount;
  const accuracyPercent =
    gradableQuestions > 0
      ? Number(((correctCount / gradableQuestions) * 100).toFixed(1))
      : 0;

  return {
    attemptId: input.attemptId,
    category: input.category,
    mode: input.mode,
    bankVersion: input.bankVersion,
    totalQuestions,
    gradableQuestions,
    correctCount,
    wrongCount,
    unansweredCount,
    unverifiedCount,
    accuracyPercent,
    durationSeconds,
    startedAt: input.startedAt,
    completedAt,
    items,
  };
}

