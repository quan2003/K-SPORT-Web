export type ExamCategory = "kumite" | "kata";

export type ExamMode = "practice" | "exam" | "mistakes";

export type ExamLanguage = "vi" | "en";

export type QuestionCountOption = 20 | 50 | 100 | "all";

export type VerificationStatus = "verified" | "needs_review" | "unverified";

export type TranslationStatus = "verified" | "pending_review" | "missing";

export type QuestionEditLog = {
  editedAt: string;
  editedBy: string;
  summary: string;
  previousVerificationStatus: VerificationStatus;
  newVerificationStatus: VerificationStatus;
};

export type WkfQuestionRecord = {
  id: string;
  category: ExamCategory;
  questionNumber: number;
  textEn: string;
  questionEn?: string;
  textVi: string | null;
  questionVi?: string | null;
  translationStatus?: TranslationStatus;
  translationVerified: boolean;
  correctAnswer: boolean | null;
  rawAnswerMark: "T" | "F" | null;
  answerColor: "blue" | "red" | "ambiguous";
  opticalConfidence: number;
  verificationStatus: VerificationStatus;
  compatibilityStatus: string;
  officialWkfConfirmed: boolean;
  questionSourceFile: string;
  questionSourceVersion: string;
  questionSourcePage: number;
  answerKeySourceTitle: string;
  answerKeyVersion: string;
  explanationVi: string | null;
  ruleReference: string | null;
  updatedAt: string;
  editHistory?: QuestionEditLog[];
};

export type PublicQuestionView = {
  id: string;
  category: ExamCategory;
  questionNumber: number;
  textEn: string;
  questionEn: string;
  textVi: string | null;
  questionVi: string | null;
  translationStatus: TranslationStatus;
  translationVerified: boolean;
  verificationStatus: VerificationStatus;
  questionSourceVersion: string;
};

export type CategoryMetadata = {
  id: ExamCategory;
  title: string;
  titleVi: string;
  questionCount: number;
  trueCount: number;
  falseCount: number;
  questionSourceFile: string;
  questionSourceVersion: string;
  answerKeyTitle: string;
  answerKeyVersion: string;
  compatibilityStatus: string;
  compatibilityNote: string;
};

export type QuestionBankPayload = {
  bankVersion: string;
  generatedAt: string;
  categories: Record<ExamCategory, CategoryMetadata>;
  questions: WkfQuestionRecord[];
};

export type ImportAuditReport = {
  generatedAt: string;
  bankVersion: string;
  summary: {
    totalQuestions: number;
    kumiteCount: number;
    kataCount: number;
    verifiedAnswersCount: number;
    needsReviewCount: number;
    duplicateIdsCount: number;
    missingQuestionsCount: number;
    languageLeakCount: number;
    ambiguousColorCellsCount: number;
  };
  kumiteAudit: {
    questionSourceFile: string;
    pdfVersion: string;
    pageCount: number;
    expectedQuestions: number;
    extractedQuestions: number;
    missingNumbers: number[];
    duplicateNumbers: number[];
    emptyQuestions: number[];
    languageLeakWarnings: Array<{ questionNumber: number; text: string }>;
    answerKeyTitle: string;
    trueCount: number;
    falseCount: number;
    ambiguousCells: Array<{ questionNumber: number; trueBlueRatio: number; falseRedRatio: number }>;
    minOpticalConfidence: number;
  };
  kataAudit: {
    questionSourceFile: string;
    pdfVersion: string;
    pageCount: number;
    expectedQuestions: number;
    extractedQuestions: number;
    missingNumbers: number[];
    duplicateNumbers: number[];
    emptyQuestions: number[];
    languageLeakWarnings: Array<{ questionNumber: number; text: string }>;
    answerKeyTitle: string;
    trueCount: number;
    falseCount: number;
    ambiguousCells: Array<{ questionNumber: number; trueBlueRatio: number; falseRedRatio: number }>;
    minOpticalConfidence: number;
  };
  versionCompatibilityNotice: string;
};

export type PracticeAnswerCheckResult = {
  questionId: string;
  selectedAnswer: boolean;
  isCorrect: boolean;
  correctAnswer: boolean;
  explanationVi: string | null;
  ruleReference: string | null;
  questionSourceVersion: string;
  answerKeyVersion: string;
  checkedAt: string;
};

export type AttemptAnswerEntry = {
  selectedAnswer: boolean;
  answeredAt: string;
  practiceFeedback?: PracticeAnswerCheckResult;
};

export type GradedQuestionItem = {
  position: number;
  questionId: string;
  category: ExamCategory;
  questionNumber: number;
  textEn: string;
  questionEn: string;
  textVi: string | null;
  questionVi: string | null;
  translationStatus: TranslationStatus;
  translationVerified: boolean;
  selectedAnswer: boolean | null;
  correctAnswer: boolean | null;
  status: "correct" | "wrong" | "unanswered" | "unverified";
  explanationVi: string | null;
  ruleReference: string | null;
  questionSourceVersion: string;
  answerKeyVersion: string;
};

export type ExamResultSummary = {
  attemptId: string;
  category: ExamCategory | "mixed";
  mode: ExamMode;
  bankVersion: string;
  totalQuestions: number;
  gradableQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  unverifiedCount: number;
  accuracyPercent: number;
  durationSeconds: number;
  startedAt: string;
  completedAt: string;
  items: GradedQuestionItem[];
};

export type ExamAttempt = {
  attemptId: string;
  ownerId: string;
  isAuthenticated: boolean;
  category: ExamCategory | "mixed";
  mode: ExamMode;
  language: ExamLanguage;
  bankVersion: string;
  requestedCount: QuestionCountOption;
  timeLimitMinutes: number | null;
  questionIds: string[];
  questions: PublicQuestionView[];
  answers: Record<string, AttemptAnswerEntry>;
  flaggedQuestionIds: string[];
  currentIndex: number;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  status: "in_progress" | "completed";
  previousAttemptId?: string | null;
  result?: ExamResultSummary | null;
};

export type MistakeRecord = {
  key: string; // `${category}:${questionId}`
  questionId: string;
  category: ExamCategory;
  questionNumber: number;
  bankVersion: string;
  textEn: string;
  textVi: string | null;
  translationVerified: boolean;
  wrongCount: number;
  correctCount: number;
  lastSelectedAnswer: boolean;
  lastResult: "wrong" | "correct";
  lastAnsweredAt: string;
  resolved: boolean;
};

