"use client";

import { FormEvent, useState } from "react";

const CONTACT_EMAIL = "lienhe@k-sport.net";
const ZALO_URL = "https://zalo.me/0336440523";

export function ContactForm() {
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const organization = String(form.get("organization") ?? "").trim();
    const tournamentType = String(form.get("tournamentType") ?? "Giải phong trào CLB").trim();
    const message = String(form.get("message") ?? "").trim();

    const subject = `[Tư Vấn K-SPORT] ${tournamentType} - ${organization || name}`;
    const body = [
      `=== YÊU CẦU TƯ VẤN TRIỂN KHAI PHẦN MỀM K-SPORT ===`,
      ``,
      `• Họ và tên đại diện: ${name}`,
      `• Số điện thoại / Zalo: ${phone}`,
      `• Email liên hệ: ${email}`,
      `• Đơn vị / Ban Tổ Chức: ${organization || "Chưa cung cấp"}`,
      `• Quy mô / Loại giải: ${tournamentType}`,
      ``,
      `• Chi tiết nhu cầu tổ chức:`,
      message,
      ``,
      `==================================================`,
      `Gửi từ cổng thông tin k-sport.net`,
    ].join("\n");

    setStatusMessage(`Đang kết nối ứng dụng email để gửi thông tin đến ${CONTACT_EMAIL}...`);
    setIsSuccess(true);

    // Trigger email client
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="ks-contact-form-container">
      <div className="ks-contact-form-card">
        <div className="ks-form-head">
          <span className="ks-eyebrow-tag">GỬI YÊU CẦU TƯ VẤN NHANH</span>
          <h2 className="ks-form-title">Đăng Ký Tư Vấn Giải Đấu</h2>
          <p className="ks-form-sub">
            Điền thông tin giải đấu của bạn, chuyên viên kỹ thuật K-SPORT sẽ chuẩn bị phương án bốc thăm và cấu hình thảm đấu phù hợp nhất.
          </p>
        </div>

        <form className="ks-contact-form" onSubmit={handleSubmit}>
          <div className="ks-form-grid">
            <div className="ks-form-group">
              <label htmlFor="contact-name" className="ks-label">
                Họ và tên đại diện <span className="req">*</span>
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                className="ks-input"
                placeholder="Ví dụ: Nguyễn Văn A"
                autoComplete="name"
                required
              />
            </div>

            <div className="ks-form-group">
              <label htmlFor="contact-phone" className="ks-label">
                Số điện thoại / Zalo <span className="req">*</span>
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                className="ks-input"
                placeholder="Ví dụ: 0336440523"
                autoComplete="tel"
                required
              />
            </div>
          </div>

          <div className="ks-form-grid">
            <div className="ks-form-group">
              <label htmlFor="contact-email" className="ks-label">
                Email công việc <span className="req">*</span>
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                className="ks-input"
                placeholder="tenban@gmail.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="ks-form-group">
              <label htmlFor="contact-org" className="ks-label">
                Đơn vị / Ban Tổ Chức
              </label>
              <input
                id="contact-org"
                name="organization"
                type="text"
                className="ks-input"
                placeholder="CLB Karate hoặc Tỉnh / Thành"
                autoComplete="organization"
              />
            </div>
          </div>

          <div className="ks-form-group">
            <label htmlFor="contact-type" className="ks-label">
              Quy mô / Loại giải đấu
            </label>
            <select id="contact-type" name="tournamentType" className="ks-select" defaultValue="Giải phong trào CLB">
              <option value="Giải phong trào CLB">Giải mở rộng / Giao lưu phong trào CLB (1–2 thảm)</option>
              <option value="Giải vô địch tỉnh / thành phố">Giải vô địch tỉnh / thành phố (2–4 thảm)</option>
              <option value="Giải Cúp / Vô địch quốc gia">Giải Cúp / Vô địch trẻ quốc gia (4–6 thảm)</option>
              <option value="Hội thao trường học / ngành">Hội thao trường học, lực lượng vũ trang (1–3 thảm)</option>
              <option value="Khác">Quy mô đặc thù khác</option>
            </select>
          </div>

          <div className="ks-form-group">
            <label htmlFor="contact-message" className="ks-label">
              Nhu cầu tổ chức & Thông tin giải đấu <span className="req">*</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              className="ks-textarea"
              placeholder="Vui lòng cho biết: Ngày dự kiến tổ chức, địa điểm thi đấu, số lượng thảm dự kiến, số VĐV dự kiến và các yêu cầu đặc biệt..."
              required
            />
            <span className="ks-help-text">
              * Không nhập mật khẩu, số căn cước hoặc dữ liệu cá nhân nhạy cảm của vận động viên.
            </span>
          </div>

          <div className="ks-form-actions">
            <button type="submit" className="ks-btn ks-btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              <span>Gửi Yêu Cầu Tư Vấn Ngay</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          {statusMessage && (
            <div className={`ks-form-status ${isSuccess ? "is-success" : ""}`} role="status">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="ks-form-footer-or">
            <span>Hoặc nhắn tin trực tiếp để nhận phản hồi trong 5 phút</span>
            <a
              href={ZALO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ks-zalo-direct-btn"
            >
              <span>Nhắn Zalo Tư Vấn Nhanh (0336440523)</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
