"use client";

import { useMemo, useState } from "react";
import type {
  ExamCategory,
  ImportAuditReport,
  QuestionBankPayload,
  VerificationStatus,
  WkfQuestionRecord,
} from "@/lib/wkf-exam/types";

type IntegritySummary = {
  isValid: boolean;
  totalCount: number;
  kumiteCount: number;
  kataCount: number;
  uniqueIdsCount: number;
  missingKumite: number[];
  missingKata: number[];
  languageLeaksCount: number;
  invalidVerifiedCount: number;
  verifiedCount: number;
  unverifiedCount: number;
};

type Props = {
  initialBank: QuestionBankPayload;
  initialAudit: ImportAuditReport;
  initialIntegrity: IntegritySummary;
};

export function AdminWkfManager({
  initialBank,
  initialAudit,
  initialIntegrity,
}: Props) {
  const [bank, setBank] = useState<QuestionBankPayload>(initialBank);
  const [integrity, setIntegrity] = useState<IntegritySummary>(initialIntegrity);
  const [activeTab, setActiveTab] = useState<"questions" | "audit" | "import">(
    "questions"
  );

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ExamCategory | "all">(
    "all"
  );
  const [verificationFilter, setVerificationFilter] = useState<
    VerificationStatus | "all"
  >("all");
  const [answerFilter, setAnswerFilter] = useState<"all" | "true" | "false">(
    "all"
  );
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Editor state
  const [editingQuestion, setEditingQuestion] =
    useState<WkfQuestionRecord | null>(null);
  const [editTextVi, setEditTextVi] = useState("");
  const [editTranslationVerified, setEditTranslationVerified] = useState(false);
  const [editExplanationVi, setEditExplanationVi] = useState("");
  const [editRuleReference, setEditRuleReference] = useState("");
  const [editVerificationStatus, setEditVerificationStatus] =
    useState<VerificationStatus>("verified");
  const [editCorrectAnswer, setEditCorrectAnswer] = useState<boolean>(true);
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Version & batch import state
  const [versionInput, setVersionInput] = useState(initialBank.bankVersion);
  const [batchJsonInput, setBatchJsonInput] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filteredQuestions = useMemo(() => {
    const qLower = searchQuery.trim().toLowerCase();
    return bank.questions.filter((q) => {
      if (categoryFilter !== "all" && q.category !== categoryFilter) {
        return false;
      }
      if (
        verificationFilter !== "all" &&
        q.verificationStatus !== verificationFilter
      ) {
        return false;
      }
      if (answerFilter === "true" && q.correctAnswer !== true) return false;
      if (answerFilter === "false" && q.correctAnswer !== false) return false;

      if (qLower) {
        const matchNum = String(q.questionNumber) === qLower;
        const matchId = q.id.toLowerCase().includes(qLower);
        const matchEn = q.textEn.toLowerCase().includes(qLower);
        const matchVi = (q.textVi || "").toLowerCase().includes(qLower);
        return matchNum || matchId || matchEn || matchVi;
      }
      return true;
    });
  }, [
    answerFilter,
    bank.questions,
    categoryFilter,
    searchQuery,
    verificationFilter,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedQuestions = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, safePage]);

  function openEditor(q: WkfQuestionRecord) {
    setEditingQuestion(q);
    setEditTextVi(q.textVi || "");
    setEditTranslationVerified(q.translationVerified);
    setEditExplanationVi(q.explanationVi || "");
    setEditRuleReference(q.ruleReference || "");
    setEditVerificationStatus(q.verificationStatus);
    setEditCorrectAnswer(q.correctAnswer !== false);
    setStatusMessage(null);
  }

  async function handleSaveQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!editingQuestion || savingQuestion) return;
    setSavingQuestion(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/wkf-exam/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingQuestion.id,
          textVi: editTextVi.trim() || null,
          translationVerified: editTranslationVerified,
          explanationVi: editExplanationVi.trim() || null,
          ruleReference: editRuleReference.trim() || null,
          verificationStatus: editVerificationStatus,
          correctAnswer: editCorrectAnswer,
        }),
      });

      const data = (await res.json()) as {
        question?: WkfQuestionRecord;
        integrity?: IntegritySummary;
        error?: string;
      };

      if (!res.ok || !data.question) {
        throw new Error(data.error || "Không thể lưu cập nhật câu hỏi.");
      }

      const updatedQ = data.question;
      setBank((prev) => ({
        ...prev,
        questions: prev.questions.map((item) =>
          item.id === updatedQ.id ? updatedQ : item
        ),
      }));
      if (data.integrity) {
        setIntegrity(data.integrity);
      }
      setEditingQuestion(updatedQ);
      setStatusMessage({
        type: "success",
        text: `Đã lưu cập nhật cho câu hỏi ${updatedQ.id} (#${updatedQ.questionNumber}).`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Lỗi khi lưu cập nhật câu hỏi.",
      });
    } finally {
      setSavingQuestion(false);
    }
  }

  async function handleUpdateBankVersion(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage(null);
    try {
      const res = await fetch("/api/wkf-exam/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_version",
          bankVersion: versionInput.trim(),
        }),
      });
      const data = (await res.json()) as {
        bankVersion?: string;
        integrity?: IntegritySummary;
        error?: string;
      };
      if (!res.ok || !data.bankVersion) {
        throw new Error(data.error || "Không thể cập nhật phiên bản.");
      }
      setBank((prev) => ({ ...prev, bankVersion: data.bankVersion! }));
      if (data.integrity) setIntegrity(data.integrity);
      setStatusMessage({
        type: "success",
        text: `Đã cập nhật nhãn phiên bản ngân hàng câu hỏi thành: ${data.bankVersion}`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Lỗi khi cập nhật phiên bản.",
      });
    }
  }

  async function handleBatchImport(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage(null);
    try {
      const parsed = JSON.parse(batchJsonInput) as Array<{
        id: string;
        textVi?: string | null;
        translationVerified?: boolean;
        explanationVi?: string | null;
        ruleReference?: string | null;
      }>;
      if (!Array.isArray(parsed)) {
        throw new Error("Dữ liệu JSON phải là một mảng các bản ghi cập nhật.");
      }

      const res = await fetch("/api/wkf-exam/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "batch_update",
          updates: parsed,
        }),
      });

      const data = (await res.json()) as {
        updatedCount?: number;
        integrity?: IntegritySummary;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Không thể nhập dữ liệu hàng loạt.");
      }

      // Refresh full bank from API
      const refreshRes = await fetch("/api/wkf-exam/admin");
      const refreshData = (await refreshRes.json()) as {
        bank?: QuestionBankPayload;
        integrity?: IntegritySummary;
      };
      if (refreshData.bank) setBank(refreshData.bank);
      if (refreshData.integrity) setIntegrity(refreshData.integrity);

      setBatchJsonInput("");
      setStatusMessage({
        type: "success",
        text: `Đã nhập và cập nhật thành công ${data.updatedCount ?? 0} câu hỏi.`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Định dạng JSON không hợp lệ hoặc lỗi máy chủ.",
      });
    }
  }

  const invalidOrUnverifiedRecords = useMemo(
    () =>
      bank.questions.filter(
        (q) =>
          q.verificationStatus !== "verified" ||
          typeof q.correctAnswer !== "boolean"
      ),
    [bank.questions]
  );

  return (
    <div className="wkf-admin-wrap">
      {/* Top Overview Header */}
      <div className="wkf-admin-header">
        <div>
          <p className="wkf-eyebrow">QUẢN TRỊ HỌC LIỆU TRỌNG TÀI</p>
          <h1>Ngân hàng câu hỏi &amp; Bảng đáp án WKF Exam</h1>
          <p className="wkf-section-note">
            Quản lý 378 câu hỏi gốc tiếng Anh (Kumite &amp; Kata/Para Karate), kiểm duyệt bản dịch tiếng Việt, thuyết minh điều khoản luật và đối chiếu phiên bản đáp án.
          </p>
        </div>

        <div className="wkf-admin-version-badge">
          <span>Phiên bản hiện hành</span>
          <strong>{bank.bankVersion}</strong>
        </div>
      </div>

      {/* Summary Cards for the Two Question Sets */}
      <div className="wkf-admin-summary-grid">
        <div className="wkf-admin-stat-box">
          <span className="wkf-stat-label">Bộ đề 01 — KUMITE</span>
          <strong className="wkf-stat-value">{integrity.kumiteCount} câu</strong>
          <p>
            Nguồn: {bank.categories.kumite.questionSourceFile} (Version{" "}
            {bank.categories.kumite.questionSourceVersion}) · Đáp án:{" "}
            {bank.categories.kumite.answerKeyTitle} (T:{" "}
            {bank.categories.kumite.trueCount} / F:{" "}
            {bank.categories.kumite.falseCount})
          </p>
        </div>

        <div className="wkf-admin-stat-box">
          <span className="wkf-stat-label">Bộ đề 02 — KATA &amp; PARA KARATE</span>
          <strong className="wkf-stat-value">{integrity.kataCount} câu</strong>
          <p>
            Nguồn: {bank.categories.kata.questionSourceFile} (Version{" "}
            {bank.categories.kata.questionSourceVersion}) · Đáp án:{" "}
            {bank.categories.kata.answerKeyTitle} (T:{" "}
            {bank.categories.kata.trueCount} / F:{" "}
            {bank.categories.kata.falseCount})
          </p>
        </div>

        <div className="wkf-admin-stat-box">
          <span className="wkf-stat-label">Trạng thái xác minh đáp án</span>
          <strong className="wkf-stat-value wkf-text-correct">
            {integrity.verifiedCount} / {integrity.totalCount}
          </strong>
          <p>
            Chưa xác minh / Cần rà soát:{" "}
            <strong>{integrity.unverifiedCount} câu</strong> · Kiểm tra toàn vẹn:{" "}
            <strong>{integrity.isValid ? "✓ Đạt chuẩn" : "✕ Cần kiểm tra"}</strong>
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`wkf-alert ${
            statusMessage.type === "error"
              ? "wkf-alert-error"
              : "wkf-alert-success"
          }`}
          role="status"
        >
          <strong>
            {statusMessage.type === "error" ? "Lỗi:" : "Thành công:"}
          </strong>{" "}
          {statusMessage.text}
        </div>
      )}

      {/* Admin Sub-tabs */}
      <div className="wkf-admin-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "questions"}
          className={`wkf-admin-tab ${
            activeTab === "questions" ? "is-active" : ""
          }`}
          onClick={() => setActiveTab("questions")}
        >
          Danh sách 378 câu hỏi &amp; Duyệt nội dung
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "audit"}
          className={`wkf-admin-tab ${activeTab === "audit" ? "is-active" : ""}`}
          onClick={() => setActiveTab("audit")}
        >
          Báo cáo kiểm tra dữ liệu &amp; Bản ghi cần rà soát (
          {invalidOrUnverifiedRecords.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "import"}
          className={`wkf-admin-tab ${
            activeTab === "import" ? "is-active" : ""
          }`}
          onClick={() => setActiveTab("import")}
        >
          Quản lý phiên bản &amp; Import cập nhật
        </button>
      </div>

      {/* Tab 1: Question Explorer & Editor */}
      {activeTab === "questions" && (
        <div className="wkf-admin-explorer">
          <div className="wkf-admin-filter-bar">
            <div className="wkf-admin-field">
              <label htmlFor="wkf-admin-search">
                Tìm kiếm số câu, mã hoặc nội dung
              </label>
              <input
                id="wkf-admin-search"
                type="search"
                name="searchQuery"
                placeholder="VD: 110, SHIKKAKU, BUNKAI, kumite-q-001..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="wkf-admin-field">
              <label htmlFor="wkf-admin-cat-select">Bộ đề</label>
              <select
                id="wkf-admin-cat-select"
                name="categoryFilter"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value as ExamCategory | "all");
                  setPage(1);
                }}
              >
                <option value="all">Tất cả (378 câu)</option>
                <option value="kumite">Kumite (246 câu)</option>
                <option value="kata">Kata &amp; Para Karate (132 câu)</option>
              </select>
            </div>

            <div className="wkf-admin-field">
              <label htmlFor="wkf-admin-ver-select">Trạng thái xác minh</label>
              <select
                id="wkf-admin-ver-select"
                name="verificationFilter"
                value={verificationFilter}
                onChange={(e) => {
                  setVerificationFilter(
                    e.target.value as VerificationStatus | "all"
                  );
                  setPage(1);
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="verified">Đã xác minh (Đưa vào chấm điểm)</option>
                <option value="needs_review">Cần rà soát</option>
                <option value="unverified">Chưa xác minh</option>
              </select>
            </div>

            <div className="wkf-admin-field">
              <label htmlFor="wkf-admin-ans-select">Đáp án</label>
              <select
                id="wkf-admin-ans-select"
                name="answerFilter"
                value={answerFilter}
                onChange={(e) => {
                  setAnswerFilter(e.target.value as "all" | "true" | "false");
                  setPage(1);
                }}
              >
                <option value="all">Tất cả (True &amp; False)</option>
                <option value="true">✓ Đúng (True)</option>
                <option value="false">✕ Sai (False)</option>
              </select>
            </div>
          </div>

          <div className="wkf-admin-workspace-grid">
            {/* Table of Questions */}
            <div className="wkf-admin-table-col">
              <div className="wkf-recent-table-wrap">
                <table className="wkf-table">
                  <thead>
                    <tr>
                      <th scope="col">Mã / Câu</th>
                      <th scope="col">Nội dung tiếng Anh (WKF) &amp; Bản dịch</th>
                      <th scope="col">Đáp án</th>
                      <th scope="col">Xác minh</th>
                      <th scope="col">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedQuestions.map((q) => (
                      <tr
                        key={q.id}
                        className={
                          editingQuestion?.id === q.id ? "is-selected-row" : ""
                        }
                      >
                        <td>
                          <strong>#{q.questionNumber}</strong>
                          <div className="wkf-table-sub">
                            {q.category === "kumite" ? "Kumite" : "Kata"} · Trang{" "}
                            {q.questionSourcePage}
                          </div>
                        </td>
                        <td>
                          <p className="wkf-admin-q-en" lang="en">
                            {q.textEn}
                          </p>
                          {q.textVi && (
                            <p className="wkf-admin-q-vi">
                              <strong>VI:</strong> {q.textVi}{" "}
                              {q.translationVerified ? (
                                <span className="wkf-tag-verified">
                                  ✓ Đã duyệt dịch
                                </span>
                              ) : (
                                <span className="wkf-tag-draft">Bản nháp</span>
                              )}
                            </p>
                          )}
                        </td>
                        <td>
                          <span
                            className={`wkf-status-tag ${
                              q.correctAnswer ? "is-correct" : "is-wrong"
                            }`}
                          >
                            {q.correctAnswer === true
                              ? "✓ TRUE (T)"
                              : q.correctAnswer === false
                              ? "✕ FALSE (F)"
                              : "—"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`wkf-ver-pill is-${q.verificationStatus}`}
                          >
                            {q.verificationStatus === "verified"
                              ? "Đã xác minh"
                              : q.verificationStatus === "needs_review"
                              ? "Cần rà soát"
                              : "Chưa xác minh"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="wkf-btn wkf-btn-outline"
                            onClick={() => openEditor(q)}
                          >
                            Chỉnh sửa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="wkf-admin-pagination">
                <span>
                  Hiển thị {pagedQuestions.length} / {filteredQuestions.length}{" "}
                  câu hỏi (Trang {safePage} / {totalPages})
                </span>
                <div className="wkf-admin-page-btns">
                  <button
                    type="button"
                    className="wkf-btn wkf-btn-outline"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    ← Trang trước
                  </button>
                  <button
                    type="button"
                    className="wkf-btn wkf-btn-outline"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Trang tiếp →
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Question Detail & Editor Panel */}
            <aside className="wkf-admin-editor-col" aria-label="Biên tập câu hỏi">
              {editingQuestion ? (
                <form
                  className="wkf-admin-editor-form"
                  onSubmit={handleSaveQuestion}
                >
                  <div className="wkf-editor-head">
                    <div>
                      <span className="wkf-badge-solid">
                        {editingQuestion.category.toUpperCase()} #
                        {editingQuestion.questionNumber}
                      </span>
                      <h3>Biên tập &amp; Rà soát câu hỏi</h3>
                    </div>
                    <button
                      type="button"
                      className="wkf-inline-btn"
                      onClick={() => setEditingQuestion(null)}
                    >
                      ✕ Đóng
                    </button>
                  </div>

                  <div className="wkf-editor-readonly-box">
                    <span className="wkf-stat-label">
                      Nội dung tiếng Anh gốc ({editingQuestion.questionSourceFile}{" "}
                      · Trang {editingQuestion.questionSourcePage})
                    </span>
                    <p lang="en">{editingQuestion.textEn}</p>
                    <small>
                      Nguồn đáp án: {editingQuestion.answerKeySourceTitle} · Độ
                      tin cậy quang học:{" "}
                      {Math.round(editingQuestion.opticalConfidence * 100)}%
                    </small>
                  </div>

                  <div className="wkf-admin-field">
                    <label htmlFor="wkf-edit-answer-select">
                      Đáp án đối chiếu (True / False)
                    </label>
                    <select
                      id="wkf-edit-answer-select"
                      name="correctAnswer"
                      value={editCorrectAnswer ? "true" : "false"}
                      onChange={(e) =>
                        setEditCorrectAnswer(e.target.value === "true")
                      }
                    >
                      <option value="true">✓ Đúng (True — Cột T màu xanh)</option>
                      <option value="false">✕ Sai (False — Cột F màu đỏ)</option>
                    </select>
                  </div>

                  <div className="wkf-admin-field">
                    <label htmlFor="wkf-edit-ver-select">
                      Trạng thái xác minh (Chỉ câu &ldquo;Đã xác minh&rdquo; mới đưa vào chấm điểm)
                    </label>
                    <select
                      id="wkf-edit-ver-select"
                      name="verificationStatus"
                      value={editVerificationStatus}
                      onChange={(e) =>
                        setEditVerificationStatus(
                          e.target.value as VerificationStatus
                        )
                      }
                    >
                      <option value="verified">
                        Đã xác minh (Đủ điều kiện chấm điểm chính thức)
                      </option>
                      <option value="needs_review">
                        Cần rà soát (Tạm ngưng chấm điểm câu này)
                      </option>
                      <option value="unverified">
                        Chưa xác minh (Tạm ngưng chấm điểm câu này)
                      </option>
                    </select>
                  </div>

                  <div className="wkf-admin-field">
                    <label htmlFor="wkf-edit-text-vi">
                      Bản dịch tiếng Việt
                    </label>
                    <textarea
                      id="wkf-edit-text-vi"
                      name="textVi"
                      rows={3}
                      placeholder="Nhập bản dịch tiếng Việt chuẩn thuật ngữ Karate WKF..."
                      value={editTextVi}
                      onChange={(e) => setEditTextVi(e.target.value)}
                    />
                  </div>

                  <label className="wkf-checkbox-row">
                    <input
                      type="checkbox"
                      name="translationVerified"
                      checked={editTranslationVerified}
                      onChange={(e) =>
                        setEditTranslationVerified(e.target.checked)
                      }
                    />
                    <span>
                      Đã kiểm duyệt bản dịch tiếng Việt (Cho phép hiển thị cho người học)
                    </span>
                  </label>

                  <div className="wkf-admin-field">
                    <label htmlFor="wkf-edit-rule-ref">
                      Điều khoản luật tham chiếu (Nếu đã xác minh)
                    </label>
                    <input
                      id="wkf-edit-rule-ref"
                      type="text"
                      name="ruleReference"
                      placeholder="VD: Article 2.4 — WKF Kumite Competition Rules"
                      value={editRuleReference}
                      onChange={(e) => setEditRuleReference(e.target.value)}
                    />
                  </div>

                  <div className="wkf-admin-field">
                    <label htmlFor="wkf-edit-explanation-vi">
                      Giải thích chuyên môn bằng tiếng Việt
                    </label>
                    <textarea
                      id="wkf-edit-explanation-vi"
                      name="explanationVi"
                      rows={3}
                      placeholder="Nhập giải thích dựa trên điều khoản luật chính thức..."
                      value={editExplanationVi}
                      onChange={(e) => setEditExplanationVi(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="wkf-btn wkf-btn-red wkf-btn-block"
                    disabled={savingQuestion}
                  >
                    {savingQuestion ? "Đang lưu..." : "Lưu thay đổi câu hỏi"}
                  </button>

                  {editingQuestion.editHistory &&
                    editingQuestion.editHistory.length > 0 && (
                      <div className="wkf-edit-history-box">
                        <h4>Lịch sử chỉnh sửa câu hỏi này</h4>
                        <ul>
                          {editingQuestion.editHistory.map((log, i) => (
                            <li key={`${log.editedAt}-${i}`}>
                              <strong>{log.editedBy}</strong> ({log.editedAt.slice(0, 16).replace("T", " ")}):{" "}
                              {log.summary}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </form>
              ) : (
                <div className="wkf-editor-placeholder">
                  <h3>Chọn một câu hỏi để biên tập</h3>
                  <p>
                    Bấm nút <strong>Chỉnh sửa</strong> ở bất kỳ dòng câu hỏi nào bên trái để rà soát đáp án, bổ sung bản dịch tiếng Việt đã kiểm duyệt hoặc thêm giải thích điều khoản luật.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      )}

      {/* Tab 2: Data Audit Report & Unverified Records */}
      {activeTab === "audit" && (
        <div className="wkf-admin-audit-panel">
          <div className="wkf-sidebar-box">
            <h3>Báo cáo kiểm toán quy trình nhập liệu (Import Pipeline Audit)</h3>
            <p className="wkf-compat-note">
              {initialAudit.versionCompatibilityNotice}
            </p>

            <div className="wkf-audit-columns">
              <div>
                <h4>Kiểm toán Bộ đề Kumite</h4>
                <dl className="wkf-meta-list">
                  <div>
                    <dt>File PDF câu hỏi</dt>
                    <dd>{initialAudit.kumiteAudit.questionSourceFile}</dd>
                  </div>
                  <div>
                    <dt>Phiên bản PDF</dt>
                    <dd>{initialAudit.kumiteAudit.pdfVersion} ({initialAudit.kumiteAudit.pageCount} trang)</dd>
                  </div>
                  <div>
                    <dt>Số câu trích xuất</dt>
                    <dd>
                      {initialAudit.kumiteAudit.extractedQuestions} /{" "}
                      {initialAudit.kumiteAudit.expectedQuestions}
                    </dd>
                  </div>
                  <div>
                    <dt>Số câu bị thiếu / trùng</dt>
                    <dd>
                      Thiếu: {initialAudit.kumiteAudit.missingNumbers.length} · Trùng:{" "}
                      {initialAudit.kumiteAudit.duplicateNumbers.length}
                    </dd>
                  </div>
                  <div>
                    <dt>Bảng đáp án ảnh</dt>
                    <dd>
                      {initialAudit.kumiteAudit.answerKeyTitle} (True:{" "}
                      {initialAudit.kumiteAudit.trueCount} / False:{" "}
                      {initialAudit.kumiteAudit.falseCount})
                    </dd>
                  </div>
                  <div>
                    <dt>Ô màu không rõ ràng</dt>
                    <dd>{initialAudit.kumiteAudit.ambiguousCells.length} ô</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4>Kiểm toán Bộ đề Kata &amp; Para Karate</h4>
                <dl className="wkf-meta-list">
                  <div>
                    <dt>File PDF câu hỏi</dt>
                    <dd>{initialAudit.kataAudit.questionSourceFile}</dd>
                  </div>
                  <div>
                    <dt>Phiên bản PDF</dt>
                    <dd>{initialAudit.kataAudit.pdfVersion} ({initialAudit.kataAudit.pageCount} trang)</dd>
                  </div>
                  <div>
                    <dt>Số câu trích xuất</dt>
                    <dd>
                      {initialAudit.kataAudit.extractedQuestions} /{" "}
                      {initialAudit.kataAudit.expectedQuestions}
                    </dd>
                  </div>
                  <div>
                    <dt>Số câu bị thiếu / trùng</dt>
                    <dd>
                      Thiếu: {initialAudit.kataAudit.missingNumbers.length} · Trùng:{" "}
                      {initialAudit.kataAudit.duplicateNumbers.length}
                    </dd>
                  </div>
                  <div>
                    <dt>Bảng đáp án ảnh</dt>
                    <dd>
                      {initialAudit.kataAudit.answerKeyTitle} (True:{" "}
                      {initialAudit.kataAudit.trueCount} / False:{" "}
                      {initialAudit.kataAudit.falseCount})
                    </dd>
                  </div>
                  <div>
                    <dt>Ô màu không rõ ràng</dt>
                    <dd>{initialAudit.kataAudit.ambiguousCells.length} ô</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="wkf-sidebar-box">
            <h3>
              Danh sách bản ghi chưa xác minh hoặc cần rà soát (
              {invalidOrUnverifiedRecords.length})
            </h3>
            {invalidOrUnverifiedRecords.length === 0 ? (
              <p className="wkf-muted-note">
                ✓ Toàn bộ 378 câu hỏi và 378 đáp án hiện tại đều đạt trạng thái Đã xác minh từ tài liệu nguồn và không có ô màu mơ hồ.
              </p>
            ) : (
              <table className="wkf-table">
                <thead>
                  <tr>
                    <th scope="col">Mã câu</th>
                    <th scope="col">Bộ đề</th>
                    <th scope="col">Nội dung tiếng Anh</th>
                    <th scope="col">Trạng thái</th>
                    <th scope="col">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {invalidOrUnverifiedRecords.map((q) => (
                    <tr key={q.id}>
                      <td>
                        <strong>#{q.questionNumber}</strong> ({q.id})
                      </td>
                      <td>{q.category.toUpperCase()}</td>
                      <td lang="en">{q.textEn}</td>
                      <td>{q.verificationStatus}</td>
                      <td>
                        <button
                          type="button"
                          className="wkf-btn wkf-btn-outline"
                          onClick={() => {
                            openEditor(q);
                            setActiveTab("questions");
                          }}
                        >
                          Rà soát ngay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Version Management & Batch JSON Import */}
      {activeTab === "import" && (
        <div className="wkf-admin-import-panel">
          <form className="wkf-sidebar-box" onSubmit={handleUpdateBankVersion}>
            <h3>Cập nhật nhãn phiên bản ngân hàng đề</h3>
            <p className="wkf-sidebar-copy">
              Các lượt thi trong lịch sử sẽ giữ nguyên nhãn phiên bản tại thời điểm người học làm bài để đảm bảo tính tương thích lịch sử.
            </p>
            <div className="wkf-admin-field">
              <label htmlFor="wkf-bank-version-input">
                Nhãn phiên bản hiện hành (bankVersion)
              </label>
              <input
                id="wkf-bank-version-input"
                type="text"
                name="bankVersion"
                value={versionInput}
                onChange={(e) => setVersionInput(e.target.value)}
              />
            </div>
            <button type="submit" className="wkf-btn wkf-btn-blue">
              Cập nhật phiên bản
            </button>
          </form>

          <form className="wkf-sidebar-box" onSubmit={handleBatchImport}>
            <h3>Import hàng loạt bản dịch &amp; giải thích (JSON)</h3>
            <p className="wkf-sidebar-copy">
              Dán mảng JSON chứa mã câu hỏi (<code>id</code>), bản dịch tiếng Việt (<code>textVi</code>), trạng thái duyệt (<code>translationVerified</code>) và giải thích luật (<code>explanationVi</code>, <code>ruleReference</code>).
            </p>
            <div className="wkf-admin-field">
              <label htmlFor="wkf-batch-json-textarea">
                Dữ liệu JSON cập nhật
              </label>
              <textarea
                id="wkf-batch-json-textarea"
                name="batchJson"
                rows={7}
                placeholder={`[\n  {\n    "id": "kumite-q-001",\n    "textVi": "Mọi khăn trùm đầu tôn giáo tự nguyện đều có thể được đeo mà không cần sự phê duyệt trước từ WKF.",\n    "translationVerified": true,\n    "ruleReference": "Article 2.2 — WKF Kumite Rules"\n  }\n]`}
                value={batchJsonInput}
                onChange={(e) => setBatchJsonInput(e.target.value)}
              />
            </div>
            <button type="submit" className="wkf-btn wkf-btn-red">
              Thực hiện Import JSON
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

