"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  getLastAttemptForScope,
  getOrCreateLocalOwnerId,
  listLocalAttemptsSorted,
  listMistakesByFilter,
  saveLocalAttempt,
  useIsClientHydrated,
} from "@/lib/wkf-exam/client-storage";
import type {
  CategoryMetadata,
  ExamAttempt,
  ExamLanguage,
  ExamMode,
  QuestionCountOption,
} from "@/lib/wkf-exam/types";

type Props = {
  categoryMeta: CategoryMetadata;
  initialMode?: "practice" | "exam";
  initialLanguage?: ExamLanguage;
};

const COUNT_OPTIONS: Array<{
  value: QuestionCountOption;
  labelVi: string;
  labelEn: string;
  descVi: string;
  descEn: string;
}> = [
  {
    value: 20,
    labelVi: "20 câu",
    labelEn: "20 questions",
    descVi: "Lượt ôn nhanh 10–15 phút",
    descEn: "Quick 10–15 min session",
  },
  {
    value: 50,
    labelVi: "50 câu",
    labelEn: "50 questions",
    descVi: "Lượt luyện tiêu chuẩn",
    descEn: "Standard practice set",
  },
  {
    value: 100,
    labelVi: "100 câu",
    labelEn: "100 questions",
    descVi: "Luyện chuyên sâu cường độ cao",
    descEn: "Intensive study session",
  },
  {
    value: "all",
    labelVi: "Toàn bộ bộ đề",
    labelEn: "All questions",
    descVi: "Tất cả câu hỏi trong bộ đề",
    descEn: "Full category question bank",
  },
];

const TIMER_OPTIONS: Array<{
  value: number | null;
  labelVi: string;
  labelEn: string;
}> = [
  { value: null, labelVi: "Không giới hạn thời gian", labelEn: "No time limit" },
  { value: 15, labelVi: "15 phút", labelEn: "15 minutes" },
  { value: 30, labelVi: "30 phút", labelEn: "30 minutes" },
  { value: 45, labelVi: "45 phút", labelEn: "45 minutes" },
  { value: 60, labelVi: "60 phút", labelEn: "60 minutes" },
];

