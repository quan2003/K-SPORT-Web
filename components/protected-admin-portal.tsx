import type { ReactNode } from "react";
import Link from "next/link";
import { AdminRemoteDashboard } from "@/components/admin-remote-dashboard";

const links = [
  ["Tổng quan", "/admin/licenses"],
  ["Licenses", "/admin/licenses#licenses"],
  ["Giải đấu & dữ liệu", "/admin/tournaments"],
  ["Đơn hàng", "/admin/payment-orders"],
  ["VietQR & Gói", "/admin/payment-config"],
  ["Yêu cầu hỗ trợ", "/admin/requests"],
] as const;

export function ProtectedAdminPortal({ children }: { children: ReactNode }) {
  return (
    <section className="protected-admin-portal" aria-label="Khu quản trị riêng">
      <header className="protected-admin-header">
        <div>
          <p className="admin-eyebrow">KARATE ADMIN</p>
          <h1>Khu quản trị máy chủ</h1>
          <p>Dữ liệu đồng bộ từ hệ thống quản trị cũ.</p>
        </div>
        <nav aria-label="Điều hướng khu quản trị riêng">
          {links.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <AdminRemoteDashboard />
      {children}
    </section>
  );
}
