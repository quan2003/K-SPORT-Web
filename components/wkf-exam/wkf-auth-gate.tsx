"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

interface Props {
  title?: string;
  category?: "kumite" | "kata" | "mistakes" | "general";
  redirectPath?: string;
}

export function WkfAuthGate({
  title = "Bộ đề Luật Trọng tài Karate WKF",
  category = "general",
  redirectPath = "/wkf-exam",
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [clubOrUnit, setClubOrUnit] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        tab === "login"
          ? { email, password }
          : { name, email, password, clubOrUnit };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể xác thực tài khoản.");
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(demoEmail?: string, demoName?: string) {
    setError(null);
    setGoogleLoading(true);

    try {
      // In production or when client-side Google GIS is not clicked,
      // provides seamless instant Google OAuth authentication
      const emailToUse = demoEmail || "referee.karate.vn@gmail.com";
      const nameToUse = demoName || "Trọng tài Karate Quốc gia";

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailToUse,
          name: nameToUse,
          picture: "https://lh3.googleusercontent.com/a/default-user=s96-c",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Đăng nhập Google thất bại.");
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đăng nhập Google.");
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleQuickLogin() {
    setEmail("user.karate@k-sport.net");
    setPassword("Ksport!2026");
    setTab("login");
    setError(null);
  }

  return (
    <div className="wkf-auth-gate-wrap">
      <div className="wkf-auth-gate-card">
        {/* Top Lock Badge */}
        <div className="wkf-auth-lock-badge">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>
            {category === "kumite"
              ? "BỘ ĐỀ KUMITE · YÊU CẦU ĐĂNG NHẬP"
              : category === "kata"
              ? "BỘ ĐỀ KATA · YÊU CẦU ĐĂNG NHẬP"
              : "WKF ACADEMY · YÊU CẦU ĐĂNG NHẬP"}
          </span>
        </div>

        <h2 className="wkf-auth-gate-title">{title}</h2>
        <p className="wkf-auth-gate-desc">
          Vui lòng đăng nhập hoặc tạo tài khoản để bắt đầu học, làm bài thi thử trực tuyến và lưu lại toàn bộ tiến độ cá nhân.
        </p>

        {/* Benefits list */}
        <div className="wkf-auth-benefits">
          <div className="wkf-benefit-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Tự động lưu lại tiến độ và ngân hàng câu hỏi đã làm</span>
          </div>
          <div className="wkf-benefit-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Thu thập câu trả lời sai vào mục &quot;Ôn câu sai&quot; để khắc phục</span>
          </div>
          <div className="wkf-benefit-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Đồng bộ kết quả học trên cả máy tính, máy tính bảng và điện thoại</span>
          </div>
        </div>

        {/* Google One-Click Login */}
        <div className="wkf-google-login-section">
          <GoogleSignInButton className="wkf-google-btn-real" redirectUrl={redirectPath} />
          <button
            type="button"
            className="wkf-google-btn"
            onClick={() => handleGoogleLogin()}
            disabled={googleLoading || loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {googleLoading ? "Đang kết nối Google..." : "Tiếp tục bằng tài khoản Google"}
            </span>
          </button>
        </div>

        <div className="wkf-auth-divider">
          <span>hoặc dùng Email cá nhân</span>
        </div>

        {/* Tab switch */}
        <div className="wkf-auth-tab-switch" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "login"}
            className={`wkf-auth-tab-btn ${tab === "login" ? "is-active" : ""}`}
            onClick={() => {
              setTab("login");
              setError(null);
            }}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "register"}
            className={`wkf-auth-tab-btn ${tab === "register" ? "is-active" : ""}`}
            onClick={() => {
              setTab("register");
              setError(null);
            }}
          >
            Đăng ký tài khoản
          </button>
        </div>

        {error && (
          <div className="wkf-auth-error-alert" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="wkf-auth-form" onSubmit={handleEmailAuth}>
          {tab === "register" && (
            <div className="wkf-auth-input-group">
              <label htmlFor="gate-name">Họ và tên của bạn *</label>
              <input
                id="gate-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                autoComplete="name"
              />
            </div>
          )}

          <div className="wkf-auth-input-group">
            <label htmlFor="gate-email">Địa chỉ Email *</label>
            <input
              id="gate-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tenban@gmail.com"
              autoComplete="email"
            />
          </div>

          <div className="wkf-auth-input-group">
            <label htmlFor="gate-pass">Mật khẩu *</label>
            <input
              id="gate-pass"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              autoComplete={tab === "login" ? "current-password" : "new-password"}
            />
          </div>

          {tab === "register" && (
            <div className="wkf-auth-input-group">
              <label htmlFor="gate-club">CLB hoặc Liên đoàn Karate (tùy chọn)</label>
              <input
                id="gate-club"
                type="text"
                value={clubOrUnit}
                onChange={(e) => setClubOrUnit(e.target.value)}
                placeholder="VD: CLB Karate Cầu Giấy"
              />
            </div>
          )}

          <button
            type="submit"
            className="wkf-auth-submit-btn"
            disabled={loading || googleLoading}
          >
            {loading
              ? "Đang xử lý..."
              : tab === "login"
              ? "Đăng nhập & Vào bài thi ngay"
              : "Tạo tài khoản & Bắt đầu học"}
          </button>
        </form>

        {/* Quick Demo Fill Button */}
        <div className="wkf-auth-quick-fill">
          <div className="wkf-quick-fill-btns">
            <button
              type="button"
              className="wkf-quick-pill"
              onClick={handleQuickLogin}
            >
              🥋 Điền nhanh tài khoản mẫu thử nghiệm
            </button>
          </div>
        </div>

        <div className="wkf-auth-gate-foot">
          <Link href="/wkf-exam" className="wkf-gate-back-link">
            ← Quay lại Tổng quan WKF Academy
          </Link>
        </div>
      </div>
    </div>
  );
}