export function QuizConfigView({
  categoryMeta,
  initialMode = "practice",
  initialLanguage = "vi",
}: Props) {
  const router = useRouter();
  const hydrated = useIsClientHydrated();
  const [mode, setMode] = useState<ExamMode>(initialMode);
  const [language, setLanguage] = useState<ExamLanguage>(initialLanguage);
  const [requestedCount, setRequestedCount] = useState<QuestionCountOption>(20);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inProgressForCat = useMemo(() => {
    if (!hydrated) return [];
    const all = listLocalAttemptsSorted();
    return all.filter(
      (a) => a.category === categoryMeta.id && a.status === "in_progress"
    );
  }, [hydrated, categoryMeta.id]);

  const unresolvedMistakesCount = useMemo(() => {
    if (!hydrated) return 0;
    return listMistakesByFilter({
      category: categoryMeta.id,
      status: "unresolved",
    }).length;
  }, [hydrated, categoryMeta.id]);

  async function handleStartSession(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const ownerId = getOrCreateLocalOwnerId();
      const lastAttempt = getLastAttemptForScope(categoryMeta.id);

      const res = await fetch("/api/wkf-exam/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId,
          category: categoryMeta.id,
          mode,
          language,
          requestedCount,
          timeLimitMinutes: mode === "exam" ? timeLimitMinutes : null,
          previousAttemptId: lastAttempt?.attemptId ?? null,
          previousOrderIds: lastAttempt?.questionIds ?? undefined,
        }),
      });

      const data = (await res.json()) as {
        attempt?: ExamAttempt;
        error?: string;
      };

      if (!res.ok || !data.attempt) {
        throw new Error(data.error || "Không thể tạo lượt làm bài.");
      }

      saveLocalAttempt(data.attempt);
      router.push(`/wkf-exam/practice/${data.attempt.attemptId}`);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi khởi tạo bài làm."
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="wkf-portal-body">
      <section className="wkf-section" aria-labelledby="wkf-config-heading">
        <div className="wkf-config-grid">
          {/* Left column: Form Configuration */}
          <form className="wkf-config-form" onSubmit={handleStartSession}>
            {/* Step 1: Select Mode */}
            <div className="wkf-config-step">
              <div className="wkf-step-header">
                <span className="wkf-step-num">01</span>
                <div>
                  <h2 id="wkf-config-heading">Chọn chế độ làm bài</h2>
                  <p>
                    Lựa chọn giữa chế độ học có phản hồi đáp án từng câu hoặc chế độ thi thử mô phỏng.
                  </p>
                </div>
              </div>

              <div
                className="wkf-mode-selector"
                role="radiogroup"
                aria-label="Chế độ làm bài"
              >
                <label
                  className={`wkf-mode-option ${
                    mode === "practice" ? "is-selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="examMode"
                    value="practice"
                    checked={mode === "practice"}
                    onChange={() => setMode("practice")}
                  />
                  <div className="wkf-mode-option-head">
                    <strong>Chế độ Luyện tập</strong>
                    <span className="wkf-mode-tag">Luyện tập</span>
                  </div>
                  <p>
                    Ghi nhận lựa chọn và kiểm tra kết quả ngay sau mỗi câu. Không tự động chuyển câu khi vừa chọn đáp án.
                  </p>
                </label>

                <label
                  className={`wkf-mode-option ${
                    mode === "exam" ? "is-selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="examMode"
                    value="exam"
                    checked={mode === "exam"}
                    onChange={() => setMode("exam")}
                  />
                  <div className="wkf-mode-option-head">
                    <strong>Chế độ Thi thử</strong>
                    <span className="wkf-mode-tag">Thi thử</span>
                  </div>
                  <p>
                    Không hiển thị đáp án đúng trong lúc làm bài. Cho phép chuyển câu, đổi lựa chọn và đánh dấu câu cần xem lại trước khi nộp bài.
                  </p>
                </label>
              </div>
            </div>

            {/* Step 2: Select Language (Required by Section 3) */}
            <div className="wkf-config-step">
              <div className="wkf-step-header">
                <span className="wkf-step-num">02</span>
                <div>
                  <h2>Chọn ngôn ngữ làm bài</h2>
                  <p>
                    Chọn ngôn ngữ mặc định hiển thị cho câu hỏi và thông báo. Bạn vẫn có thể bấm nút dịch trực tiếp trên từng câu trong lúc làm bài.
                  </p>
                </div>
              </div>

              <div
                className="wkf-mode-selector"
                role="radiogroup"
                aria-label="Chọn ngôn ngữ làm bài"
              >
                <label
                  className={`wkf-mode-option ${
                    language === "vi" ? "is-selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="examLanguage"
                    value="vi"
                    checked={language === "vi"}
                    onChange={() => setLanguage("vi")}
                  />
                  <div className="wkf-mode-option-head">
                    <strong>Tiếng Việt</strong>
                    <span className="wkf-mode-tag">VN</span>
                  </div>
                  <p>
                    Hiển thị toàn bộ câu hỏi, nhãn giao diện và kết quả bằng tiếng Việt (giữ nguyên thuật ngữ chuyên môn WKF).
                  </p>
                </label>

                <label
                  className={`wkf-mode-option ${
                    language === "en" ? "is-selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="examLanguage"
                    value="en"
                    checked={language === "en"}
                    onChange={() => setLanguage("en")}
                  />
                  <div className="wkf-mode-option-head">
                    <strong>English</strong>
                    <span className="wkf-mode-tag">EN</span>
                  </div>
                  <p>
                    Hiển thị nội dung câu hỏi bằng tiếng Anh gốc WKF; nhãn câu hỏi, thông báo và phản hồi sử dụng tiếng Anh.
                  </p>
                </label>
              </div>
            </div>

            {/* Step 3: Select Question Count */}
            <div className="wkf-config-step">
              <div className="wkf-step-header">
                <span className="wkf-step-num">03</span>
                <div>
                  <h2>Chọn số lượng câu hỏi</h2>
                  <p>
                    Hệ thống chọn ngẫu nhiên không trùng lặp từ {categoryMeta.questionCount} câu của bộ đề {categoryMeta.title}.
                  </p>
                </div>
              </div>

              <div
                className="wkf-count-grid"
                role="radiogroup"
                aria-label="Số lượng câu hỏi"
              >
                {COUNT_OPTIONS.map((opt) => {
                  const effectiveCount =
                    opt.value === "all"
                      ? categoryMeta.questionCount
                      : Math.min(opt.value, categoryMeta.questionCount);
                  const isSelected = requestedCount === opt.value;

                  return (
                    <label
                      key={String(opt.value)}
                      className={`wkf-count-option ${
                        isSelected ? "is-selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="questionCount"
                        value={String(opt.value)}
                        checked={isSelected}
                        onChange={() => setRequestedCount(opt.value)}
                      />
                      <strong>
                        {opt.value === "all"
                          ? `Toàn bộ (${categoryMeta.questionCount} câu)`
                          : `${effectiveCount} câu`}
                      </strong>
                      <span>{language === "en" ? opt.descEn : opt.descVi}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {mode === "exam" && (
              <div className="wkf-config-step">
                <div className="wkf-step-header">
                  <span className="wkf-step-num">04</span>
                  <div>
                    <h2>Giới hạn thời gian (Tùy chọn)</h2>
                    <p>
                      Tùy chọn đồng hồ đếm ngược để rèn tốc độ làm bài. Khi hết giờ, hệ thống sẽ tự động nộp bài.
                    </p>
                  </div>
                </div>

                <div className="wkf-timer-field">
                  <label htmlFor="wkf-time-limit-select">
                    Thời gian làm bài thi thử
                  </label>
                  <select
                    id="wkf-time-limit-select"
                    name="timeLimitMinutes"
                    value={timeLimitMinutes === null ? "none" : String(timeLimitMinutes)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTimeLimitMinutes(val === "none" ? null : Number(val));
                    }}
                  >
                    {TIMER_OPTIONS.map((opt) => (
                      <option
                        key={opt.value === null ? "none" : opt.value}
                        value={opt.value === null ? "none" : String(opt.value)}
                      >
                        {language === "en" ? opt.labelEn : opt.labelVi}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="wkf-alert wkf-alert-error" role="alert">
                <strong>Lỗi:</strong> {errorMsg}
              </div>
            )}

            <div className="wkf-config-submit-bar">
              <button
                type="submit"
                className="wkf-btn wkf-btn-red wkf-btn-large"
                disabled={submitting}
              >
                {submitting
                  ? "Đang khởi tạo đề thi..."
                  : mode === "exam"
                  ? "Bắt đầu Thi thử"
                  : "Bắt đầu Luyện tập"}
              </button>
              <Link href="/wkf-exam" className="wkf-btn wkf-btn-outline">
                Quay lại Tổng quan
              </Link>
            </div>
          </form>

          {/* Right column: Clean Learner Summary & Active Sessions */}
          <aside className="wkf-config-sidebar" aria-label="Thông tin bộ đề">
            <div className="wkf-sidebar-box">
              <h3>Tóm tắt bộ đề {categoryMeta.title}</h3>
              <dl className="wkf-meta-list">
                <div>
                  <dt>Nội dung</dt>
                  <dd>{categoryMeta.titleVi}</dd>
                </div>
                <div>
                  <dt>Tổng số câu hỏi</dt>
                  <dd>{categoryMeta.questionCount} câu Đúng / Sai</dd>
                </div>
                <div>
                  <dt>Ngôn ngữ hỗ trợ</dt>
                  <dd>Song ngữ Tiếng Việt &amp; Tiếng Anh (WKF)</dd>
                </div>
                <div>
                  <dt>Cơ chế tạo đề</dt>
                  <dd>Xáo trộn thứ tự ngẫu nhiên mỗi lượt thi</dd>
                </div>
              </dl>
            </div>

            {inProgressForCat.length > 0 && (
              <div className="wkf-sidebar-box">
                <h3>Bài đang làm dở ({inProgressForCat.length})</h3>
                <p className="wkf-sidebar-copy">
                  Bạn có lượt làm bài {categoryMeta.title} chưa hoàn thành. Tiếp tục để giữ nguyên thứ tự câu hỏi và ngôn ngữ đã chọn.
                </p>
                {inProgressForCat.slice(0, 2).map((att) => (
                  <div key={att.attemptId} className="wkf-mini-attempt">
                    <div>
                      <strong>
                        {att.mode === "exam" ? "Thi thử" : "Luyện tập"} ·{" "}
                        {Object.keys(att.answers).length}/{att.questionIds.length} câu
                      </strong>
                      <span>
                        Đang ở câu {att.currentIndex + 1} ·{" "}
                        {att.language === "en" ? "English" : "Tiếng Việt"}
                      </span>
                    </div>
                    <Link
                      href={`/wkf-exam/practice/${att.attemptId}`}
                      className="wkf-btn wkf-btn-blue"
                    >
                      Tiếp tục
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {unresolvedMistakesCount > 0 && (
              <div className="wkf-sidebar-box">
                <h3>Câu sai cần ôn ({unresolvedMistakesCount})</h3>
                <p className="wkf-sidebar-copy">
                  Bạn có {unresolvedMistakesCount} câu hỏi thuộc bộ đề {categoryMeta.title} trả lời sai ở lần gần nhất.
                </p>
                <Link
                  href={`/wkf-exam/mistakes?category=${categoryMeta.id}`}
                  className="wkf-btn wkf-btn-outline"
                >
                  Ôn câu sai {categoryMeta.title}
                </Link>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
