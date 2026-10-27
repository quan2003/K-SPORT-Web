import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Đăng ký tài khoản" };

export default function RegisterPage() {
  return (
    <main id="main-content" className="auth-page">
      <div className="auth-aside"><Link href="/" className="auth-logo" translate="no"><span>K-</span>SPORT</Link><p>Tạo tài khoản để gửi yêu cầu vận hành và tham gia không gian làm việc K-SPORT.</p><Link href="/" className="text-action">← Về cổng thông tin</Link></div>
      <section className="auth-panel"><p className="auth-context">K-SPORT</p><h1>Đăng ký tài khoản</h1><p className="auth-lead">Tài khoản sẽ được xác minh theo vai trò và đơn vị tổ chức.</p><AuthForm mode="register" /></section>
    </main>
  );
}
