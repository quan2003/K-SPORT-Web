"use client";

import { FormEvent, useState } from "react";

export function AuthForm() {
  const [username, setUsername] = useState("admin-k-sport");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"admin" | "btc">("admin");

  function selectRoleCredentials(role: "admin" | "btc") {
    setActiveTab(role);
    if (role === "admin") {
      setUsername("admin-k-sport");
      setPassword("Ksport!Quan_2026#");
    } else {
      setUsername("btc-phutho");
      setPassword("Ksport!Btc2026");
    }
    setMessage("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || "Không thể đăng nhập");
      }

      const redirectPath = payload.redirectUrl || (payload.user?.role === "btc" ? "/admin/btc" : "/admin");
      // Full navigation to ensure HttpOnly cookie is recognized
      window.location.assign(redirectPath);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể đăng nhập");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="auth-role-tabs" role="tablist" aria-label="Chọn vai trò đăng nhập">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "admin"}
          className={`auth-role-tab ${activeTab === "admin" ? "is-active" : ""}`}
          onClick={() => selectRoleCredentials("admin")}
        >
          👑 Quản trị viên (Admin)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "btc"}
          className={`auth-role-tab ${activeTab === "btc" ? "is-active" : ""}`}
          onClick={() => selectRoleCredentials("btc")}
        >
          🏆 Ban Tổ Chức (Role BTC)
        </button>
      </div>

      <label htmlFor="auth-username">
        Tên đăng nhập
        <input
          id="auth-username"
          name="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          spellCheck={false}
          required
        />
      </label>

      <label htmlFor="auth-password">
        Mật khẩu
        <div className="auth-password-wrap">
          <input
            id="auth-password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="auth-pwd-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
      </label>

      <button className="button red auth-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang xác thực..." : "Đăng nhập →"}
      </button>

      {message ? <p className="auth-error" role="alert">{message}</p> : null}

      <div className="auth-hint-box" role="region" aria-label="Tài khoản mẫu">
        <div className="auth-hint-header">
          <span className="auth-hint-badge">
            {activeTab === "admin" ? "Tài khoản Quản trị toàn hệ thống" : "Tài khoản Ban Tổ Chức Giải"}
          </span>
          <button
            type="button"
            className="auth-quick-fill-btn"
            onClick={() => selectRoleCredentials(activeTab)}
          >
            Tự động điền ↵
          </button>
        </div>
        <div className="auth-hint-creds">
          {activeTab === "admin" ? (
            <>
              <div><span>User:</span> <code>admin-k-sport</code></div>
              <div><span>Pass:</span> <code>Ksport!Quan_2026#</code></div>
            </>
          ) : (
            <>
              <div><span>User:</span> <code>btc-phutho</code></div>
              <div><span>Pass:</span> <code>Ksport!Btc2026</code></div>
            </>
          )}
        </div>
        <p className="auth-hint-note">
          {activeTab === "admin"
            ? "Truy cập toàn bộ chức năng: Điều hành, Nhà tài trợ, Banner, Tin tức, Người dùng."
            : "Chỉ truy cập Bảng điều hành & Thống kê chuyên sâu của Ban Tổ Chức giải đấu."}
        </p>
      </div>

      <p className="auth-note">Tài khoản được ban điều hành K-SPORT phân quyền riêng.</p>
    </form>
  );
}
