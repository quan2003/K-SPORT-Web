"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminRole } from "@/lib/auth";

export function AdminNavigation({ role = "admin" }: { role?: AdminRole }) {
  const pathname = usePathname();

  // If role is BTC, show tournament operations focus
  const navItems =
    role === "btc"
      ? [
          { label: "Bảng Thống kê BTC", href: "/admin/btc", icon: "🏆", badge: "Ưu tiên" },
          { label: "Thông tin Giải đấu", href: "/admin/events", icon: "🥋" },
        ]
      : [
          { label: "Tổng quan", href: "/admin", icon: "📊" },
          { label: "Thống kê BTC", href: "/admin/btc", icon: "🏆", badge: "Role BTC" },
          { label: "Nhà tài trợ & Võ phục", href: "/admin/sponsors", icon: "🤝", badge: "Mới" },
          { label: "Banner trang chủ", href: "/admin/banners", icon: "🖼️" },
          { label: "Tin tức & Bài viết", href: "/admin/news", icon: "📰" },
          { label: "Giải đấu", href: "/admin/events", icon: "🥋" },
          { label: "Người dùng & Phân quyền", href: "/admin/users", icon: "👥" },
        ];

  return (
    <nav className="admin-nav-v2" aria-label="Điều hướng quản trị">
      <div className="admin-nav-group-title">
        {role === "btc" ? "ĐIỀU HÀNH GIẢI ĐẤU (BTC)" : "QUẢN TRỊ HỆ THỐNG K-SPORT"}
      </div>
      {navItems.map((item) => {
        const isCurrent = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            href={item.href}
            key={item.href}
            aria-current={isCurrent ? "page" : undefined}
            className={`admin-nav-item ${isCurrent ? "is-active" : ""}`}
          >
            <span className="admin-nav-icon">{item.icon}</span>
            <span className="admin-nav-label">{item.label}</span>
            {item.badge && <span className="admin-nav-pill">{item.badge}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
