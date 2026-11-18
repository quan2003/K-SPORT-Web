"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getLastAttemptForScope,
  getLocalAttempt,
  getOrCreateLocalOwnerId,
  recordExamResultInMistakes,
  saveLocalAttempt,
} from "@/lib/wkf-exam/client-storage";
import type {
  ExamAttempt,
  ExamLanguage,
  GradedQuestionItem,
} from "@/lib/wkf-exam/types";

type Props = {
  attemptId: string;
  initialServerAttempt?: ExamAttempt | null;
};

type ReviewFilter = "all" | "wrong" | "correct" | "unanswered";

function formatDurationVi(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  if (mins === 0) return `${secs} giây`;
  return `${mins} phút ${String(secs).padStart(2, "0")} giây`;
}

function formatDateTimeVi(iso: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatCategoryLabel(cat: ExamAttempt["category"]) {
  if (cat === "kumite") return "KUMITE";
  if (cat === "kata") return "KATA & PARA KARATE";
  return "TỔNG HỢP KUMITE & KATA";
}

function formatModeLabel(mode: ExamAttempt["mode"]) {
  if (mode === "exam") return "Chế độ Thi thử";
  if (mode === "mistakes") return "Ôn lại câu sai";
  return "Chế độ Luyện tập";
}

function formatAnswerChoiceLabel(val: boolean | null) {
  if (val === true) return "Đúng (True)";
  if (val === false) return "Sai (False)";
  return "Chưa trả lời";
}

function CheckCircleIcon() {
  return (
    <svg
      className="wkf-status-icon"
      width="18"
      height="18"
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
      width="18"
      height="18"
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

function MinusCircleIcon() {
  return (
    <svg
      className="wkf-status-icon"
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M6.5 10H13.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function ExamResultView({ attemptId, initialServerAttempt }: Props) {
  const router = useRouter();
  const [attempt, setAttempt] = useState<ExamAttempt | null>(
    initialServerAttempt ?? null
  );
  const [loading, setLoading] = useState(!initialServerAttempt);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retaking, setRetaking] = useState(false);
  const [startingMistakes, setStartingMistakes] = useState(false);
  const [filter, setFilter] = useState<ReviewFilter>("all");
  // Per-question language override map (questionId -> "vi" | "en")
  const [questionLangOverrides, setQuestionLangOverrides] = useState<
    Record<string, ExamLanguage>
  >({});

  useEffect(() => {
    async function hydrateAndEnsureGraded() {
      const local = getLocalAttempt(attemptId);
      const candidate = local || initialServerAttempt || null;

      if (candidate && candidate.status === "completed" && candidate.result) {
        saveLocalAttempt(candidate);
        setAttempt(candidate);
        setLoading(false);
        return;
      }

      // If attempt exists locally as in_progress, submit it to server to grade
      if (candidate && candidate.status === "in_progress") {
        try {
          const ownerId = getOrCreateLocalOwnerId();
          const res = await fetch("/api/wkf-exam/grade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              attemptId: candidate.attemptId,
              ownerId,
              category: candidate.category,
              mode: candidate.mode,
              language: candidate.language ?? "vi",
              requestedCount: candidate.requestedCount,
              timeLimitMinutes: candidate.timeLimitMinutes,
              questionIds: candidate.questionIds,
              answers: candidate.answers,
              flaggedQuestionIds: candidate.flaggedQuestionIds,
              startedAt: candidate.startedAt,
            }),
          });
          const data = (await res.json()) as {
            attempt?: ExamAttempt;
            error?: string;
          };
          if (res.ok && data.attempt) {
            const completed: ExamAttempt = {
              ...data.attempt,
              language: data.attempt.language ?? candidate.language ?? "vi",
            };
            saveLocalAttempt(completed);
            if (completed.result) {
              recordExamResultInMistakes(completed.result);
            }
            setAttempt(completed);
            setLoading(false);
            return;
          }
        } catch {
          // Fall through to server GET
        }
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
            data.error || "Không tìm thấy kết quả bài thi trên thiết bị hoặc máy chủ."
          );
        }
        saveLocalAttempt(data.attempt);
        setAttempt(data.attempt);
      } catch (err) {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Không thể tải kết quả lượt thi."
        );
      } finally {
        setLoading(false);
      }
    }

    void hydrateAndEnsureGraded();
  }, [attemptId, initialServerAttempt]);

  const result = attempt?.result ?? null;

  const filteredItems = useMemo(() => {
    if (!result) return [];
    return result.items.filter((item) => {
      if (filter === "wrong") return item.status === "wrong";
      if (filter === "correct") return item.status === "correct";
      if (filter === "unanswered") return item.status === "unanswered";
      return true;
    });
  }, [filter, result]);

  // "Thi lại" button: strictly creates a new attempt with a freshly shuffled order different from the previous attempt
  async function handleRetake() {
    if (!attempt || retaking) return;
    setRetaking(true);
    setErrorMsg(null);

    try {
      const ownerId = getOrCreateLocalOwnerId();
      const lastScope = getLastAttemptForScope(attempt.category);
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
          previousOrderIds: lastScope?.questionIds ?? attempt.questionIds,
          customQuestionIdsPool: customPool,
        }),
      });

      const data = (await res.json()) as {
        attempt?: ExamAttempt;
        error?: string;
      };

      if (!res.ok || !data.attempt) {
        throw new Error(data.error || "Không thể khởi tạo lượt thi lại.");
      }

      saveLocalAttempt(data.attempt);
      router.push(`/wkf-exam/practice/${data.attempt.attemptId}`);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo lượt thi lại."
      );
      setRetaking(false);
    }
  }

  async function handlePracticeWrongQuestions() {
    if (!attempt || !result || startingMistakes) return;
    const wrongIds = result.items
      .filter((i) => i.status === "wrong")
      .map((i) => i.questionId);

    if (wrongIds.length === 0) {
      router.push("/wkf-exam/mistakes");
      return;
    }

    setStartingMistakes(true);
    setErrorMsg(null);
    try {
      const ownerId = getOrCreateLocalOwnerId();
      const res = await fetch("/api/wkf-exam/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId,
          category: attempt.category,
          mode: "mistakes",
          language: attempt.language ?? "vi",
          requestedCount: "all",
          previousAttemptId: attempt.attemptId,
          previousOrderIds: wrongIds,
          customQuestionIdsPool: wrongIds,
        }),
      });
      const data = (await res.json()) as {
        attempt?: ExamAttempt;
        error?: string;
      };
      if (!res.ok || !data.attempt) {
        throw new Error(data.error || "Không thể tạo lượt ôn câu sai.");
      }
      saveLocalAttempt(data.attempt);
      router.push(`/wkf-exam/practice/${data.attempt.attemptId}`);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Không thể mở lượt ôn câu sai."
      );
      setStartingMistakes(false);
    }
  }

  function handleJumpToAnswers() {
    const el = document.getElementById("wkf-answer-review-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  function toggleQuestionLanguage(qId: string, currentLang: ExamLanguage) {
    const nextLang: ExamLanguage = currentLang === "vi" ? "en" : "vi";
    setQuestionLangOverrides((prev) => ({
      ...prev,
      [qId]: nextLang,
    }));
  }

  if (loading) {
    return (
      <div className="wkf-portal-body">
        <div className="wkf-section">
          <div className="wkf-loading-box" aria-live="polite">
            Đang tổng hợp điểm số và kết quả bài làm...
          </div>
        </div>
      </div>
    );
  }

  if (!attempt || !result) {
    return (
      <div className="wkf-portal-body">
        <div className="wkf-section">
          <div className="wkf-empty-box">
            <div className="wkf-empty-code">404</div>
            <h2>Không tìm thấy kết quả lượt thi</h2>
            <p>
              {errorMsg ||
                "Kết quả bài thi không tồn tại trên thiết bị này hoặc chưa được nộp bài."}
            </p>
            <div className="wkf-empty-actions">
              <Link href="/wkf-exam" className="wkf-btn wkf-btn-red">
                Về trang chủ Academy
              </Link>
              <Link href="/wkf-exam/history" className="wkf-btn wkf-btn-outline">
                Lịch sử làm bài
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const defaultLang: ExamLanguage = attempt.language === "en" ? "en" : "vi";
  const categoryBackHref =
    attempt.category === "kumite"
      ? "/wkf-exam/kumite"
      : attempt.category === "kata"
      ? "/wkf-exam/kata"
      : "/wkf-exam";

  return (
    <div className="wkf-portal-body">
      <section className="wkf-section" aria-labelledby="wkf-result-summary-heading">
        {/* Top Result Summary Panel */}
        <div className="wkf-result-hero-card">
          <div className="wkf-result-hero-head">
            <div>
              <div className="wkf-resume-badges">
                <span className="wkf-badge-solid">
                  {formatCategoryLabel(attempt.category)}
                </span>
                <span className="wkf-badge-muted">
                  {formatModeLabel(attempt.mode)}
                </span>
              </div>
              <h2 id="wkf-result-summary-heading">
                Tổng kết kết quả lượt làm bài
              </h2>
            </div>

            <div className="wkf-result-timestamp">
              <span>Hoàn thành lúc</span>
              <time dateTime={result.completedAt}>
                {formatDateTimeVi(result.completedAt)}
              </time>
            </div>
          </div>

          {/* 6 Key Metrics Grid */}
          <div className="wkf-result-metrics-grid">
            <div className="wkf-metric-cell wkf-metric-primary">
              <span className="wkf-metric-label">Tỷ lệ trả lời đúng</span>
              <strong className="wkf-metric-big">{result.accuracyPercent}%</strong>
              <span className="wkf-metric-sub">
                {result.correctCount} / {result.gradableQuestions} câu chính xác
              </span>
            </div>

            <div className="wkf-metric-cell">
              <span className="wkf-metric-label">Tổng số câu</span>
              <strong className="wkf-metric-val">{result.totalQuestions}</strong>
              <span className="wkf-metric-sub">Câu hỏi trong lượt thi</span>
            </div>

            <div className="wkf-metric-cell">
              <span className="wkf-metric-label">Chính xác</span>
              <strong className="wkf-metric-val wkf-text-correct">
                ✓ {result.correctCount}
              </strong>
              <span className="wkf-metric-sub">Trả lời đúng</span>
            </div>

            <div className="wkf-metric-cell">
              <span className="wkf-metric-label">Chưa chính xác</span>
              <strong className="wkf-metric-val wkf-text-wrong">
                ✕ {result.wrongCount}
              </strong>
              <span className="wkf-metric-sub">Đã lưu vào danh sách cần ôn</span>
            </div>

            <div className="wkf-metric-cell">
              <span className="wkf-metric-label">Chưa trả lời</span>
              <strong className="wkf-metric-val">
                — {result.unansweredCount}
              </strong>
              <span className="wkf-metric-sub">Bỏ trống</span>
            </div>

            <div className="wkf-metric-cell">
              <span className="wkf-metric-label">Thời gian hoàn thành</span>
              <strong className="wkf-metric-val">
                {formatDurationVi(result.durationSeconds)}
              </strong>
              <span className="wkf-metric-sub">Tổng thời gian làm bài</span>
            </div>
          </div>

          {errorMsg && (
            <div className="wkf-alert wkf-alert-error" role="alert">
              <strong>Lỗi:</strong> {errorMsg}
            </div>
          )}

          {/* 4 Required Post-Completion Buttons */}
          <div className="wkf-result-actions-bar">
            <button
              type="button"
              className="wkf-btn wkf-btn-red"
              disabled={retaking}
              onClick={handleRetake}
            >
              {retaking ? "Đang tạo lượt mới..." : "Thi lại"}
            </button>

            <button
              type="button"
              className="wkf-btn wkf-btn-blue"
              disabled={startingMistakes}
              onClick={handlePracticeWrongQuestions}
            >
              {startingMistakes
                ? "Đang chuẩn bị..."
                : `Ôn câu sai (${result.wrongCount})`}
            </button>

            <button
              type="button"
              className="wkf-btn wkf-btn-outline"
              onClick={handleJumpToAnswers}
            >
              Xem đáp án
            </button>

            <Link href={categoryBackHref} className="wkf-btn wkf-btn-outline">
              Về trang bộ đề
            </Link>
          </div>
        </div>
      </section>

      {/* Simplified Detailed Answer Review List (Section 1 & Section 2) */}
      <section
        id="wkf-answer-review-section"
        className="wkf-section"
        aria-labelledby="wkf-review-list-heading"
      >
        <div className="wkf-section-head">
          <div>
            <p className="wkf-eyebrow">CHI TIẾT BÀI LÀM</p>
            <h2 id="wkf-review-list-heading">
              Danh sách câu hỏi &amp; kết quả ({filteredItems.length} /{" "}
              {result.totalQuestions})
            </h2>
          </div>

          <div
            className="wkf-filter-pills"
            role="group"
            aria-label="Lọc danh sách câu hỏi xem lại"
          >
            <button
              type="button"
              className={`wkf-filter-btn ${filter === "all" ? "is-active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Tất cả ({result.totalQuestions})
            </button>
            <button
              type="button"
              className={`wkf-filter-btn ${
                filter === "wrong" ? "is-active" : ""
              }`}
              onClick={() => setFilter("wrong")}
            >
              ✕ Câu sai ({result.wrongCount})
            </button>
            <button
              type="button"
              className={`wkf-filter-btn ${
                filter === "correct" ? "is-active" : ""
              }`}
              onClick={() => setFilter("correct")}
            >
              ✓ Câu đúng ({result.correctCount})
            </button>
            <button
              type="button"
              className={`wkf-filter-btn ${
                filter === "unanswered" ? "is-active" : ""
              }`}
              onClick={() => setFilter("unanswered")}
            >
              — Chưa trả lời ({result.unansweredCount})
            </button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="wkf-empty-box">
            <h3>Không có câu hỏi nào trong bộ lọc này</h3>
            <p>Hãy chọn bộ lọc khác để xem chi tiết từng câu hỏi và đáp án.</p>
          </div>
        ) : (
          <div className="wkf-review-list">
            {filteredItems.map((item: GradedQuestionItem) => {
              const requestedLang: ExamLanguage =
                questionLangOverrides[item.questionId] ?? defaultLang;
              const verifiedVi =
                item.translationVerified && (item.questionVi || item.textVi)
                  ? item.questionVi || item.textVi
                  : null;
              const effectiveLang: ExamLanguage =
                requestedLang === "vi" && verifiedVi ? "vi" : "en";
              const displayedQuestionText =
                effectiveLang === "vi" && verifiedVi
                  ? verifiedVi
                  : item.questionEn || item.textEn;

              let statusClass = "is-unanswered";
              let statusLabel = "Chưa trả lời";
              if (item.status === "correct") {
                statusClass = "is-correct";
                statusLabel = "Chính xác";
              } else if (item.status === "wrong") {
                statusClass = "is-wrong";
                statusLabel = "Chưa chính xác";
              }

              return (
                <article
                  key={item.questionId}
                  className={`wkf-review-item ${statusClass}`}
                >
                  <div className="wkf-review-item-head">
                    <strong className="wkf-review-pos">
                      Câu {item.position}
                    </strong>

                    <div className="wkf-review-item-right">
                      {verifiedVi && (
                        <button
                          type="button"
                          className="wkf-tool-btn wkf-translate-btn"
                          onClick={() =>
                            toggleQuestionLanguage(
                              item.questionId,
                              effectiveLang
                            )
                          }
                        >
                          {effectiveLang === "vi"
                            ? "Dịch sang tiếng Anh"
                            : "Dịch sang tiếng Việt"}
                        </button>
                      )}

                      <span className={`wkf-status-tag ${statusClass}`}>
                        {item.status === "correct" && <CheckCircleIcon />}
                        {item.status === "wrong" && <XCircleIcon />}
                        {item.status === "unanswered" && <MinusCircleIcon />}
                        <span>{statusLabel}</span>
                      </span>
                    </div>
                  </div>

                  <p
                    className="wkf-review-question-en"
                    lang={effectiveLang === "vi" ? "vi" : "en"}
                  >
                    {displayedQuestionText}
                  </p>

                  {requestedLang === "vi" && !verifiedVi && (
                    <p className="wkf-unverified-translation-note">
                      Câu hỏi này chưa có bản dịch tiếng Việt được duyệt — đang hiển thị nội dung tiếng Anh gốc.
                    </p>
                  )}

                  <div className="wkf-review-outcome">
                    <p
                      className={`wkf-review-user-choice ${
                        item.status === "correct"
                          ? "wkf-text-correct"
                          : item.status === "wrong"
                          ? "wkf-text-wrong"
                          : ""
                      }`}
                    >
                      Bạn đã chọn:{" "}
                      <strong>
                        {formatAnswerChoiceLabel(item.selectedAnswer)}
                      </strong>
                    </p>

                    {item.status !== "correct" && item.correctAnswer !== null && (
                      <p className="wkf-review-correct-answer">
                        Câu trả lời đúng là:{" "}
                        <strong>
                          {formatAnswerChoiceLabel(item.correctAnswer)}
                        </strong>
                      </p>
                    )}
                  </div>

                  {(item.ruleReference || item.explanationVi) && (
                    <div className="wkf-review-explanation">
                      {item.ruleReference && (
                        <p>
                          <strong>Điều khoản tham khảo:</strong>{" "}
                          {item.ruleReference}
                        </p>
                      )}
                      {item.explanationVi && <p>{item.explanationVi}</p>}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
