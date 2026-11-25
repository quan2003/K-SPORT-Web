"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type License = {
  id: string;
  key: string;
  raw_key?: string;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  order_code?: string;
  order_id?: string;
  type: string;
  expiry_date: string;
  max_machines: number;
  activated_machines?: string[];
  status: string;
  notes?: string;
  smart_schedule_enabled?: boolean;
};

type ConfirmAction =
  | { kind: "reset"; license: License }
  | { kind: "revoke"; license: License }
  | { kind: "delete"; license: License }
  | null;

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function parseValidDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatExpiryDate(value?: string): string {
  const date = parseValidDate(value);
  return date ? dateFormatter.format(date) : "—";
}

function getDaysRemaining(expiryDate?: string): number | null {
  const date = parseValidDate(expiryDate);
  if (!date) return null;
  const diffMs = date.getTime() - Date.now();
  return Math.ceil(diffMs / 86_400_000);
}

function getStatusInfo(license: License): { label: string; tone: "active" | "revoked" | "expired" } {
  if (license.status === "revoked") return { label: "Đã khóa", tone: "revoked" };
  const expiry = parseValidDate(license.expiry_date);
  if (license.status === "active" && (!expiry || expiry >= new Date())) {
    return { label: "Hoạt động", tone: "active" };
  }
  return { label: "Hết hạn", tone: "expired" };
}

function getTypeInfo(type: string): { label: string; tone: "tournament" | "yearly" | "trial" } {
  const normalized = type.toLowerCase();
  if (normalized === "tournament" || normalized === "event") return { label: "Giải Đấu", tone: "tournament" };
  if (normalized === "yearly" || normalized === "year") return { label: "Năm", tone: "yearly" };
  return { label: "Dùng Thử", tone: "trial" };
}

function formatShortKey(key: string): string {
  if (key.length <= 22) return key;
  return `${key.slice(0, 18)}…`;
}

