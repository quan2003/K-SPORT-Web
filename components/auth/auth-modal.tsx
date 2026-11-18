"use client";

import { useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "register";
  redirectUrl?: string;
  onSuccess?: () => void;
}

function AuthModalInner({
  onClose,
  initialTab,
  redirectUrl = "/wkf-exam",
  onSuccess,
}: {
  onClose: () => void;
  initialTab: "login" | "register";
  redirectUrl?: string;
  onSuccess?: () => void;
}) {
  const [tab, setTab] = useState<"login" | "register">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [clubOrUnit, setClubOrUnit] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
        throw new Error(data.error || "Không thể thực hiện đăng nhập.");
      }

      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.assign(redirectUrl || window.location.href);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(sampleEmail?: string, sampleName?: string) {
    setError(null);
    setGoogleLoading(true);

    try {
      const emailToUse = sampleEmail || "referee.karate.vn@gmail.com";
      const nameToUse = sampleName || "Trọng tài Karate Quốc gia";

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
        throw new Error(data.error || "Đăng nhập Google không thành công.");
      }

      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.assign(redirectUrl || window.location.href);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi đăng nhập Google.");
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleQuickDemo() {
    setEmail("user.karate@k-sport.net");
    setPassword("Ksport!2026");
    setTab("login");
    setError(null);
  }

  return (
    <div
      className="ks-auth-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="ks-auth-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="ks-auth-modal-close"
          onClick={onClose}
          aria-label="Đóng cửa sổ"
        >
          ✕
        </button>

        <div className="ks-auth-modal-header">
          <div className="ks-auth-brand-pill">K-SPORT · WKF ACADEMY</div>
          <h2 id="auth-modal-title" className="ks-auth-modal-title">
            {tab === "login" ? "Đăng nhập tài khoản" : "Tạo tài khoản học & thi"}
          </h2>
          <p className="ks-auth-modal-subtitle">
            Học luật thi đấu Karate WKF, ôn tập câu sai và lưu lịch sử thi trực tuyến.
          </p>
        </div>

        {/* Google Login Button */}
        <div className="ks-auth-google-wrap">
          <button
            type="button"
            className="ks-auth-google-btn"
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
              {googleLoading ? "Đang kết nối Google..." : "Tiếp tục với Google"}
            </span>
          </button>
        </div>

        <div className="ks-auth-or-line">
          <span>hoặc dùng Email</span>
        </div>

        {/* Tab switch */}
        <div className="ks-auth-tab-row" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "login"}
            className={`ks-auth-tab-link ${tab === "login" ? "is-active" : ""}`}
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
            className={`ks-auth-tab-link ${tab === "register" ? "is-active" : ""}`}
            onClick={() => {
              setTab("register");
              setError(null);
            }}
          >
            Đăng ký mới
          </button>
        </div>

        {error && (
          <div className="ks-auth-error-msg" role="alert">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form className="ks-auth-form" onSubmit={handleEmailAuth}>
          {tab === "register" && (
            <div className="ks-auth-field">
              <label htmlFor="modal-name">Họ và tên *</label>
              <input
                id="modal-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                autoComplete="name"
              />
            </div>
          )}

          <div className="ks-auth-field">
            <label htmlFor="modal-email">Email *</label>
            <input
              id="modal-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tenban@gmail.com"
              autoComplete="email"
            />
          </div>

          <div className="ks-auth-field">
            <label htmlFor="modal-pass">Mật khẩu *</label>
            <input
              id="modal-pass"
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
            <div className="ks-auth-field">
              <label htmlFor="modal-club">CLB / Đơn vị võ thuật</label>
              <input
                id="modal-club"
                type="text"
                value={clubOrUnit}
                onChange={(e) => setClubOrUnit(e.target.value)}
                placeholder="VD: CLB Karate Cầu Giấy"
              />
            </div>
          )}

          <button
            type="submit"
            className="ks-auth-submit-action"
            disabled={loading || googleLoading}
          >
            {loading
              ? "Đang xử lý..."
              : tab === "login"
              ? "Đăng nhập ngay"
              : "Hoàn tất đăng ký"}
          </button>
        </form>

        {/* Demo Fast Fill */}
        <div className="ks-auth-demo-fill">
          <div className="ks-demo-buttons">
            <button
              type="button"
              className="ks-demo-chip"
              onClick={handleQuickDemo}
            >
              Điền tài khoản mẫu thử nghiệm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthModal({
  isOpen,
  onClose,
  initialTab = "login",
  redirectUrl = "/wkf-exam",
  onSuccess,
}: Props) {
  if (!isOpen) return null;

  return (
    <AuthModalInner
      key={`${isOpen}-${initialTab}`}
      onClose={onClose}
      initialTab={initialTab}
      redirectUrl={redirectUrl}
      onSuccess={onSuccess}
    />
  );
}
