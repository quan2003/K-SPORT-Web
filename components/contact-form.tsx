"use client";
import { FormEvent, useState } from "react";

const CONTACT_EMAIL = "lienhe@k-sport.net";

export function ContactForm() {
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const organization = String(form.get("organization") ?? "").trim();
    const need = String(form.get("message") ?? "").trim();
    const subject = `Yêu cầu tư vấn K-SPORT - ${organization || name}`;
    const body = [
      `Họ và tên: ${name}`,
      `Email công việc: ${email}`,
      `Đơn vị: ${organization || "Chưa cung cấp"}`,
      "",
      "Nhu cầu tổ chức:",
      need,
    ].join("\n");

    setMessage(`Đang mở ứng dụng email để gửi đến ${CONTACT_EMAIL}.`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="contact-form-heading">
        <h2>Gửi yêu cầu tư vấn</h2>
        <p>Điền thông tin chính, K-SPORT sẽ chuẩn bị nội dung trao đổi phù hợp với quy mô giải.</p>
      </div>
      <label htmlFor="name">Họ và tên<input id="name" name="name" autoComplete="name" required /></label>
      <label htmlFor="email">Email công việc<input id="email" name="email" type="email" inputMode="email" autoComplete="email" spellCheck={false} required /></label>
      <label htmlFor="organization">Đơn vị<input id="organization" name="organization" autoComplete="organization" /></label>
      <label htmlFor="message">Nhu cầu tổ chức<textarea id="message" name="message" rows={6} autoComplete="off" aria-describedby="form-help" required /></label>
      <p id="form-help">Không nhập thông tin vận động viên hoặc dữ liệu cá nhân nhạy cảm.</p>
      <button className="button red" type="submit">Soạn email gửi K-SPORT <span aria-hidden="true">→</span></button>
      <p className="form-status" aria-live="polite">{message}</p>
      <span className="contact-form-edge" aria-hidden="true" />
    </form>
  );
}
