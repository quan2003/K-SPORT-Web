"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  getLastAttemptForScope,
  getOrCreateLocalOwnerId,
  listMistakesByFilter,
  saveLocalAttempt,
  useIsClientHydrated,
} from "@/lib/wkf-exam/client-storage";
import type {
  ExamAttempt,
  ExamCategory,
  ExamLanguage,
  QuestionCountOption,
} from "@/lib/wkf-exam/types";

type Props = {
  initialCategory?: ExamCategory | "all";
};

function formatDateTimeVi(iso: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function MistakesReviewView({ initialCategory = "all" }: Props) {
  const router = useRouter();
  const hydrated = useIsClientHydrated();
  const [categoryFilter, setCategoryFilter] = useState<ExamCategory | "all">(
    initialCategory
  );
  const [statusFilter, setStatusFilter] = useState<
    "unresolved" | "resolved" | "all"
  >("unresolved");
  const [practiceCount, setPracticeCount] = useState<QuestionCountOption>("all");
  const [startingSession, setStartingSession] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [questionLangOverrides, setQuestionLangOverrides] = useState<
    Record<string, ExamLanguage>
  >({});

  const allMistakes = useMemo(
    () =>
      hydrated ? listMistakesByFilter({ category: "all", status: "all" }) : [],
    [hydrated]
  );

  const filteredMistakes = useMemo(() => {
    return allMistakes.filter((m) => {
      if (categoryFilter !== "all" && m.category !== categoryFilter) {
        return false;
      }
      if (statusFilter === "unresolved" && m.resolved) return false;
      if (statusFilter === "resolved" && !m.resolved) return false;
      return true;
    });
  }, [allMistakes, categoryFilter, statusFilter]);

  const unresolvedForSelectedCategory = useMemo(() => {
    return allMistakes.filter((m) => {
      if (categoryFilter !== "all" && m.category !== categoryFilter) {
        return false;
      }
      return !m.resolved;
    });
  }, [allMistakes, categoryFilter]);

  const totalUnresolved = useMemo(
    () => allMistakes.filter((m) => !m.resolved).length,
    [allMistakes]
  );
  const totalResolved = useMemo(
    () => allMistakes.filter((m) => m.resolved).length,
    [allMistakes]
  );
  const kumiteUnresolved = useMemo(
    () => allMistakes.filter((m) => m.category === "kumite" && !m.resolved).length,
    [allMistakes]
  );
  const kataUnresolved = useMemo(
    () => allMistakes.filter((m) => m.category === "kata" && !m.resolved).length,
    [allMistakes]
  );

  async function handleStartMistakeSession() {
    if (unresolvedForSelectedCategory.length === 0 || startingSession) return;
    setStartingSession(true);
    setErrorMsg(null);

    try {
      const ownerId = getOrCreateLocalOwnerId();
      const targetCategory: ExamCategory | "mixed" =
        categoryFilter === "all" ? "mixed" : categoryFilter;
      const lastAttempt = getLastAttemptForScope(targetCategory);
      const poolIds = unresolvedForSelectedCategory.map((m) => m.questionId);

      const res = await fetch("/api/wkf-exam/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId,
          category: targetCategory,
          mode: "mistakes",
          language: lastAttempt?.language ?? "vi",
          requestedCount: practiceCount,
          previousAttemptId: lastAttempt?.attemptId ?? null,
          previousOrderIds: lastAttempt?.questionIds ?? poolIds,
          customQuestionIdsPool: poolIds,
        }),
      });

      const data = (await res.json()) as {
        attempt?: ExamAttempt;
        error?: string;
      };

      if (!res.ok || !data.attempt) {
        throw new Error(data.error || "Không thể khởi tạo lượt ôn câu sai.");
      }

      saveLocalAttempt(data.attempt);
      router.push(`/wkf-exam/practice/${data.attempt.attemptId}`);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi tạo lượt ôn câu sai."
      );
      setStartingSession(false);
    }
  }

  return (
    <div className="wkf-portal-body">
      <section className="wkf-section" aria-labelledby="wkf-mistakes-heading">
        {/* Top Summary & Action Bar */}
        <div className="wkf-mistakes-hero-box">
          <div className="wkf-mistakes-hero-top">
            <div>
              <p className="wkf-eyebrow">KHẮC PHỤC LỖI SAI</p>
              <h2 id="wkf-mistakes-heading">
                Ngân hàng câu sai cá nhân ({totalUnresolved} câu cần ôn)
              </h2>
              <p className="wkf-section-note">
                Danh sách câu cần ôn dựa trên kết quả trả lời gần nhất của từng mã câu hỏi riêng biệt (tách biệt hoàn toàn giữa Kumite và Kata). Khi bạn trả lời đúng trong lượt ôn mới, câu hỏi sẽ chuyển sang trạng thái Đã khắc phục.
              </p>
            </div>

            <div className="wkf-mistakes-practice-launcher">
              <div className="wkf-launcher-field">
                <label htmlFor="wkf-mistake-count-select">
                  Số lượng câu mỗi lượt ôn
                </label>
                <select
                  id="wkf-mistake-count-select"
                  name="mistakeCount"
                  value={String(practiceCount)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPracticeCount(
                      v === "all" ? "all" : (Number(v) as QuestionCountOption)
                    );
                  }}
                >
                  <option value="all">
                    Toàn bộ câu cần ôn ({unresolvedForSelectedCategory.length} câu)
                  </option>
                  <option value="20">Tối đa 20 câu</option>
                  <option value="50">Tối đa 50 câu</option>
                </select>
              </div>

              <button
                type="button"
                className="wkf-btn wkf-btn-red"
                disabled={
                  !hydrated ||
                  unresolvedForSelectedCategory.length === 0 ||
                  startingSession
                }
                onClick={handleStartMistakeSession}
              >
                {startingSession
                  ? "Đang trộn câu hỏi..."
                  : `Luyện tập lại (${unresolvedForSelectedCategory.length} câu)`}
              </button>
            </div>
          </div>

          <div className="wkf-stats-rail">
            <div className="wkf-stat-cell">
              <span className="wkf-stat-label">Đang cần ôn lại</span>
              <strong className="wkf-stat-value wkf-text-red">
                {totalUnresolved}
              </strong>
              <span className="wkf-stat-sub">Lần trả lời gần nhất bị sai</span>
            </div>

            <div className="wkf-stat-cell">
              <span className="wkf-stat-label">Kumite cần ôn</span>
              <strong className="wkf-stat-value">{kumiteUnresolved}</strong>
              <span className="wkf-stat-sub">Thuộc bộ đề Kumite (246 câu)</span>
            </div>

            <div className="wkf-stat-cell">
              <span className="wkf-stat-label">Kata &amp; Para Karate cần ôn</span>
              <strong className="wkf-stat-value">{kataUnresolved}</strong>
              <span className="wkf-stat-sub">Thuộc bộ đề Kata (132 câu)</span>
            </div>

            <div className="wkf-stat-cell">
              <span className="wkf-stat-label">Đã khắc phục</span>
              <strong className="wkf-stat-value wkf-text-correct">
                {totalResolved}
              </strong>
              <span className="wkf-stat-sub">Lần trả lời gần nhất đã đúng</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="wkf-alert wkf-alert-error" role="alert">
            <strong>Lỗi:</strong> {errorMsg}
          </div>
        )}

        {/* Filter Controls */}
        <div className="wkf-mistakes-toolbar">
          <div
            className="wkf-filter-pills"
            role="group"
            aria-label="Lọc theo bộ đề"
          >
            <button
              type="button"
              className={`wkf-filter-btn ${
                categoryFilter === "all" ? "is-active" : ""
              }`}
              onClick={() => setCategoryFilter("all")}
            >
              Tất cả bộ đề
            </button>
            <button
              type="button"
              className={`wkf-filter-btn ${
                categoryFilter === "kumite" ? "is-active" : ""
              }`}
              onClick={() => setCategoryFilter("kumite")}
            >
              Kumite ({kumiteUnresolved} cần ôn)
            </button>
            <button
              type="button"
              className={`wkf-filter-btn ${
                categoryFilter === "kata" ? "is-active" : ""
              }`}
              onClick={() => setCategoryFilter("kata")}
            >
              Kata &amp; Para Karate ({kataUnresolved} cần ôn)
            </button>
          </div>

          <div
            className="wkf-filter-pills"
            role="group"
            aria-label="Lọc theo trạng thái khắc phục"
          >
            <button
              type="button"
              className={`wkf-filter-btn ${
                statusFilter === "unresolved" ? "is-active" : ""
              }`}
              onClick={() => setStatusFilter("unresolved")}
            >
              ✕ Cần ôn lại ({totalUnresolved})
            </button>
            <button
              type="button"
              className={`wkf-filter-btn ${
                statusFilter === "resolved" ? "is-active" : ""
              }`}
              onClick={() => setStatusFilter("resolved")}
            >
              ✓ Đã khắc phục ({totalResolved})
            </button>
            <button
              type="button"
              className={`wkf-filter-btn ${
                statusFilter === "all" ? "is-active" : ""
              }`}
              onClick={() => setStatusFilter("all")}
            >
              Tất cả lịch sử ({allMistakes.length})
            </button>
          </div>
        </div>

        {/* Mistake Items List */}
        {!hydrated ? (
          <div className="wkf-loading-box" aria-live="polite">
            Đang tải danh sách câu trả lời sai...
          </div>
        ) : filteredMistakes.length === 0 ? (
          <div className="wkf-empty-box">
            <div className="wkf-empty-code">✓</div>
            <h3>
              {allMistakes.length === 0
                ? "Chưa có câu trả lời sai nào được ghi nhận"
                : "Không có câu hỏi nào trong mục lọc hiện tại"}
            </h3>
            <p>
              {allMistakes.length === 0
                ? "Khi bạn làm bài Luyện tập hoặc Thi thử và trả lời sai, câu hỏi sẽ tự động xuất hiện tại đây để bạn ôn tập lại."
                : "Bạn đã khắc phục hết các câu sai trong nhóm này hoặc có thể chuyển bộ lọc để xem lịch sử các câu đã khắc phục."}
            </p>
            <div className="wkf-empty-actions">
              <Link href="/wkf-exam/kumite" className="wkf-btn wkf-btn-red">
                Luyện bộ đề Kumite
              </Link>
              <Link href="/wkf-exam/kata" className="wkf-btn wkf-btn-blue">
                Luyện bộ đề Kata &amp; Para Karate
              </Link>
            </div>
          </div>
        ) : (
          <div className="wkf-review-list">
            {filteredMistakes.map((item, idx) => {
              const verifiedVi =
                item.translationVerified && item.textVi ? item.textVi : null;
              const requestedLang: ExamLanguage =
                questionLangOverrides[item.key] ?? (verifiedVi ? "vi" : "en");
              const effectiveLang: ExamLanguage =
                requestedLang === "vi" && verifiedVi ? "vi" : "en";
              const displayedText =
                effectiveLang === "vi" && verifiedVi ? verifiedVi : item.textEn;

              return (
                <article
                  key={item.key}
                  className={`wkf-review-item ${
                    item.resolved ? "is-correct" : "is-wrong"
                  }`}
                >
                  <div className="wkf-review-item-head">
                    <div className="wkf-review-item-meta">
                      <span className="wkf-badge-solid">
                        {item.category === "kumite"
                          ? "KUMITE"
                          : "KATA & PARA KARATE"}
                      </span>
                      <strong className="wkf-review-pos">
                        Câu {idx + 1}
                      </strong>
                    </div>

                    <div className="wkf-review-item-right">
                      {verifiedVi && (
                        <button
                          type="button"
                          className="wkf-tool-btn wkf-translate-btn"
                          onClick={() =>
                            setQuestionLangOverrides((prev) => ({
                              ...prev,
                              [item.key]:
                                effectiveLang === "vi" ? "en" : "vi",
                            }))
                          }
                        >
                          {effectiveLang === "vi"
                            ? "Dịch sang tiếng Anh"
                            : "Dịch sang tiếng Việt"}
                        </button>
                      )}
                      <span
                        className={`wkf-status-tag ${
                          item.resolved ? "is-correct" : "is-wrong"
                        }`}
                      >
                        {item.resolved ? "✓ Đã khắc phục" : "✕ Cần ôn lại"}
                      </span>
                    </div>
                  </div>

                  <p
                    className="wkf-review-question-en"
                    lang={effectiveLang === "vi" ? "vi" : "en"}
                  >
                    {displayedText}
                  </p>

                  <div className="wkf-mistake-item-footer">
                    <span>
                      Số lần trả lời sai: <strong>{item.wrongCount}</strong> · Số
                      lần khắc phục đúng: <strong>{item.correctCount}</strong>
                    </span>
                    <span>
                      Lần làm gần nhất:{" "}
                      <time dateTime={item.lastAnsweredAt}>
                        {formatDateTimeVi(item.lastAnsweredAt)}
                      </time>
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