export function LicenseManager() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [creating, setCreating] = useState(false);
  const [extendingLicense, setExtendingLicense] = useState<License | null>(null);
  const [extendDays, setExtendDays] = useState("30");
  const [viewingMachines, setViewingMachines] = useState<License | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    type: "tournament",
    days: "30",
    maxMachines: "1",
    notes: "",
    smartScheduleEnabled: false,
  });

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/licenses", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setNotice({ type: "error", text: payload.message || "Không tải được danh sách license." });
        return;
      }
      setLicenses(Array.isArray(payload.licenses) ? payload.licenses : []);
    } catch {
      setNotice({ type: "error", text: "Không thể kết nối máy chủ license." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return licenses;
    return licenses.filter((item) =>
      [item.client_name, item.client_email, item.client_phone, item.key, item.raw_key, item.order_code, item.order_id]
        .some((value) => value?.toLowerCase().includes(needle)),
    );
  }, [licenses, query]);

  async function postLicenseOp(payload: Record<string, unknown>, successFallback: string) {
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setNotice({ type: "error", text: body.message || "Thao tác không thành công." });
        return false;
      }
      setNotice({ type: "success", text: body.message || successFallback });
      await load();
      return true;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = await postLicenseOp(
      {
        op: "create",
        ...form,
        days: Number(form.days),
        maxMachines: Number(form.maxMachines),
      },
      "Đã tạo license mới.",
    );
    if (ok) {
      setCreating(false);
      setForm({
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        type: "tournament",
        days: "30",
        maxMachines: "1",
        notes: "",
        smartScheduleEnabled: false,
      });
    }
  }

  async function handleExtend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!extendingLicense) return;
    const daysNum = Number(extendDays);
    if (!Number.isFinite(daysNum) || daysNum < 1) return;
    const ok = await postLicenseOp(
      {
        op: "extend",
        key: extendingLicense.raw_key || extendingLicense.key,
        days: daysNum,
      },
      `Đã gia hạn thêm ${daysNum} ngày.`,
    );
    if (ok) setExtendingLicense(null);
  }

  async function executeConfirm() {
    if (!confirmAction) return;
    const { kind, license } = confirmAction;
    if (kind === "reset") {
      const ok = await postLicenseOp(
        { op: "reset", key: license.raw_key || license.key },
        "Đã reset danh sách máy kích hoạt.",
      );
      if (ok) setConfirmAction(null);
      return;
    }
    if (kind === "revoke") {
      const ok = await postLicenseOp(
        { op: "revoke", key: license.raw_key || license.key },
        "Đã khóa / thu hồi license.",
      );
      if (ok) setConfirmAction(null);
      return;
    }
    // delete
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/licenses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: license.id }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setNotice({ type: "error", text: body.message || "Không thể xóa license." });
        return;
      }
      setNotice({ type: "success", text: body.message || "Đã xóa license." });
      setConfirmAction(null);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopyKey(license: License) {
    const raw = license.raw_key || license.key;
    try {
      await navigator.clipboard.writeText(raw);
      setCopiedId(license.id);
      setNotice({ type: "success", text: "Đã sao chép License Key vào khay nhớ tạm." });
      setTimeout(() => setCopiedId((prev) => (prev === license.id ? null : prev)), 2000);
    } catch {
      setNotice({ type: "error", text: "Trình duyệt không cho phép sao chép tự động." });
    }
  }

  function handleDownloadKey(license: License) {
    const raw = license.raw_key || license.key;
    const content = [
      "K-SPORT LICENSE KEY",
      `Khach hang: ${license.client_name || "Khach le"}`,
      `Email/SDT: ${license.client_email || license.client_phone || "-"}`,
      `Loai: ${getTypeInfo(license.type).label}`,
      `Het han: ${formatExpiryDate(license.expiry_date)}`,
      `Key: ${raw}`,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ksport-license-${(license.order_code || license.id).replace(/[^a-zA-Z0-9_-]/g, "")}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section id="licenses" className="license-manager" aria-labelledby="license-manager-title">
      <header className="license-manager-header">
        <div>
          <h1 id="license-manager-title">Quản Lý License</h1>
          <p className="license-total-count">Tổng: {licenses.length} license</p>
        </div>

        <div className="license-header-controls">
          <label className="license-search-box">
            <span className="sr-only">Tìm license</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="m20 20-3.5-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              id="license-search"
              name="licenseSearch"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên, key, email, mã đơn..."
            />
          </label>
          <button type="button" className="button red" onClick={() => setCreating(true)}>
            + Tạo License
          </button>
        </div>
      </header>

      {notice && (
        <p className={`license-manager-message ${notice.type === "success" ? "is-success" : ""}`} role="status">
          {notice.text}
        </p>
      )}

      <div className="license-table-wrap">
        <table className="license-table admin-responsive-table">
          <thead>
            <tr>
              <th>TRẠNG THÁI</th>
              <th>KHÁCH HÀNG</th>
              <th>MÃ ĐƠN</th>
              <th>LICENSE KEY</th>
              <th>LOẠI</th>
              <th>MÁY</th>
              <th>HẾT HẠN</th>
              <th style={{ textAlign: "right" }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="admin-table-state">
                <td colSpan={8}>Đang tải danh sách license…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr className="admin-table-state">
                <td colSpan={8}>Chưa có license phù hợp.</td>
              </tr>
            ) : (
              filtered.map((license) => {
                const statusInfo = getStatusInfo(license);
                const typeInfo = getTypeInfo(license.type);
                const daysLeft = getDaysRemaining(license.expiry_date);
                const machineCount = license.activated_machines?.length || 0;
                const orderCode = license.order_code || license.order_id;
                const fullKey = license.raw_key || license.key;

                return (
                  <tr key={license.id}>
                    <td data-label="Trạng thái">
                      <span className={`license-status-badge is-${statusInfo.tone}`}>
                        {statusInfo.tone === "active" && (
                          <svg aria-hidden="true" viewBox="0 0 24 24" width="13" height="13">
                            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                            <path d="m8.5 12.5 2.5 2.5 4.5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {statusInfo.label}
                      </span>
                    </td>

                    <td data-label="Khách hàng">
                      <strong>{license.client_name || "Khách lẻ"}</strong>
                      <small>{license.client_phone || license.client_email || "—"}</small>
                    </td>

                    <td data-label="Mã đơn">
                      {orderCode ? (
                        <span className="license-order-badge">{orderCode}</span>
                      ) : (
                        <span className="license-manual-tag">Tạo thủ công</span>
                      )}
                    </td>

                    <td data-label="License Key">
                      <div className="license-key-cell">
                        <code title={fullKey}>{formatShortKey(fullKey)}</code>
                        <button
                          type="button"
                          className="license-mini-btn"
                          onClick={() => void handleCopyKey(license)}
                          aria-label={`Sao chép key của ${license.client_name || "khách hàng"}`}
                          title="Sao chép key"
                        >
                          {copiedId === license.id ? (
                            <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15">
                              <path d="m5 13 4 4L19 7" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15">
                              <rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" fill="none" stroke="currentColor" strokeWidth="1.8" />
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          className="license-mini-btn"
                          onClick={() => handleDownloadKey(license)}
                          aria-label={`Tải file key của ${license.client_name || "khách hàng"}`}
                          title="Tải file key"
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15">
                            <path d="M12 4v11m0 0-4-4m4 4 4-4M4 19h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </td>

                    <td data-label="Loại">
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                        <span className={`license-type-badge is-${typeInfo.tone}`}>{typeInfo.label}</span>
                        {license.smart_schedule_enabled && (
                          <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "999px", background: "#dbeafe", color: "#1d4ed8", border: "1px solid #93c5fd" }}>
                            ⚡ Smart Pro
                          </span>
                        )}
                      </div>
                    </td>

                    <td data-label="Máy">
                      <button
                        type="button"
                        className="license-machines-btn"
                        onClick={() => setViewingMachines(license)}
                        aria-label={`Xem ${machineCount}/${license.max_machines} máy đã kích hoạt`}
                        title="Xem danh sách máy đã kích hoạt"
                      >
                        <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15">
                          <rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M8 20h8M12 16v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        <span>{machineCount}/{license.max_machines}</span>
                        <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14">
                          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                          <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                        </svg>
                      </button>
                    </td>

                    <td data-label="Hết hạn">
                      <strong>{formatExpiryDate(license.expiry_date)}</strong>
                      {daysLeft !== null && (
                        <small className={`license-expiry-sub ${daysLeft <= 7 ? "is-urgent" : ""}`}>
                          {daysLeft > 0 ? `Còn ${daysLeft} ngày` : daysLeft === 0 ? "Hết hạn hôm nay" : `Quá hạn ${Math.abs(daysLeft)} ngày`}
                        </small>
                      )}
                    </td>

                    <td data-label="Thao tác">
                      <div className="license-icon-actions">
                        <button
                          type="button"
                          className="license-icon-btn"
                          style={license.smart_schedule_enabled ? { background: "#eff6ff", color: "#2563eb", borderColor: "#93c5fd" } : undefined}
                          onClick={() => void postLicenseOp(
                            { op: "smartSchedule", key: license.raw_key || license.key, enabled: !license.smart_schedule_enabled },
                            license.smart_schedule_enabled ? "Đã tắt Smart Schedule Pro." : "Đã bật Smart Schedule Pro.",
                          )}
                          aria-label={`${license.smart_schedule_enabled ? "Tắt" : "Bật"} Smart Schedule Pro cho ${license.client_name || "khách hàng"}`}
                          title={license.smart_schedule_enabled ? "Đang bật Smart Schedule Pro (Bấm để tắt)" : "Bật Smart Schedule Pro (100K)"}
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
                            <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" fill={license.smart_schedule_enabled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="license-icon-btn is-reset"
                          onClick={() => setConfirmAction({ kind: "reset", license })}
                          aria-label={`Reset máy cho ${license.client_name || "khách hàng"}`}
                          title="Reset thiết bị (HWID)"
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
                            <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="license-icon-btn is-extend"
                          onClick={() => {
                            setExtendingLicense(license);
                            setExtendDays("30");
                          }}
                          aria-label={`Gia hạn license cho ${license.client_name || "khách hàng"}`}
                          title="Gia hạn thêm ngày"
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
                            <path d="M21 12a9 9 0 0 0-15.5-6.3L3 8m0-5v5h5M3 12a9 9 0 0 0 15.5 6.3L21 16m0 5v-5h-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="license-icon-btn is-revoke"
                          onClick={() => setConfirmAction({ kind: "revoke", license })}
                          aria-label={`Khóa license của ${license.client_name || "khách hàng"}`}
                          title="Khóa / Thu hồi license"
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
                            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.9" />
                            <path d="m6 6 12 12" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="license-icon-btn is-delete"
                          onClick={() => setConfirmAction({ kind: "delete", license })}
                          aria-label={`Xóa license của ${license.client_name || "khách hàng"}`}
                          title="Xóa vĩnh viễn license"
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
                            <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Tạo License */}
      {creating && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="create-license-title">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h2 id="create-license-title">Tạo License Mới</h2>
              <button type="button" className="admin-modal-close" onClick={() => setCreating(false)} aria-label="Đóng">
                ✕
              </button>
            </div>
            <form className="license-modal-form" onSubmit={handleCreate}>
              <div className="form-row-2">
                <label>
                  Tên khách hàng *
                  <input
                    required
                    name="clientName"
                    placeholder="VD: Hồ Văn Tùng"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  />
                </label>
                <label>
                  Loại license
                  <select
                    name="type"
                    value={form.type}
                    onChange={(e) => {
                      const nextType = e.target.value;
                      setForm({
                        ...form,
                        type: nextType,
                        days: nextType === "yearly" ? "365" : nextType === "tournament" ? "14" : "7",
                      });
                    }}
                  >
                    <option value="tournament">Giải Đấu</option>
                    <option value="yearly">Trọn Năm</option>
                    <option value="trial">Dùng Thử</option>
                  </select>
                </label>
              </div>
              <div className="form-row-2">
                <label>
                  Thời hạn (ngày) *
                  <input
                    required
                    name="days"
                    type="number"
                    min="1"
                    value={form.days}
                    onChange={(e) => setForm({ ...form, days: e.target.value })}
                  />
                </label>
                <label>
                  Số máy tối đa *
                  <input
                    required
                    name="maxMachines"
                    type="number"
                    min="1"
                    value={form.maxMachines}
                    onChange={(e) => setForm({ ...form, maxMachines: e.target.value })}
                  />
                </label>
              </div>
              <div className="form-row-2">
                <label>
                  Số điện thoại
                  <input
                    name="clientPhone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="09xx xxx xxx"
                    value={form.clientPhone}
                    onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                  />
                </label>
                <label>
                  Email
                  <input
                    name="clientEmail"
                    type="email"
                    autoComplete="email"
                    placeholder="email@domain.com"
                    value={form.clientEmail}
                    onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                  />
                </label>
              </div>
              <label>
                Ghi chú
                <textarea
                  name="notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", flexDirection: "row", cursor: "pointer", fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={Boolean(form.smartScheduleEnabled)}
                  onChange={(e) => setForm({ ...form, smartScheduleEnabled: e.target.checked })}
                  style={{ width: "16px", height: "16px" }}
                />
                <span>⚡ Bật sẵn Smart Schedule Pro (+100K)</span>
              </label>
              <div className="admin-modal-actions">
                <button type="button" className="button ghost" onClick={() => setCreating(false)}>
                  Hủy
                </button>
                <button type="submit" className="button red" disabled={submitting}>
                  {submitting ? "Đang tạo…" : "Cấp License"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Gia hạn */}
      {extendingLicense && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="extend-license-title">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h2 id="extend-license-title">Gia hạn License</h2>
              <button type="button" className="admin-modal-close" onClick={() => setExtendingLicense(null)} aria-label="Đóng">
                ✕
              </button>
            </div>
            <form className="license-modal-form" onSubmit={handleExtend}>
              <p className="license-modal-sub">
                Khách hàng: <strong>{extendingLicense.client_name || "Khách lẻ"}</strong> · Hạn hiện tại:{" "}
                <strong>{formatExpiryDate(extendingLicense.expiry_date)}</strong>
              </p>
              <div className="license-quick-days" role="group" aria-label="Chọn nhanh số ngày">
                {["7", "30", "90", "365"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={extendDays === preset ? "is-selected" : ""}
                    onClick={() => setExtendDays(preset)}
                  >
                    +{preset} ngày
                  </button>
                ))}
              </div>
              <label>
                Số ngày gia hạn thêm
                <input
                  required
                  type="number"
                  min="1"
                  value={extendDays}
                  onChange={(e) => setExtendDays(e.target.value)}
                />
              </label>
              <div className="admin-modal-actions">
                <button type="button" className="button ghost" onClick={() => setExtendingLicense(null)}>
                  Hủy
                </button>
                <button type="submit" className="button red" disabled={submitting}>
                  {submitting ? "Đang lưu…" : "Xác nhận gia hạn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Xem danh sách máy kích hoạt */}
      {viewingMachines && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="machines-modal-title">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h2 id="machines-modal-title">Thiết bị đã kích hoạt</h2>
              <button type="button" className="admin-modal-close" onClick={() => setViewingMachines(null)} aria-label="Đóng">
                ✕
              </button>
            </div>
            <p className="license-modal-sub">
              <strong>{viewingMachines.client_name || "Khách lẻ"}</strong> · Đã dùng{" "}
              <strong>{viewingMachines.activated_machines?.length || 0}/{viewingMachines.max_machines}</strong> máy
            </p>
            {viewingMachines.activated_machines?.length ? (
              <ul className="license-machine-list">
                {viewingMachines.activated_machines.map((machineId, idx) => (
                  <li key={`${machineId}-${idx}`}>
                    <span>Máy #{idx + 1}</span>
                    <code>{machineId}</code>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="license-modal-empty">Chưa có thiết bị nào kích hoạt license này.</p>
            )}
            <div className="admin-modal-actions">
              <button type="button" className="button ghost" onClick={() => setViewingMachines(null)}>
                Đóng
              </button>
              <button
                type="button"
                className="button red"
                onClick={() => {
                  const target = viewingMachines;
                  setViewingMachines(null);
                  setConfirmAction({ kind: "reset", license: target });
                }}
              >
                Reset toàn bộ máy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Xác nhận Reset / Thu hồi / Xóa */}
      {confirmAction && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-license-title">
          <div className="admin-confirm-box">
            <h3 id="confirm-license-title">
              {confirmAction.kind === "reset"
                ? "Reset thiết bị kích hoạt?"
                : confirmAction.kind === "revoke"
                  ? "Khóa / Thu hồi license?"
                  : "Xóa vĩnh viễn license?"}
            </h3>
            <p>
              {confirmAction.kind === "reset"
                ? `Toàn bộ máy đã kích hoạt của "${confirmAction.license.client_name || "Khách lẻ"}" sẽ bị gỡ để kích hoạt lại trên máy mới.`
                : confirmAction.kind === "revoke"
                  ? `Khách hàng "${confirmAction.license.client_name || "Khách lẻ"}" sẽ không thể sử dụng phần mềm bằng key này nữa.`
                  : `Xóa vĩnh viễn license của "${confirmAction.license.client_name || "Khách lẻ"}"? Hành động này không thể hoàn tác.`}
            </p>
            <div className="admin-confirm-actions">
              <button type="button" className="button ghost" onClick={() => setConfirmAction(null)} disabled={submitting}>
                Hủy bỏ
              </button>
              <button type="button" className="button red" onClick={() => void executeConfirm()} disabled={submitting}>
                {submitting ? "Đang xử lý…" : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
