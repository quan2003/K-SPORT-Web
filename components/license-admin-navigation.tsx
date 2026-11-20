"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Tổng quan license", href: "/admin/licenses", icon: "overview" },
  { label: "Licenses", href: "/admin/licenses/manage", icon: "key" },
  { label: "Giải đấu & dữ liệu", href: "/admin/tournaments", icon: "trophy" },
  { label: "Đơn hàng", href: "/admin/payment-orders", icon: "receipt" },
  { label: "VietQR & Gói", href: "/admin/payment-config", icon: "card" },
  { label: "Yêu cầu hỗ trợ", href: "/admin/requests", icon: "message" },
] as const;

type AdminNavIconName = (typeof items)[number]["icon"];

function AdminNavIcon({ name }: { name: AdminNavIconName }) {
  const paths: Record<AdminNavIconName, ReactNode> = {
    overview: <><path d="M4 13h6V4H4z" /><path d="M14 20h6v-9h-6z" /><path d="M4 20h6v-3H4z" /><path d="M14 7h6V4h-6z" /></>,
    key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8" /><path d="m15 8 2 2" /><path d="m17 6 2 2" /></>,
    trophy: <><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v4a5 5 0 0 1-10 0z" /><path d="M7 6H4v2a4 4 0 0 0 4 4" /><path d="M17 6h3v2a4 4 0 0 1-4 4" /></>,
    receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6" /><path d="M9 12h6" /><path d="M9 16h4" /></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /><path d="M7 15h3" /></>,
    message: <path d="M21 12a8 8 0 0 1-8 8H5l-3 2 1-5a8 8 0 1 1 18-5Z" />,
  };

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function LicenseAdminNavigation() {
  const pathname = usePathname();
  return <nav className="admin-nav-v2 license-admin-nav" aria-label="Điều hướng quản trị license"><div className="admin-nav-group-title">KARATE ADMIN</div>{items.map(({ label, href, icon }) => { const active = href === "/admin/licenses" ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`admin-nav-item ${active ? "is-active" : ""}`}><span className="admin-nav-icon"><AdminNavIcon name={icon} /></span><span className="admin-nav-label">{label}</span></Link>; })}</nav>;
}
