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
import type { ExamAttempt, ExamCategory } from "@/lib/wkf-exam/types";

type Props = {
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

function formatDurationVi(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${String(secs).padStart(2, "0")}s`;
}

function formatCategoryLabel(cat: ExamCategory | "mixed") {
  if (cat === "kumite") return "KUMITE";
  if (cat === "kata") return "KATA & PARA KARATE";
  return "TỔNG HỢP";
}

function formatModeLabel(mode: ExamAttempt["mode"]) {
  if (mode === "exam") return "Thi thử";
  if (mode === "mistakes") return "Ôn câu sai";
  return "Luyện tập";
}

export function HistoryView({ authenticatedUserName }: Props) {
  const router = useRouter();
  const hydrated = useIsClientHydrated();
  const [categoryFilter, setCategoryFilter] = useState<
    ExamCategory | "mixed" | "all"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "in_progress"
  >("all");
  const [retakingId, setRetakingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const attempts = useMemo(
    () => (hydrated ? listLocalAttemptsSorted() : []),
    [hydrated]
  );
  const overview = useMemo(
    () => (hydrated ? computeLearnerProgressOverview() : null),
    [hydrated]
  );

  const filteredAttempts = useMemo(() => {
    return attempts.filter((att) => {
      if (categoryFilter !== "all" && att.category !== categoryFilter) {
        return false;
      }
      if (statusFilter !== "all" && att.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [attempts, categoryFilter, statusFilter]);

  async function handleRetake(prevAttempt: ExamAttempt) {
    if (retakingId) return;
    setRetakingId(prevAttempt.attemptId);
    setErrorMsg(null);

    try {
      const ownerId = getOrCreateLocalOwnerId();
      const lastScope = getLastAttemptForScope(prevAttempt.category);
      const customPool =
        prevAttempt.mode === "mistakes" ? prevAttempt.questionIds : undefined;

      const res = await fetch("/api/wkf-exam/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId,
          category: prevAttempt.category,
          mode: prevAttempt.mode,
          language: prevAttempt.language ?? "vi",
          requestedCount: prevAttempt.requestedCount,
          timeLimitMinutes: prevAttempt.timeLimitMinutes,
          previousAttemptId: prevAttempt.attemptId,
          previousOrderIds: lastScope?.questionIds ?? prevAttempt.questionIds,
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
      setRetakingId(null);
    }
  }

  return (
    <div className="wkf-portal-body">
      <section className="wkf-section" aria-labelledby="wkf-history-heading">
        <div className="wkf-section-head">
          <div>
            <p className="wkf-eyebrow">TIẾN ĐỘ &amp; LỊCH SỬ</p>
            <h2 id="wkf-history-heading">
              Thống kê quá trình ôn luyện và lịch sử các lượt thi
            </h2>
          </div>
          <div className="wkf-storage-badge">
            {authenticatedUserName ? (
              <span>
                Phiên người dùng: <strong>{authenticatedUserName}</strong> (Lưu trình duyệt &amp; phiên máy chủ)
              </span>
            ) : (
              <span>
                Chế độ: <strong>Lưu cục bộ trên thiết bị</strong> (Chưa đăng nhập tài khoản)
              </span>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="wkf-alert wkf-alert-error" role="alert">
            <strong>Lỗi:</strong> {errorMsg}
          </div>
        )}

        {!hydrated ? (
          <div className="wkf-loading-box" aria-live="polite">
            Đang tải lịch sử các lượt làm bài...
          </div>
        ) : !overview || overview.totalAttempts === 0 ? (
          <div className="wkf-empty-box">
            <div className="wkf-empty-code">0</div>
            <h3>Chưa có lịch sử làm bài trên thiết bị này</h3>
            <p>
              Toàn bộ các lượt Luyện tập, Thi thử và Ôn câu sai của bạn sẽ được lưu lại tại đây kèm thời gian hoàn thành, tỷ lệ đúng và danh sách câu trả lời để bạn xem lại bất cứ lúc nào.
            </p>
            <div className="wkf-empty-actions">
              <Link href="/wkf-exam/kumite" className="wkf-btn wkf-btn-red">
                Bắt đầu học Kumite (246 câu)
              </Link>
              <Link href="/wkf-exam/kata" className="wkf-btn wkf-btn-blue">
                Bắt đầu học Kata &amp; Para Karate (132 câu)
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Overview Rail */}
            <div className="wkf-stats-rail">
              <div className="wkf-stat-cell">
                <span className="wkf-stat-label">Độ phủ ngân hàng câu hỏi</span>
                <strong className="wkf-stat-value">
                  {overview.uniqueQuestionsStudied} <small>/ 378</small>
                </strong>
                <span className="wkf-stat-sub">
                  Kumite: {overview.kumiteQuestionsStudied}/246 · Kata:{" "}
                  {overview.kataQuestionsStudied}/132
                </span>
              </div>

              <div className="wkf-stat-cell">
                <span className="wkf-stat-label">Tổng số lượt làm bài</span>
                <strong className="wkf-stat-value">
                  {overview.totalAttempts}
                </strong>
                <span className="wkf-stat-sub">
                  Hoàn thành: {overview.completedAttemptsCount} · Đang làm:{" "}
                  {overview.inProgressAttempts.length}
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
                  Trên {overview.completedAttemptsCount} lượt đã nộp
                </span>
              </div>

              <div className="wkf-stat-cell">
                <span className="wkf-stat-label">Câu sai cần ôn</span>
                <strong className="wkf-stat-value wkf-text-red">
                  {overview.unresolvedMistakesCount}
                </strong>
                <span className="wkf-stat-sub">
                  Đã khắc phục: {overview.resolvedMistakesCount} câu
                </span>
              </div>
            </div>

            {/* Filters */}
            <div className="wkf-mistakes-toolbar">
              <div
                className="wkf-filter-pills"
                role="group"
                aria-label="Lọc lịch sử theo bộ đề"
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
                  Kumite
                </button>
                <button
                  type="button"
                  className={`wkf-filter-btn ${
                    categoryFilter === "kata" ? "is-active" : ""
                  }`}
                  onClick={() => setCategoryFilter("kata")}
                >
                  Kata &amp; Para Karate
                </button>
              </div>

              <div
                className="wkf-filter-pills"
                role="group"
                aria-label="Lọc lịch sử theo trạng thái"
              >
                <button
                  type="button"
                  className={`wkf-filter-btn ${
                    statusFilter === "all" ? "is-active" : ""
                  }`}
                  onClick={() => setStatusFilter("all")}
                >
                  Tất cả ({attempts.length})
                </button>
                <button
                  type="button"
                  className={`wkf-filter-btn ${
                    statusFilter === "completed" ? "is-active" : ""
                  }`}
                  onClick={() => setStatusFilter("completed")}
                >
                  Đã hoàn thành ({overview.completedAttemptsCount})
                </button>
                <button
                  type="button"
                  className={`wkf-filter-btn ${
                    statusFilter === "in_progress" ? "is-active" : ""
                  }`}
                  onClick={() => setStatusFilter("in_progress")}
                >
                  Đang làm dở ({overview.inProgressAttempts.length})
                </button>
              </div>
            </div>

            {filteredAttempts.length === 0 ? (
              <div className="wkf-empty-box">
                <h3>Không có lượt làm bài nào khớp với bộ lọc</h3>
                <p>Hãy chọn bộ lọc khác để xem danh sách lượt thi.</p>
              </div>
            ) : (
              <div className="wkf-recent-table-wrap">
                <table className="wkf-table">
                  <thead>
                    <tr>
                      <th scope="col">Bắt đầu</th>
                      <th scope="col">Bộ đề</th>
                      <th scope="col">Chế độ</th>
                      <th scope="col">Số câu</th>
                      <th scope="col">Kết quả chấm điểm</th>
                      <th scope="col">Thời lượng</th>
                      <th scope="col">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttempts.map((att) => (
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
                              <strong>{att.result.accuracyPercent}%</strong> · ✓{" "}
                              {att.result.correctCount} đúng · ✕{" "}
                              {att.result.wrongCount} sai · —{" "}
                              {att.result.unansweredCount} trống
                            </span>
                          ) : (
                            <span className="wkf-status-pending">
                              Đang làm dở (Đã chọn{" "}
                              {Object.keys(att.answers).length}/
                              {att.questionIds.length} câu)
                            </span>
                          )}
                        </td>
                        <td>
                          {att.status === "completed" && att.result
                            ? formatDurationVi(att.result.durationSeconds)
                            : "—"}
                        </td>
                        <td className="wkf-table-actions">
                          {att.status === "completed" ? (
                            <Link
                              href={`/wkf-exam/results/${att.attemptId}`}
                              className="wkf-text-link"
                            >
                              Xem đáp án
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
                            disabled={retakingId === att.attemptId}
                            onClick={() => handleRetake(att)}
                          >
                            {retakingId === att.attemptId
                              ? "Đang tạo..."
                              : "Thi lại"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
