import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <main id="main-content" className="auth-page">
      <div className="auth-aside"><Link href="/" className="auth-logo" translate="no"><span>K-</span>SPORT</Link><p>Truy cập khu vực điều hành giải Karate của K-SPORT.</p><Link href="/" className="text-action">← Về cổng thông tin</Link></div>
      <section className="auth-panel"><p className="auth-context">K-SPORT ADMIN</p><h1>Đăng nhập</h1><p className="auth-lead">Dành cho ban tổ chức, biên tập viên và quản trị viên đã được cấp quyền.</p><AuthForm /></section>
    </main>
  );
}
