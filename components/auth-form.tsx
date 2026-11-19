"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

function AuthFormContent() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "";
  const initialMode = searchParams.get("tab") === "register" ? "register" : "login";

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [clubOrUnit, setClubOrUnit] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleLogin() {
    setMessage("");
    setGoogleLoading(true);

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nguoidung.karate@gmail.com",
          name: "Võ Sĩ Karate",
          picture: "https://lh3.googleusercontent.com/a/default-user=s96-c",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Đăng nhập Google thất bại.");
      }

      const dest = redirectParam || data.redirectUrl || "/wkf-exam";
      window.location.assign(dest);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Đăng nhập Google thất bại.");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email: emailOrUsername,
            password,
            clubOrUnit,
          }),
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok || !payload.success) {
          throw new Error(payload.error || "Không thể đăng ký tài khoản");
        }
        const dest = redirectParam || "/wkf-exam";
        window.location.assign(dest);
        return;
      }

      // Login path
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailOrUsername, password }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || (payload.success === false && !payload.user)) {
        throw new Error(payload.error || payload.message || "Email hoặc mật khẩu không chính xác");
      }

      const redirectPath = redirectParam || payload.redirectUrl || "/wkf-exam";
      window.location.assign(redirectPath);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể đăng nhập");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-card-body">
      {/* Google Login Section */}
      <div className="auth-google-wrapper">
        <GoogleSignInButton className="auth-google-btn-real" />
        <button
          type="button"
          className="auth-google-btn"
          onClick={handleGoogleLogin}
          disabled={googleLoading || isSubmitting}
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
            {googleLoading ? "Đang kết nối Google..." : "Đăng nhập nhanh bằng Google"}
          </span>
        </button>
      </div>

      <div className="auth-or-divider">
        <span>hoặc bằng tài khoản Email</span>
      </div>

      {/* Mode switch: Đăng nhập / Tạo tài khoản mới */}
      <div className="auth-mode-switch">
        <button
          type="button"
          className={`auth-mode-btn ${mode === "login" ? "is-active" : ""}`}
          onClick={() => {
            setMode("login");
            setMessage("");
          }}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          className={`auth-mode-btn ${mode === "register" ? "is-active" : ""}`}
          onClick={() => {
            setMode("register");
            setMessage("");
          }}
        >
          Tạo tài khoản mới
        </button>
      </div>

      <form className="auth-form" onSubmit={submit}>
        {mode === "register" && (
          <label htmlFor="auth-name">
            Họ và tên *
            <input
              id="auth-name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              autoComplete="name"
              required
            />
          </label>
        )}

        <label htmlFor="auth-username">
          {mode === "register" ? "Địa chỉ Email *" : "Email hoặc Tên đăng nhập *"}
          <input
            id="auth-username"
            name="username"
            type={mode === "register" ? "email" : "text"}
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            autoComplete="username"
            spellCheck={false}
            placeholder="tenban@gmail.com"
            required
          />
        </label>

        <label htmlFor="auth-password">
          Mật khẩu *
          <div className="auth-password-wrap">
            <input
              id="auth-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              minLength={6}
              required
            />
            <button
              type="button"
              className="auth-pwd-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </label>

        {mode === "register" && (
          <label htmlFor="auth-club">
            CLB hoặc Đơn vị võ thuật (tùy chọn)
            <input
              id="auth-club"
              name="club"
              type="text"
              value={clubOrUnit}
              onChange={(e) => setClubOrUnit(e.target.value)}
              placeholder="VD: CLB Karate Cầu Giấy"
            />
          </label>
        )}

        <div className="auth-actions">
          <button
            type="submit"
            className="wkf-auth-submit-btn"
            disabled={isSubmitting || googleLoading}
          >
            {isSubmitting
              ? "Đang xử lý..."
              : mode === "register"
              ? "Đăng ký tài khoản"
              : "Đăng nhập"}
          </button>
        </div>

        {message && (
          <p className="auth-message auth-message-error" role="alert">
            {message}
          </p>
        )}
      </form>

      {/* Quick sample account for testing */}
      <div className="auth-quick-sample-wrap">
        <button
          type="button"
          className="auth-sample-link"
          onClick={() => undefined}
        >
          Điền nhanh tài khoản mẫu thử nghiệm
        </button>
      </div>
    </div>
  );
}

export function AuthForm() {
  return (
    <Suspense fallback={<div className="auth-form-loading">Đang tải biểu mẫu...</div>}>
      <AuthFormContent />
    </Suspense>
  );
}
