"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getLastAttemptForScope,
  getLocalAttempt,
  getOrCreateLocalOwnerId,
  recordExamResultInMistakes,
  recordPracticeFeedbackInMistakes,
  saveLocalAttempt,
} from "@/lib/wkf-exam/client-storage";
import type {
  ExamAttempt,
  ExamLanguage,
  PracticeAnswerCheckResult,
} from "@/lib/wkf-exam/types";

type Props = {
  attemptId: string;
  initialServerAttempt?: ExamAttempt | null;
};

function formatCategoryTitle(cat: ExamAttempt["category"]) {
  if (cat === "kumite") return "KUMITE";
  if (cat === "kata") return "KATA & PARA KARATE";
  return "TỔNG HỢP KUMITE & KATA";
}

function formatModeTitle(mode: ExamAttempt["mode"], lang: ExamLanguage) {
  if (mode === "exam") {
    return lang === "en" ? "Testing Mode (Thi thử)" : "Chế độ Thi thử";
  }
  if (mode === "mistakes") {
    return lang === "en" ? "Mistake Review (Ôn câu sai)" : "Ôn lại câu sai";
  }
  return lang === "en" ? "Practice Mode (Luyện tập)" : "Chế độ Luyện tập";
}

function formatTimerClock(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatAnswerChoiceLabel(val: boolean) {
  return val ? "Đúng (True)" : "Sai (False)";
}

function CheckCircleIcon() {
  return (
    <svg
      className="wkf-status-icon"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M6.5 10.2L8.9 12.6L13.8 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg
      className="wkf-status-icon"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M7.2 7.2L12.8 12.8M12.8 7.2L7.2 12.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function PracticeSessionView({
  attemptId,
  initialServerAttempt,
}: Props) {
  const router = useRouter();
  const [attempt, setAttempt] = useState<ExamAttempt | null>(
    initialServerAttempt ?? null
  );
  const [loading, setLoading] = useState(!initialServerAttempt);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [checkingAnswer, setCheckingAnswer] = useState(false);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [retaking, setRetaking] = useState(false);
  // Per-question language override map (questionId -> "vi" | "en")
  const [questionLangOverrides, setQuestionLangOverrides] = useState<
    Record<string, ExamLanguage>
  >({});
  const [confirmUnansweredOpen, setConfirmUnansweredOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const autoSubmittedRef = useRef(false);

  // Hydrate attempt from localStorage or server API while strictly preserving shuffled order, language & answers
  useEffect(() => {
    async function hydrateAttempt() {
      const local = getLocalAttempt(attemptId);
      if (local) {
        if (local.status === "completed") {
          router.replace(`/wkf-exam/results/${local.attemptId}`);
          return;
        }

        // Auto-refresh questions from latest question bank in case translations or updates were added
        try {
          const ownerId = getOrCreateLocalOwnerId();
          const res = await fetch(
            `/api/wkf-exam/attempts/${encodeURIComponent(
              attemptId
            )}?ownerId=${encodeURIComponent(ownerId)}`
          );
          const data = (await res.json()) as {
            attempt?: ExamAttempt;
          };
          if (res.ok && data.attempt?.questions?.length) {
            const refreshedAttempt: ExamAttempt = {
              ...local,
              questions: data.attempt.questions,
            };
            saveLocalAttempt(refreshedAttempt);
            setAttempt(refreshedAttempt);
            setLoading(false);
            return;
          }
        } catch {
          // Fall back to local attempt cache if network fetch fails
        }

        setAttempt(local);
        setLoading(false);
        return;
      }

      if (initialServerAttempt) {
        if (initialServerAttempt.status === "completed") {
          router.replace(`/wkf-exam/results/${initialServerAttempt.attemptId}`);
          return;
        }
        saveLocalAttempt(initialServerAttempt);
        setAttempt(initialServerAttempt);
        setLoading(false);
        return;
      }

      try {
        const ownerId = getOrCreateLocalOwnerId();
        const res = await fetch(
          `/api/wkf-exam/attempts/${encodeURIComponent(
            attemptId
          )}?ownerId=${encodeURIComponent(ownerId)}`
        );
        const data = (await res.json()) as {
          attempt?: ExamAttempt;
          error?: string;
        };
        if (!res.ok || !data.attempt) {
          throw new Error(
            data.error || "Không tìm thấy lượt làm bài này trên thiết bị hoặc máy chủ."
          );
        }
        if (data.attempt.status === "completed") {
          saveLocalAttempt(data.attempt);
          router.replace(`/wkf-exam/results/${data.attempt.attemptId}`);
          return;
        }
        saveLocalAttempt(data.attempt);
        setAttempt(data.attempt);
      } catch (err) {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Không thể tải dữ liệu lượt làm bài."
        );
      } finally {
        setLoading(false);
      }
    }

    void hydrateAttempt();
  }, [attemptId, initialServerAttempt, router]);

  // Persist every state update to localStorage immediately
  const updateAttemptState = useCallback(
    (updater: (prev: ExamAttempt) => ExamAttempt) => {
      setAttempt((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        saveLocalAttempt(next);
        return next;
      });
    },
    []
  );

  const totalQuestions = attempt?.questions.length ?? 0;
  const currentIndex = attempt
    ? Math.min(Math.max(0, attempt.currentIndex), Math.max(0, totalQuestions - 1))
    : 0;
  const currentQuestion = attempt?.questions[currentIndex] ?? null;

  const answeredCount = useMemo(
    () => (attempt ? Object.keys(attempt.answers).length : 0),
    [attempt]
  );
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const flaggedSet = useMemo(
    () => new Set(attempt?.flaggedQuestionIds ?? []),
    [attempt?.flaggedQuestionIds]
  );

  // Submit handler (used by manual submit and timer expiration)
  const executeSubmitAttempt = useCallback(
    async (currentAttempt: ExamAttempt) => {
      if (submittingExam) return;
      setSubmittingExam(true);
      setConfirmUnansweredOpen(false);
      setErrorMsg(null);

      try {
        const ownerId = getOrCreateLocalOwnerId();
        const res = await fetch("/api/wkf-exam/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId: currentAttempt.attemptId,
            ownerId,
            category: currentAttempt.category,
            mode: currentAttempt.mode,
            language: currentAttempt.language ?? "vi",
            requestedCount: currentAttempt.requestedCount,
            timeLimitMinutes: currentAttempt.timeLimitMinutes,
            questionIds: currentAttempt.questionIds,
            answers: currentAttempt.answers,
            flaggedQuestionIds: currentAttempt.flaggedQuestionIds,
            startedAt: currentAttempt.startedAt,
          }),
        });

        const data = (await res.json()) as {
          attempt?: ExamAttempt;
          error?: string;
        };

        if (!res.ok || !data.attempt) {
          throw new Error(data.error || "Không thể nộp bài và chấm điểm.");
        }

        const completed: ExamAttempt = {
          ...data.attempt,
          language: data.attempt.language ?? currentAttempt.language ?? "vi",
          questions:
            data.attempt.questions && data.attempt.questions.length > 0
              ? data.attempt.questions
              : currentAttempt.questions,
        };
        saveLocalAttempt(completed);
        if (completed.result) {
          recordExamResultInMistakes(completed.result);
        }
        router.push(`/wkf-exam/results/${completed.attemptId}`);
      } catch (err) {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Đã xảy ra lỗi khi nộp bài. Vui lòng thử lại."
        );
        setSubmittingExam(false);
      }
    },
    [router, submittingExam]
  );

  // Timer effect for Exam mode with optional timeLimitMinutes
  useEffect(() => {
    if (
      !attempt ||
      attempt.status !== "in_progress" ||
      attempt.mode !== "exam" ||
      !attempt.timeLimitMinutes
    ) {
      return;
    }

    const limitMs = attempt.timeLimitMinutes * 60 * 1000;
    const startMs = Date.parse(attempt.startedAt);

    const tick = () => {
      const elapsedMs = Date.now() - startMs;
      const leftSec = Math.max(0, Math.ceil((limitMs - elapsedMs) / 1000));
      setRemainingSeconds(leftSec);
      if (leftSec <= 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        void executeSubmitAttempt(attempt);
      }
    };

    const initialTimer = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [attempt, executeSubmitAttempt]);

  // Keyboard navigation (ArrowLeft, ArrowRight, Escape for drawer/modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === "Escape") {
        setMobileDrawerOpen(false);
        setConfirmUnansweredOpen(false);
        return;
      }
      if (!attempt || confirmUnansweredOpen || mobileDrawerOpen) return;

      if (e.key === "ArrowLeft" && currentIndex > 0) {
        e.preventDefault();
        updateAttemptState((prev) => ({
          ...prev,
          currentIndex: Math.max(0, prev.currentIndex - 1),
          updatedAt: new Date().toISOString(),
        }));
      } else if (e.key === "ArrowRight" && currentIndex < totalQuestions - 1) {
        e.preventDefault();
        updateAttemptState((prev) => ({
          ...prev,
          currentIndex: Math.min(totalQuestions - 1, prev.currentIndex + 1),
          updatedAt: new Date().toISOString(),
        }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    attempt,
    confirmUnansweredOpen,
    currentIndex,
    mobileDrawerOpen,
    totalQuestions,
    updateAttemptState,
  ]);

  function handleGoToQuestion(index: number) {
    if (!attempt) return;
    const clamped = Math.min(Math.max(0, index), totalQuestions - 1);
    updateAttemptState((prev) => ({
      ...prev,
      currentIndex: clamped,
      updatedAt: new Date().toISOString(),
    }));
    setMobileDrawerOpen(false);
  }

  function handleToggleFlag() {
    if (!attempt || !currentQuestion) return;
    const qId = currentQuestion.id;
    updateAttemptState((prev) => {
      const exists = prev.flaggedQuestionIds.includes(qId);
      const nextFlags = exists
        ? prev.flaggedQuestionIds.filter((id) => id !== qId)
        : [...prev.flaggedQuestionIds, qId];
      return {
        ...prev,
        flaggedQuestionIds: nextFlags,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function handleToggleCurrentQuestionLang(currentDisplayedLang: ExamLanguage) {
    if (!currentQuestion) return;
    const nextLang: ExamLanguage = currentDisplayedLang === "vi" ? "en" : "vi";
    setQuestionLangOverrides((prev) => ({
      ...prev,
      [currentQuestion.id]: nextLang,
    }));
  }

  async function handleSelectAnswer(selected: boolean) {
    if (!attempt || !currentQuestion || checkingAnswer || submittingExam) return;
    setErrorMsg(null);

    const qId = currentQuestion.id;

    // Mode 1: Exam mode -> record/update choice locally without checking or revealing correct answer
    if (attempt.mode === "exam") {
      updateAttemptState((prev) => ({
        ...prev,
        answers: {
          ...prev.answers,
          [qId]: {
            selectedAnswer: selected,
            answeredAt: new Date().toISOString(),
          },
        },
        updatedAt: new Date().toISOString(),
      }));
      return;
    }

    // Mode 2: Practice or Mistakes mode -> do not overwrite already-graded question in this attempt
    const existingAnswer = attempt.answers[qId];
    if (existingAnswer?.practiceFeedback) {
      return;
    }

    setCheckingAnswer(true);
    try {
      const ownerId = getOrCreateLocalOwnerId();
      const res = await fetch("/api/wkf-exam/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: attempt.attemptId,
          ownerId,
          mode: attempt.mode,
          questionId: qId,
          selectedAnswer: selected,
        }),
      });

      const data = (await res.json()) as {
        feedback?: PracticeAnswerCheckResult;
        error?: string;
      };

      if (!res.ok || !data.feedback) {
        throw new Error(data.error || "Không thể kiểm tra đáp án câu hỏi.");
      }

      const feedback = data.feedback;
      recordPracticeFeedbackInMistakes(
        currentQuestion,
        feedback,
        attempt.bankVersion
      );

      updateAttemptState((prev) => ({
        ...prev,
        answers: {
          ...prev.answers,
          [qId]: {
            selectedAnswer: feedback.selectedAnswer,
            answeredAt: feedback.checkedAt,
            practiceFeedback: feedback,
          },
        },
        updatedAt: feedback.checkedAt,
      }));
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Lỗi kết nối khi kiểm tra đáp án."
      );
    } finally {
      setCheckingAnswer(false);
    }
  }

  function handleRequestSubmit() {
    if (!attempt) return;
    if (unansweredCount > 0) {
      setConfirmUnansweredOpen(true);
      return;
    }
    void executeSubmitAttempt(attempt);
  }

  // Retake button ("Thi lại"): creates a brand-new attempt with a different shuffled order,
  // clears choices for the new attempt, resets to Question 1, and preserves previous attempt history.
  async function handleRetakeNow() {
    if (!attempt || retaking || submittingExam) return;
    setRetaking(true);
    setErrorMsg(null);

    try {
      const ownerId = getOrCreateLocalOwnerId();
      const lastInScope = getLastAttemptForScope(attempt.category);
      const customPool =
        attempt.mode === "mistakes" ? attempt.questionIds : undefined;

      const res = await fetch("/api/wkf-exam/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId,
          category: attempt.category,
          mode: attempt.mode,
          language: attempt.language ?? "vi",
          requestedCount: attempt.requestedCount,
          timeLimitMinutes: attempt.timeLimitMinutes,
          previousAttemptId: attempt.attemptId,
          previousOrderIds: lastInScope?.questionIds ?? attempt.questionIds,
          customQuestionIdsPool: customPool,
        }),
      });

      const data = (await res.json()) as {
        attempt?: ExamAttempt;
        error?: string;
      };

      if (!res.ok || !data.attempt) {
        throw new Error(data.error || "Không thể tạo lượt thi lại.");
      }

      saveLocalAttempt(data.attempt);
      router.push(`/wkf-exam/practice/${data.attempt.attemptId}`);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi khởi tạo lượt thi lại."
      );
      setRetaking(false);
    }
  }

  if (loading) {
    return (
      <div className="wkf-portal-body">
        <div className="wkf-section">
          <div className="wkf-loading-box" aria-live="polite">
            Đang tải dữ liệu câu hỏi và khôi phục tiến độ lượt làm bài...
          </div>
        </div>
      </div>
    );
  }

  if (!attempt || !currentQuestion) {
    return (
      <div className="wkf-portal-body">
        <div className="wkf-section">
          <div className="wkf-empty-box">
            <div className="wkf-empty-code">404</div>
            <h2>Không tìm thấy lượt làm bài</h2>
            <p>
              {errorMsg ||
                "Mã lượt làm bài không tồn tại trên thiết bị này hoặc đã hết hạn phiên lưu trữ."}
            </p>
            <div className="wkf-empty-actions">
              <Link href="/wkf-exam/kumite" className="wkf-btn wkf-btn-red">
                Chọn bộ đề Kumite
              </Link>
              <Link href="/wkf-exam/kata" className="wkf-btn wkf-btn-blue">
                Chọn bộ đề Kata &amp; Para Karate
              </Link>
              <Link href="/wkf-exam" className="wkf-btn wkf-btn-outline">
                Về trang chủ Academy
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const defaultLang: ExamLanguage = attempt.language === "en" ? "en" : "vi";
  const requestedQuestionLang: ExamLanguage =
    questionLangOverrides[currentQuestion.id] ?? defaultLang;
  const verifiedViText =
    currentQuestion.translationVerified &&
    (currentQuestion.questionVi || currentQuestion.textVi)
      ? currentQuestion.questionVi || currentQuestion.textVi
      : null;
  const effectiveQuestionLang: ExamLanguage =
    requestedQuestionLang === "vi" && verifiedViText ? "vi" : "en";
  const displayedQuestionText =
    effectiveQuestionLang === "vi" && verifiedViText
      ? verifiedViText
      : currentQuestion.questionEn || currentQuestion.textEn;

  const currentAnswerEntry = attempt.answers[currentQuestion.id];
  const currentFeedback = currentAnswerEntry?.practiceFeedback;
  const isCurrentFlagged = flaggedSet.has(currentQuestion.id);
  const progressPercent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="wkf-portal-body">
      <div className="wkf-exam-workspace">
        {/* Left Column (~70% on Desktop): Main Question & Controls */}
        <div className="wkf-exam-main-col">
          {/* Top Context & Progress Bar */}
          <div className="wkf-exam-top-bar">
            <div className="wkf-exam-top-meta">
              <span className="wkf-badge-solid">
                {formatCategoryTitle(attempt.category)}
              </span>
              <span className="wkf-badge-muted">
                {formatModeTitle(attempt.mode, defaultLang)}
              </span>
              <span className="wkf-source-ref">
                {defaultLang === "en"
                  ? "Default language: English"
                  : "Ngôn ngữ mặc định: Tiếng Việt"}
              </span>
            </div>

            <div className="wkf-progress-wrap">
              <div className="wkf-progress-labels">
                <span>
                  {defaultLang === "en" ? (
                    <>
                      Progress: <strong>{answeredCount}</strong> /{" "}
                      {totalQuestions} answered
                    </>
                  ) : (
                    <>
                      Tiến độ làm bài: <strong>{answeredCount}</strong> /{" "}
                      {totalQuestions} câu đã trả lời
                    </>
                  )}
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div
                className="wkf-progress-track"
                role="progressbar"
                aria-valuenow={answeredCount}
                aria-valuemin={0}
                aria-valuemax={totalQuestions}
                aria-label="Tiến độ trả lời câu hỏi"
              >
                <div
                  className="wkf-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="wkf-alert wkf-alert-error" role="alert">
              <strong>Thông báo lỗi:</strong> {errorMsg}
            </div>
          )}

          {/* Question Card */}
          <article
            className="wkf-question-panel"
            aria-labelledby="wkf-current-question-pos"
          >
            <div className="wkf-question-header">
              <div className="wkf-question-pos-group">
                <span id="wkf-current-question-pos" className="wkf-question-pos">
                  Câu {currentIndex + 1} / {totalQuestions}
                </span>
                {currentAnswerEntry && (
                  <span
                    className={`wkf-answered-chip ${
                      attempt.mode !== "exam" && currentFeedback
                        ? currentFeedback.isCorrect
                          ? "is-chip-correct"
                          : "is-chip-wrong"
                        : ""
                    }`}
                  >
                    {attempt.mode === "exam"
                      ? `Đã chọn: ${formatAnswerChoiceLabel(
                          currentAnswerEntry.selectedAnswer
                        )}`
                      : currentFeedback?.isCorrect
                      ? "Chính xác"
                      : "Chưa chính xác"}
                  </span>
                )}
              </div>

              <div className="wkf-question-tools">
                {verifiedViText && (
                  <button
                    type="button"
                    className="wkf-tool-btn wkf-translate-btn"
                    onClick={() =>
                      handleToggleCurrentQuestionLang(effectiveQuestionLang)
                    }
                  >
                    {effectiveQuestionLang === "vi"
                      ? "Dịch sang tiếng Anh"
                      : "Dịch sang tiếng Việt"}
                  </button>
                )}

                <button
                  type="button"
                  className={`wkf-tool-btn wkf-flag-btn ${
                    isCurrentFlagged ? "is-flagged" : ""
                  }`}
                  onClick={handleToggleFlag}
                  aria-pressed={isCurrentFlagged}
                >
                  <span aria-hidden="true">{isCurrentFlagged ? "★" : "☆"}</span>
                  <span>
                    {isCurrentFlagged
                      ? "Đã đánh dấu câu khó"
                      : "Đánh dấu câu khó"}
                  </span>
                </button>
              </div>
            </div>

            {/* Question Content */}
            <div className="wkf-question-body">
              <p className="wkf-question-lang-label">
                {effectiveQuestionLang === "vi"
                  ? "NỘI DUNG CÂU HỎI (TIẾNG VIỆT)"
                  : "QUESTION CONTENT (ENGLISH WKF)"}
              </p>
              <blockquote
                className="wkf-question-text-en"
                lang={effectiveQuestionLang === "vi" ? "vi" : "en"}
              >
                {displayedQuestionText}
              </blockquote>

              {requestedQuestionLang === "vi" && !verifiedViText && (
                <p className="wkf-unverified-translation-note" role="status">
                  Câu hỏi này chưa có bản dịch tiếng Việt được duyệt — đang hiển thị nội dung tiếng Anh gốc.
                </p>
              )}
            </div>

            {/* Two Large True / False Choice Buttons */}
            <div
              className="wkf-tf-choices"
              role="group"
              aria-label="Lựa chọn Đúng hoặc Sai"
            >
              {/* Option TRUE */}
              {(() => {
                const isSelected = currentAnswerEntry?.selectedAnswer === true;
                const isLockedPractice = Boolean(currentFeedback);
                let stateClass = "";
                if (attempt.mode === "exam") {
                  if (isSelected) stateClass = "is-selected-exam";
                } else if (currentFeedback && isSelected) {
                  stateClass = currentFeedback.isCorrect
                    ? "is-correct-choice"
                    : "is-wrong-choice";
                }

                return (
                  <button
                    type="button"
                    className={`wkf-tf-btn ${stateClass}`}
                    disabled={checkingAnswer || isLockedPractice}
                    aria-pressed={isSelected}
                    onClick={() => handleSelectAnswer(true)}
                  >
                    <span className="wkf-tf-key" aria-hidden="true">
                      T
                    </span>
                    <span className="wkf-tf-label">
                      Đúng (True)
                    </span>
                  </button>
                );
              })()}

              {/* Option FALSE */}
              {(() => {
                const isSelected = currentAnswerEntry?.selectedAnswer === false;
                const isLockedPractice = Boolean(currentFeedback);
                let stateClass = "";
                if (attempt.mode === "exam") {
                  if (isSelected) stateClass = "is-selected-exam";
                } else if (currentFeedback && isSelected) {
                  stateClass = currentFeedback.isCorrect
                    ? "is-correct-choice"
                    : "is-wrong-choice";
                }

                return (
                  <button
                    type="button"
                    className={`wkf-tf-btn ${stateClass}`}
                    disabled={checkingAnswer || isLockedPractice}
                    aria-pressed={isSelected}
                    onClick={() => handleSelectAnswer(false)}
                  >
                    <span className="wkf-tf-key" aria-hidden="true">
                      F
                    </span>
                    <span className="wkf-tf-label">
                      Sai (False)
                    </span>
                  </button>
                );
              })()}
            </div>

            {/* Immediate Practice / Mistake Mode Feedback Panel (Section 1 & 2) */}
            {attempt.mode !== "exam" && currentFeedback && (
              <div
                className={`wkf-feedback-panel ${
                  currentFeedback.isCorrect ? "is-correct" : "is-wrong"
                }`}
                role="status"
                aria-live="polite"
              >
                <div className="wkf-feedback-head">
                  <strong className="wkf-feedback-verdict">
                    {currentFeedback.isCorrect ? (
                      <>
                        <CheckCircleIcon />
                        <span>Chính xác</span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon />
                        <span>Chưa chính xác</span>
                      </>
                    )}
                  </strong>
                </div>

                <div className="wkf-feedback-lines">
                  <p className="wkf-feedback-user-choice">
                    Bạn đã chọn:{" "}
                    <strong>
                      {formatAnswerChoiceLabel(currentFeedback.selectedAnswer)}
                    </strong>
                  </p>

                  {!currentFeedback.isCorrect && (
                    <p className="wkf-feedback-correct-answer">
                      Câu trả lời đúng là:{" "}
                      <strong>
                        {formatAnswerChoiceLabel(currentFeedback.correctAnswer)}
                      </strong>
                    </p>
                  )}
                </div>

                {currentFeedback.ruleReference && (
                  <p className="wkf-feedback-clause">
                    <strong>Điều khoản tham chiếu:</strong>{" "}
                    {currentFeedback.ruleReference}
                  </p>
                )}

                {currentFeedback.explanationVi && (
                  <p className="wkf-feedback-explanation">
                    {currentFeedback.explanationVi}
                  </p>
                )}
              </div>
            )}

            {/* Prev / Next Navigation Bar */}
            <div className="wkf-question-footer-nav">
              <button
                type="button"
                className="wkf-btn wkf-btn-outline"
                disabled={currentIndex === 0}
                onClick={() => handleGoToQuestion(currentIndex - 1)}
              >
                ← Câu trước
              </button>

              <button
                type="button"
                className="wkf-btn wkf-btn-outline wkf-mobile-nav-trigger"
                onClick={() => setMobileDrawerOpen(true)}
              >
                Bảng câu hỏi ({answeredCount}/{totalQuestions})
              </button>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  className="wkf-btn wkf-btn-blue"
                  onClick={() => handleGoToQuestion(currentIndex + 1)}
                >
                  Câu tiếp →
                </button>
              ) : (
                <button
                  type="button"
                  className="wkf-btn wkf-btn-red"
                  disabled={submittingExam}
                  onClick={handleRequestSubmit}
                >
                  {submittingExam ? "Đang chấm điểm..." : "Nộp bài"}
                </button>
              )}
            </div>
          </article>
        </div>

        {/* Right Column (~30% on Desktop): Question Navigator, Timer & Submit */}
        <aside
          className={`wkf-exam-side-col ${
            mobileDrawerOpen ? "is-mobile-open" : ""
          }`}
          aria-label="Bảng điều hướng câu hỏi và nộp bài"
        >
          <div className="wkf-side-panel">
            <div className="wkf-side-mobile-head">
              <strong>Bảng điều hướng câu hỏi</strong>
              <button
                type="button"
                className="wkf-drawer-close-btn"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Đóng bảng câu hỏi"
              >
                ✕ Đóng
              </button>
            </div>

            {/* Optional Exam Timer */}
            {attempt.mode === "exam" && remainingSeconds !== null && (
              <div
                className={`wkf-timer-box ${
                  remainingSeconds <= 60 ? "is-urgent" : ""
                }`}
                aria-live="off"
              >
                <span className="wkf-timer-label">Thời gian còn lại</span>
                <strong className="wkf-timer-clock">
                  {formatTimerClock(remainingSeconds)}
                </strong>
              </div>
            )}

            {/* Summary Counts */}
            <div className="wkf-side-counts">
              <div>
                <span>Đã trả lời</span>
                <strong>
                  {answeredCount} / {totalQuestions}
                </strong>
              </div>
              <div>
                <span>Chưa trả lời</span>
                <strong>{unansweredCount}</strong>
              </div>
              <div>
                <span>Đánh dấu (★)</span>
                <strong>{flaggedSet.size}</strong>
              </div>
            </div>

            {/* Legend */}
            <div className="wkf-nav-legend" aria-hidden="true">
              <span>
                <i className="wkf-dot wkf-dot-current" /> Đang xem
              </span>
              <span>
                <i className="wkf-dot wkf-dot-answered" /> Đã trả lời
              </span>
              <span>
                <i className="wkf-dot wkf-dot-unanswered" /> Chưa trả lời
              </span>
              <span>
                <i className="wkf-dot wkf-dot-flagged" /> Đã đánh dấu (★)
              </span>
            </div>

            {/* Question Grid (1, 2, 3... in current attempt order) */}
            <div
              className="wkf-navigator-grid"
              role="navigation"
              aria-label="Danh sách vị trí câu hỏi trong lượt thi"
            >
              {attempt.questions.map((q, idx) => {
                const ans = attempt.answers[q.id];
                const isCurrent = idx === currentIndex;
                const isFlagged = flaggedSet.has(q.id);
                const isAnswered = Boolean(ans);

                let statusClass = "is-unanswered";
                let statusSymbol = "";
                let statusText = "Chưa trả lời";

                if (isAnswered) {
                  if (attempt.mode !== "exam" && ans?.practiceFeedback) {
                    if (ans.practiceFeedback.isCorrect) {
                      statusClass = "is-answered-correct";
                      statusSymbol = "✓";
                      statusText = "Chính xác";
                    } else {
                      statusClass = "is-answered-wrong";
                      statusSymbol = "✕";
                      statusText = "Chưa chính xác";
                    }
                  } else {
                    statusClass = "is-answered";
                    statusSymbol = ans.selectedAnswer ? "T" : "F";
                    statusText = `Đã chọn ${
                      ans.selectedAnswer ? "Đúng" : "Sai"
                    }`;
                  }
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleGoToQuestion(idx)}
                    aria-current={isCurrent ? "step" : undefined}
                    aria-label={`Câu ${idx + 1}: ${statusText}${
                      isFlagged ? ", Đã đánh dấu xem lại" : ""
                    }`}
                    className={`wkf-nav-cell ${statusClass} ${
                      isCurrent ? "is-current" : ""
                    } ${isFlagged ? "is-flagged" : ""}`}
                  >
                    <span className="wkf-nav-num">{idx + 1}</span>
                    {statusSymbol && (
                      <small className="wkf-nav-sym" aria-hidden="true">
                        {statusSymbol}
                      </small>
                    )}
                    {isFlagged && (
                      <span className="wkf-nav-star" aria-hidden="true">
                        ★
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Primary Submit & Retake Actions */}
            <div className="wkf-side-actions">
              <button
                type="button"
                className="wkf-btn wkf-btn-red wkf-btn-block"
                disabled={submittingExam}
                onClick={handleRequestSubmit}
              >
                {submittingExam ? "Đang chấm điểm..." : "Nộp bài"}
              </button>

              <button
                type="button"
                className="wkf-btn wkf-btn-outline wkf-btn-block"
                disabled={retaking || submittingExam}
                onClick={handleRetakeNow}
              >
                {retaking ? "Đang tạo lượt mới..." : "Thi lại"}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Confirmation Dialog when submitting with unanswered questions */}
      {confirmUnansweredOpen && (
        <div
          className="wkf-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wkf-confirm-submit-title"
        >
          <div className="wkf-modal-dialog">
            <p className="wkf-eyebrow">XÁC NHẬN NỘP BÀI</p>
            <h2 id="wkf-confirm-submit-title">
              Bạn còn {unansweredCount} câu chưa trả lời
            </h2>
            <p>
              Trong tổng số <strong>{totalQuestions} câu</strong> của lượt thi này, bạn đã trả lời{" "}
              <strong>{answeredCount} câu</strong> và còn{" "}
              <strong>{unansweredCount} câu bỏ trống</strong>. Các câu chưa trả lời sẽ không được tính điểm đúng nhưng được thống kê riêng.
            </p>
            <div className="wkf-modal-actions">
              <button
                type="button"
                className="wkf-btn wkf-btn-outline"
                onClick={() => setConfirmUnansweredOpen(false)}
              >
                Quay lại làm tiếp
              </button>
              <button
                type="button"
                className="wkf-btn wkf-btn-red"
                disabled={submittingExam}
                onClick={() => void executeSubmitAttempt(attempt)}
              >
                {submittingExam ? "Đang nộp bài..." : "Xác nhận nộp bài"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
