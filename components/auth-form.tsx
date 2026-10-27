"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Biểu mẫu đã sẵn sàng. Cần kết nối Identity API để xác thực tài khoản.");
  }

  const isLogin = mode === "login";
  return (
    <form className="auth-form" onSubmit={submit}>
      {!isLogin && <label htmlFor="full-name">Họ và tên<input id="full-name" name="name" autoComplete="name" required /></label>}
      <label htmlFor="auth-email">Email<input id="auth-email" name="email" type="email" autoComplete="email" spellCheck={false} required /></label>
      <label htmlFor="auth-password">Mật khẩu<input id="auth-password" name="password" type="password" autoComplete={isLogin ? "current-password" : "new-password"} required /></label>
      {!isLogin && <label className="auth-check" htmlFor="terms"><input id="terms" name="terms" type="checkbox" required />Tôi đồng ý với điều khoản sử dụng K-SPORT.</label>}
      <button className="button red" type="submit">{isLogin ? "Đăng nhập" : "Tạo tài khoản"}<span aria-hidden="true">→</span></button>
      <p className="auth-status" aria-live="polite">{message}</p>
      <p className="auth-switch">{isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"} <Link href={isLogin ? "/register" : "/login"}>{isLogin ? "Đăng ký" : "Đăng nhập"}</Link></p>
    </form>
  );
}
