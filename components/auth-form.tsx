"use client";

import { FormEvent, useState } from "react";

export function AuthForm() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: form.get("username"), password: form.get("password") }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Không thể đăng nhập");
      // A full navigation avoids the App Router reusing the unauthenticated
      // route cache immediately after the server sets the HttpOnly cookie.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/admin");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể đăng nhập");
    } finally { setIsSubmitting(false); }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label htmlFor="auth-username">Tên đăng nhập<input id="auth-username" name="username" autoComplete="username" spellCheck={false} required /></label>
      <label htmlFor="auth-password">Mật khẩu<input id="auth-password" name="password" type="password" autoComplete="current-password" required /></label>
      <button className="button red" type="submit" disabled={isSubmitting}>{isSubmitting ? "Đang đăng nhập…" : "Đăng nhập"}<span aria-hidden="true">→</span></button>
      <p className="auth-status" aria-live="polite">{message}</p>
      <p className="auth-switch">Tài khoản được quản trị viên K-SPORT cấp riêng.</p>
    </form>
  );
}
