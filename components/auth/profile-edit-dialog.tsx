"use client";

import { useState } from "react";
import type { UserSession } from "@/lib/auth";

type Props = { session: UserSession; onClose: () => void; onSaved: (session: UserSession) => void };

function toDisplayDate(value: string) { const [year, month, day] = value.split("-"); return year && month && day ? `${day}/${month}/${year}` : value; }
function toStoredDate(value: string) { const match = value.trim().match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/); return match ? `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}` : value; }
function formatDateInput(value: string) { const digits = value.replace(/\D/g, "").slice(0, 8); return digits.length > 4 ? `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}` : digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits; }

export function ProfileEditDialog({ session, onClose, onSaved }: Props) {
  const [name, setName] = useState(session.name);
  const [phone, setPhone] = useState(session.phone ?? "");
  const [gender, setGender] = useState(session.gender ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(toDisplayDate(session.dateOfBirth ?? ""));
  const [clubOrUnit, setClubOrUnit] = useState(session.clubOrUnit ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/auth/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone, gender, dateOfBirth: toStoredDate(dateOfBirth), clubOrUnit }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Không thể lưu thông tin.");
      onSaved({ ...session, name, phone, gender: gender as UserSession["gender"], dateOfBirth: toStoredDate(dateOfBirth), clubOrUnit });
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể lưu thông tin.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="profile-edit-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="profile-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-edit-title">
      <header><div><p>HỒ SƠ TÀI KHOẢN</p><h2 id="profile-edit-title">Chỉnh sửa thông tin</h2></div><button type="button" onClick={onClose} aria-label="Đóng">×</button></header>
      <form onSubmit={submit}>
        <label>Họ và tên<input name="name" value={name} onChange={(event) => setName(event.target.value)} required /></label>
        <label>Số điện thoại<input name="phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required /></label>
        <div className="profile-edit-grid">
          <label>Giới tính<select name="gender" value={gender} onChange={(event) => setGender(event.target.value)} required><option value="">Chọn</option><option value="male">Nam</option><option value="female">Nữ</option><option value="other">Khác</option></select></label>
          <label>Ngày tháng năm sinh<input name="dateOfBirth" type="text" value={dateOfBirth} onChange={(event) => setDateOfBirth(formatDateInput(event.target.value))} inputMode="numeric" maxLength={10} placeholder="dd/mm/yyyy" pattern="\\d{1,2}[\\/.\\-]\\d{1,2}[\\/.\\-]\\d{4}" required /></label>
        </div>
        <label>Câu lạc bộ hoặc đơn vị<input name="clubOrUnit" value={clubOrUnit} onChange={(event) => setClubOrUnit(event.target.value)} /></label>
        {error && <p className="profile-setup-error" role="alert">{error}</p>}
        <footer><button type="button" onClick={onClose}>Hủy</button><button className="primary" type="submit" disabled={saving}>{saving ? "Đang lưu…" : "Lưu thay đổi"}</button></footer>
      </form>
    </section>
  </div>;
}
