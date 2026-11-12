import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Đăng nhập — K-SPORT WKF Academy",
  description:
    "Đăng nhập tài khoản học viên, trọng tài hoặc ban tổ chức giải đấu Karate K-SPORT.",
};

export default function LoginPage() {
  return (
    <main id="main-content" className="auth-page">
      <div className="auth-aside">
        <Link href="/" className="auth-logo" translate="no">
          <span>K-</span>SPORT
        </Link>
        <p>Hệ thống ôn thi luật trọng tài WKF và điều hành giải đấu Karate.</p>
        <div className="auth-aside-features">
          <div className="auth-aside-feature">
            <span className="dot" />
            <span>378 câu hỏi Kumite & Kata chuẩn WKF</span>
          </div>
          <div className="auth-aside-feature">
            <span className="dot" />
            <span>Đồng bộ tiến độ học & lịch sử thi trực tuyến</span>
          </div>
          <div className="auth-aside-feature">
            <span className="dot" />
            <span>Đăng nhập 1 chạm với tài khoản Google</span>
          </div>
        </div>
        <Link href="/wkf-exam" className="text-action">
          ← Về WKF Referee Academy
        </Link>
      </div>
      <section className="auth-panel">
        <p className="auth-context">K-SPORT · WKF REFEREE ACADEMY</p>
        <h1>Đăng nhập / Đăng ký</h1>
        <p className="auth-lead">
          Dành cho học viên, trọng tài ôn thi luật WKF và ban tổ chức điều hành giải đấu.
        </p>
        <AuthForm />
      </section>
    </main>
  );
}
