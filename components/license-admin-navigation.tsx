"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["Tổng quan license", "/admin/licenses", "📊"],
  ["Licenses", "/admin/licenses#licenses", "🔑"],
  ["Giải đấu & Storage", "/admin/tournaments", "🏆"],
  ["Đơn hàng", "/admin/payment-orders", "🧾"],
  ["VietQR & Gói", "/admin/payment-config", "💳"],
  ["Yêu cầu hỗ trợ", "/admin/requests", "💬"],
] as const;

export function LicenseAdminNavigation() {
  const pathname = usePathname();
  return <nav className="admin-nav-v2 license-admin-nav" aria-label="Điều hướng quản trị license"><div className="admin-nav-group-title">KARATE ADMIN</div>{items.map(([label, href, icon]) => { const active = href.startsWith(pathname) || (pathname === "/admin/licenses" && href === "/admin/licenses"); return <Link key={href} href={href} className={`admin-nav-item ${active ? "is-active" : ""}`}><span className="admin-nav-icon" aria-hidden="true">{icon}</span><span className="admin-nav-label">{label}</span></Link>; })}</nav>;
}
