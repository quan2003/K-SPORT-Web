"use client";

import { useState } from "react";

type ProfileGender = "male" | "female" | "other";
type Props = { initialName: string; initialClub?: string; initialGender?: ProfileGender; initialDateOfBirth?: string };

function toDisplayDate(value: string) {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function toStoredDate(value: string) {
  const match = value.trim().match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
  if (!match) return value;
  return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 4 ? `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}` : digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function ProfileSetupGate({ initialName, initialClub = "", initialGender, initialDateOfBirth = "" }: Props) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<ProfileGender | "">(initialGender ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(toDisplayDate(initialDateOfBirth));
  const [clubOrUnit, setClubOrUnit] = useState(initialClub);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone, gender, dateOfBirth: toStoredDate(dateOfBirth), clubOrUnit }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Không thể lưu thông tin.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể lưu thông tin.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="profile-setup-page">
      <section className="profile-setup-card" aria-labelledby="profile-setup-title">
        <p className="profile-setup-eyebrow">THÔNG TIN HỌC VIÊN</p>
        <h1 id="profile-setup-title">Hoàn tất thông tin trước khi vào bài thi</h1>
        <p>Vui lòng nhập thông tin để K-SPORT lưu đúng tiến độ học và hỗ trợ bạn khi cần.</p>
        <form onSubmit={save} className="profile-setup-form">
          <label htmlFor="profile-name">Họ và tên
            <input id="profile-name" name="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
          </label>
          <label htmlFor="profile-phone">Số điện thoại
            <input id="profile-phone" name="phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" inputMode="tel" placeholder="Ví dụ: 0901 234 567" required />
          </label>
          <label htmlFor="profile-gender">Giới tính
            <select id="profile-gender" name="gender" value={gender} onChange={(event) => setGender(event.target.value as ProfileGender)} required>
              <option value="">Chọn giới tính</option><option value="male">Nam</option><option value="female">Nữ</option><option value="other">Khác</option>
            </select>
          </label>
          <label htmlFor="profile-date-of-birth">Ngày tháng năm sinh
            <input id="profile-date-of-birth" name="dateOfBirth" type="text" value={dateOfBirth} onChange={(event) => setDateOfBirth(formatDateInput(event.target.value))} autoComplete="bday" inputMode="numeric" maxLength={10} placeholder="dd/mm/yyyy" pattern="\\d{1,2}[\\/.\\-]\\d{1,2}[\\/.\\-]\\d{4}" required />
          </label>
          <label htmlFor="profile-club">Câu lạc bộ hoặc đơn vị (không bắt buộc)
            <input id="profile-club" name="clubOrUnit" value={clubOrUnit} onChange={(event) => setClubOrUnit(event.target.value)} autoComplete="organization" />
          </label>
          {message && <p className="profile-setup-error" role="alert">{message}</p>}
          <button type="submit" disabled={saving}>{saving ? "Đang lưu…" : "Lưu"}</button>
        </form>
      </section>
    </main>
  );
}
