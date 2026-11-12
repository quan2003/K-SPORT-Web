"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  computeLearnerProgressOverview,
  getLastAttemptForScope,
  getOrCreateLocalOwnerId,
  listLocalAttemptsSorted,
  saveLocalAttempt,
  useIsClientHydrated,
} from "@/lib/wkf-exam/client-storage";
import type { CategoryMetadata, ExamAttempt, ExamCategory } from "@/lib/wkf-exam/types";

type Props = {
  categories: Record<ExamCategory, CategoryMetadata>;
  bankVersion?: string;
  authenticatedUserName?: string | null;
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

function formatCategoryLabel(cat: ExamCategory | "mixed") {
  if (cat === "kumite") return "KUMITE";
  if (cat === "kata") return "KATA & PARA KARATE";
  return "TỔNG HỢP KUMITE & KATA";
}

function formatModeLabel(mode: ExamAttempt["mode"]) {
  if (mode === "exam") return "Thi thử";
  if (mode === "mistakes") return "Ôn câu sai";
  return "Luyện tập";
}

export function WkfHomeClient({
  categories,
  authenticatedUserName,
}: Props) {
  const router = useRouter();
  const hydrated = useIsClientHydrated();
  const [startingRetakeId, setStartingRetakeId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const overview = useMemo(
    () => (hydrated ? computeLearnerProgressOverview() : null),
    [hydrated]
  );
  const recentAttempts = useMemo(
    () => (hydrated ? listLocalAttemptsSorted().slice(0, 5) : []),
    [hydrated]
  );

  async function handleRetakeAttempt(prevAttempt: ExamAttempt) {
    setErrorMsg(null);
    setStartingRetakeId(prevAttempt.attemptId);
    try {
      const ownerId = getOrCreateLocalOwnerId();
      const lastScope = getLastAttemptForScope(prevAttempt.category);
      const res = await fetch("/api/wkf-exam/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId,
          category: prevAttempt.category,
          mode: prevAttempt.mode === "mistakes" ? "practice" : prevAttempt.mode,
          language: prevAttempt.language ?? "vi",
          requestedCount: prevAttempt.requestedCount,
          timeLimitMinutes: prevAttempt.timeLimitMinutes,
          previousAttemptId: prevAttempt.attemptId,
          previousOrderIds: lastScope?.questionIds ?? prevAttempt.questionIds,
        }),
      });
      const data = (await res.json()) as { attempt?: ExamAttempt; error?: string };
      if (!res.ok || !data.attempt) {
        throw new Error(data.error || "Không thể khởi tạo lượt thi mới.");
      }
      saveLocalAttempt(data.attempt);
      router.push(`/wkf-exam/practice/${data.attempt.attemptId}`);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo lượt thi lại."
      );
      setStartingRetakeId(null);
    }
  }

  return (
    <div className="wkf-portal-body">
      {/* Section 1: Two WKF Exam Sets (Kumite & Kata) */}
      <section className="wkf-section" aria-labelledby="wkf-sets-heading">
        <div className="wkf-section-head">
          <div>
            <p className="wkf-eyebrow">HAI BỘ ĐỀ LUẬT WKF</p>
            <h2 id="wkf-sets-heading">Chọn bộ đề luyện tập hoặc thi thử</h2>
          </div>
          <p className="wkf-section-note">
            Mỗi lượt làm bài mới tự động chọn và sắp xếp thứ tự câu hỏi độc lập. Không cần đăng nhập để bắt đầu học.
          </p>
        </div>

        <div className="wkf-deck-grid">
          {/* Deck 1: KUMITE */}
          <article className="wkf-deck-panel wkf-deck-kumite">
            <div className="wkf-deck-top">
              <div className="wkf-deck-tag-row">
                <span className="wkf-pill wkf-pill-red">BỘ ĐỀ 01</span>
                <span className="wkf-version-tag">Song ngữ Tiếng Việt · English</span>
              </div>
              <h3>KUMITE</h3>
              <p className="wkf-deck-subtitle">
                Ngân hàng câu hỏi lý thuyết dành cho Trọng tài và Giám định nội dung đối kháng (Kumite) theo bộ câu hỏi WKF.
              </p>
            </div>

            <dl className="wkf-deck-specs">
              <div>
                <dt>Số lượng</dt>
                <dd>{categories.kumite.questionCount} câu</dd>
              </div>
              <div>
                <dt>Định dạng</dt>
                <dd>Câu hỏi Đúng/Sai</dd>
              </div>
              <div>
                <dt>Chế độ</dt>
                <dd>Luyện tập &amp; Thi thử</dd>
              </div>
            </dl>

            <div className="wkf-deck-actions">
              <Link href="/wkf-exam/kumite" className="wkf-btn wkf-btn-red">
                Bắt đầu học
              </Link>
              <Link
                href="/wkf-exam/kumite?mode=exam"
                className="wkf-btn wkf-btn-outline"
              >
                Thi thử Kumite
              </Link>
            </div>
          </article>

          {/* Deck 2: KATA & PARA KARATE */}
          <article className="wkf-deck-panel wkf-deck-kata">
            <div className="wkf-deck-top">
              <div className="wkf-deck-tag-row">
                <span className="wkf-pill wkf-pill-blue">BỘ ĐỀ 02</span>
                <span className="wkf-version-tag">Song ngữ Tiếng Việt · English</span>
              </div>
              <h3>KATA &amp; PARA KARATE</h3>
              <p className="wkf-deck-subtitle">
                Ngân hàng câu hỏi lý thuyết dành cho Giám định nội dung quyền (Kata) và thể thao người khuyết tật (Para Karate).
              </p>
            </div>

            <dl className="wkf-deck-specs">
              <div>
                <dt>Số lượng</dt>
                <dd>{categories.kata.questionCount} câu</dd>
              </div>
              <div>
                <dt>Định dạng</dt>
                <dd>Câu hỏi Đúng/Sai</dd>
              </div>
              <div>
                <dt>Chế độ</dt>
                <dd>Luyện tập &amp; Thi thử</dd>
              </div>
            </dl>

            <div className="wkf-deck-actions">
              <Link href="/wkf-exam/kata" className="wkf-btn wkf-btn-blue">
                Bắt đầu học
              </Link>
              <Link
                href="/wkf-exam/kata?mode=exam"
                className="wkf-btn wkf-btn-outline"
              >
                Thi thử Kata
              </Link>
            </div>
          </article>
        </div>
      </section>

      {errorMsg && (
        <div className="wkf-alert wkf-alert-error" role="alert">
          <strong>Thông báo lỗi:</strong> {errorMsg}
        </div>
      )}

      {/* Section 2: In-progress attempts (if any) */}
      {hydrated && overview && overview.inProgressAttempts.length > 0 && (
        <section className="wkf-section" aria-labelledby="wkf-resume-heading">
          <div className="wkf-section-head">
            <div>
              <p className="wkf-eyebrow">TIẾP TỤC HỌC</p>
              <h2 id="wkf-resume-heading">Bài đang làm dở</h2>
            </div>
          </div>

          <div className="wkf-resume-list">
            {overview.inProgressAttempts.slice(0, 3).map((att) => {
              const answeredCount = Object.keys(att.answers).length;
              const totalCount = att.questionIds.length;
              return (
                <article key={att.attemptId} className="wkf-resume-row">
                  <div className="wkf-resume-info">
                    <div className="wkf-resume-badges">
                      <span className="wkf-badge-solid">
                        {formatCategoryLabel(att.category)}
                      </span>
                      <span className="wkf-badge-muted">
                        {formatModeLabel(att.mode)}
                      </span>
                    </div>
                    <h3>
                      Đã trả lời {answeredCount} / {totalCount} câu (Đang ở câu{" "}
                      {att.currentIndex + 1})
                    </h3>
                    <p>
                      Bắt đầu lúc {formatDateTimeVi(att.startedAt)} · Giữ nguyên thứ tự câu hỏi và các lựa chọn đã lưu.
                    </p>
                  </div>
                  <div className="wkf-resume-actions">
                    <Link
                      href={`/wkf-exam/practice/${att.attemptId}`}
                      className="wkf-btn wkf-btn-red"
                    >
                      Tiếp tục bài làm
                    </Link>
                    <button
                      type="button"
                      className="wkf-btn wkf-btn-outline"
                      disabled={startingRetakeId === att.attemptId}
                      onClick={() => handleRetakeAttempt(att)}
                    >
                      {startingRetakeId === att.attemptId ? "Đang tạo..." : "Thi lại"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 3: Study Progress, Latest Exam, Mistake Review & History */}
      <section className="wkf-section" aria-labelledby="wkf-progress-heading">
        <div className="wkf-section-head">
          <div>
            <p className="wkf-eyebrow">THEO DÕI HỌC TẬP</p>
            <h2 id="wkf-progress-heading">Tiến độ, câu sai &amp; lịch sử làm bài</h2>
          </div>
          <div className="wkf-storage-badge">
            {authenticatedUserName ? (
              <span>
                Tài khoản phiên làm việc: <strong>{authenticatedUserName}</strong> (Lưu trên trình duyệt &amp; phiên máy chủ)
              </span>
            ) : (
              <span>
                Trạng thái lưu trữ: <strong>Lưu cục bộ trên thiết bị này</strong> (Chưa đăng nhập tài khoản)
              </span>
            )}
          </div>
        </div>

        {!hydrated ? (
          <div className="wkf-loading-box" aria-live="polite">
            Đang tải dữ liệu tiến độ học tập trên thiết bị...
          </div>
        ) : overview && overview.totalAttempts === 0 ? (
          <div className="wkf-empty-box">
            <div className="wkf-empty-code">0 / 378</div>
            <h3>Chưa có dữ liệu luyện tập hoặc thi thử</h3>
            <p>
              Bạn chưa thực hiện lượt làm bài nào trên thiết bị này. Chọn bộ đề{" "}
              <strong>Kumite (246 câu)</strong> hoặc{" "}
              <strong>Kata &amp; Para Karate (132 câu)</strong> phía trên để bắt đầu học ngay mà không cần đăng nhập.
            </p>
            <div className="wkf-empty-actions">
              <Link href="/wkf-exam/kumite" className="wkf-btn wkf-btn-red">
                Bắt đầu học Kumite
              </Link>
              <Link href="/wkf-exam/kata" className="wkf-btn wkf-btn-blue">
                Bắt đầu học Kata &amp; Para Karate
              </Link>
            </div>
          </div>
        ) : (
          overview && (
            <>
              <div className="wkf-stats-rail">
                <div className="wkf-stat-cell">
                  <span className="wkf-stat-label">Số câu đã học</span>
                  <strong className="wkf-stat-value">
                    {overview.uniqueQuestionsStudied} <small>/ 378</small>
                  </strong>
                  <span className="wkf-stat-sub">
                    Kumite: {overview.kumiteQuestionsStudied}/246 · Kata:{" "}
                    {overview.kataQuestionsStudied}/132
                  </span>
                </div>

                <div className="wkf-stat-cell">
                  <span className="wkf-stat-label">Lượt thi đã hoàn thành</span>
                  <strong className="wkf-stat-value">
                    {overview.completedAttemptsCount}
                  </strong>
                  <span className="wkf-stat-sub">
                    Tổng số lượt khởi tạo: {overview.totalAttempts}
                  </span>
                </div>

                <div className="wkf-stat-cell">
                  <span className="wkf-stat-label">Độ chính xác trung bình</span>
                  <strong className="wkf-stat-value">
                    {overview.averageAccuracyPercent !== null
                      ? `${overview.averageAccuracyPercent}%`
                      : "—"}
                  </strong>
                  <span className="wkf-stat-sub">
                    Tính trên các lượt đã nộp bài
                  </span>
                </div>

                <div className="wkf-stat-cell">
                  <span className="wkf-stat-label">Câu sai cần ôn lại</span>
                  <strong className="wkf-stat-value wkf-text-red">
                    {overview.unresolvedMistakesCount}
                  </strong>
                  <span className="wkf-stat-sub">
                    Đã khắc phục: {overview.resolvedMistakesCount} câu
                  </span>
                </div>
              </div>

              <div className="wkf-dashboard-split">
                {/* Left: Latest Completed Attempt */}
                <div className="wkf-panel-box">
                  <div className="wkf-panel-head">
                    <h3>Lần thi hoàn thành gần nhất</h3>
                    <Link href="/wkf-exam/history" className="wkf-text-link">
                      Xem toàn bộ lịch sử →
                    </Link>
                  </div>

                  {overview.latestCompletedAttempt &&
                  overview.latestCompletedAttempt.result ? (
                    <div className="wkf-latest-card">
                      <div className="wkf-latest-meta">
                        <span className="wkf-badge-solid">
                          {formatCategoryLabel(
                            overview.latestCompletedAttempt.category
                          )}
                        </span>
                        <span className="wkf-badge-muted">
                          {formatModeLabel(overview.latestCompletedAttempt.mode)}
                        </span>
                        <time dateTime={overview.latestCompletedAttempt.completedAt || ""}>
                          {formatDateTimeVi(
                            overview.latestCompletedAttempt.completedAt ||
                              overview.latestCompletedAttempt.startedAt
                          )}
                        </time>
                      </div>

                      <div className="wkf-latest-score-row">
                        <div>
                          <span className="wkf-score-big">
                            {overview.latestCompletedAttempt.result.accuracyPercent}%
                          </span>
                          <span className="wkf-score-caption">Tỷ lệ trả lời đúng</span>
                        </div>
                        <dl className="wkf-latest-breakdown">
                          <div>
                            <dt>Đúng</dt>
                            <dd className="wkf-text-correct">
                              ✓ {overview.latestCompletedAttempt.result.correctCount}
                            </dd>
                          </div>
                          <div>
                            <dt>Sai</dt>
                            <dd className="wkf-text-wrong">
                              ✕ {overview.latestCompletedAttempt.result.wrongCount}
                            </dd>
                          </div>
                          <div>
                            <dt>Chưa trả lời</dt>
                            <dd>
                              — {overview.latestCompletedAttempt.result.unansweredCount}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div className="wkf-latest-actions">
                        <Link
                          href={`/wkf-exam/results/${overview.latestCompletedAttempt.attemptId}`}
                          className="wkf-btn wkf-btn-blue"
                        >
                          Xem đáp án
                        </Link>
                        <button
                          type="button"
                          className="wkf-btn wkf-btn-outline"
                          disabled={
                            startingRetakeId ===
                            overview.latestCompletedAttempt.attemptId
                          }
                          onClick={() =>
                            overview.latestCompletedAttempt &&
                            handleRetakeAttempt(overview.latestCompletedAttempt)
                          }
                        >
                          Thi lại
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="wkf-muted-note">
                      Bạn có lượt làm bài đang diễn ra nhưng chưa nộp bài hoàn tất.
                    </p>
                  )}
                </div>

                {/* Right: Mistake Review Callout */}
                <div className="wkf-panel-box">
                  <div className="wkf-panel-head">
                    <h3>Ôn lại câu sai</h3>
                    <Link href="/wkf-exam/mistakes" className="wkf-text-link">
                      Mở danh sách câu sai →
                    </Link>
                  </div>

                  <p className="wkf-panel-copy">
                    Hệ thống tự động ghi nhận từng câu trả lời sai theo mã câu hỏi và bộ đề. Khi bạn trả lời đúng trong lượt ôn tiếp theo, câu hỏi sẽ chuyển sang trạng thái đã khắc phục.
                  </p>

                  <dl className="wkf-mistake-summary">
                    <div>
                      <dt>Kumite cần ôn</dt>
                      <dd>{overview.unresolvedKumiteMistakesCount} câu</dd>
                    </div>
                    <div>
                      <dt>Kata &amp; Para Karate cần ôn</dt>
                      <dd>{overview.unresolvedKataMistakesCount} câu</dd>
                    </div>
                    <div>
                      <dt>Đã khắc phục</dt>
                      <dd>{overview.resolvedMistakesCount} câu</dd>
                    </div>
                  </dl>

                  <div className="wkf-latest-actions">
                    <Link href="/wkf-exam/mistakes" className="wkf-btn wkf-btn-red">
                      Ôn câu sai ({overview.unresolvedMistakesCount})
                    </Link>
                    <Link
                      href="/wkf-exam/history"
                      className="wkf-btn wkf-btn-outline"
                    >
                      Lịch sử làm bài
                    </Link>
                  </div>
                </div>
              </div>

              {/* Recent attempts table */}
              {recentAttempts.length > 0 && (
                <div className="wkf-recent-table-wrap">
                  <div className="wkf-panel-head">
                    <h3>Lịch sử làm bài gần đây</h3>
                    <Link href="/wkf-exam/history" className="wkf-text-link">
                      Xem tất cả ({overview.totalAttempts}) →
                    </Link>
                  </div>

                  <table className="wkf-table">
                    <thead>
                      <tr>
                        <th scope="col">Thời gian</th>
                        <th scope="col">Bộ đề</th>
                        <th scope="col">Chế độ</th>
                        <th scope="col">Số câu</th>
                        <th scope="col">Trạng thái / Kết quả</th>
                        <th scope="col">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAttempts.map((att) => (
                        <tr key={att.attemptId}>
                          <td>
                            <time dateTime={att.startedAt}>
                              {formatDateTimeVi(att.startedAt)}
                            </time>
                          </td>
                          <td>
                            <strong>{formatCategoryLabel(att.category)}</strong>
                          </td>
                          <td>{formatModeLabel(att.mode)}</td>
                          <td>{att.questionIds.length} câu</td>
                          <td>
                            {att.status === "completed" && att.result ? (
                              <span>
                                <strong>{att.result.accuracyPercent}%</strong> (✓{" "}
                                {att.result.correctCount} / ✕ {att.result.wrongCount})
                              </span>
                            ) : (
                              <span className="wkf-status-pending">
                                Đang làm dở ({Object.keys(att.answers).length}/
                                {att.questionIds.length})
                              </span>
                            )}
                          </td>
                          <td className="wkf-table-actions">
                            {att.status === "completed" ? (
                              <Link
                                href={`/wkf-exam/results/${att.attemptId}`}
                                className="wkf-text-link"
                              >
                                Xem kết quả
                              </Link>
                            ) : (
                              <Link
                                href={`/wkf-exam/practice/${att.attemptId}`}
                                className="wkf-text-link"
                              >
                                Tiếp tục
                              </Link>
                            )}
                            <button
                              type="button"
                              className="wkf-inline-btn"
                              disabled={startingRetakeId === att.attemptId}
                              onClick={() => handleRetakeAttempt(att)}
                            >
                              Thi lại
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )
        )}
      </section>
    </div>
  );
}
