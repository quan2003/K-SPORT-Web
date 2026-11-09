"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminNavigation } from "@/components/admin-navigation";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import type { PublicSession } from "@/lib/auth";

export function AdminShellClient({
  session,
  children,
}: {
  session: PublicSession | null;
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const isBtc = session?.role === "btc";

  // Close mobile drawer on route navigation during render
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Prevent background body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="admin-shell-v2">
      {/* 1. MOBILE TOP HEADER (VISIBLE ONLY ON MOBILE) */}
      <header className="admin-mobile-topbar" aria-label="Thanh điều hướng di động">
        <button
          type="button"
          className="admin-hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Đóng menu quản trị" : "Mở menu quản trị"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        <Link className="admin-mobile-brand" href="/admin" translate="no">
          <span className="brand-dot">🔴</span>
          <span className="brand-red">K-</span>SPORT
        </Link>

        <div className="admin-mobile-right">
          <span className="admin-mobile-role">
            {isBtc ? "🏆 BTC" : "👑 ADMIN"}
          </span>
          <Link className="admin-mobile-web-link" href="/" target="_blank" title="Xem website">
            ↗
          </Link>
        </div>
      </header>

      {/* 2. MOBILE BACKDROP OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="admin-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 3. SIDEBAR (PERMANENT ON DESKTOP, OFF-CANVAS DRAWER ON MOBILE) */}
      <aside className={`admin-sidebar-v2 ${mobileMenuOpen ? "is-drawer-open" : ""}`}>
        <div className="admin-sidebar-brand-box">
          <div className="sidebar-brand-row">
            <Link className="admin-brand-v2" href="/" translate="no">
              <span className="brand-dot">🔴</span>
              <span className="brand-red">K-</span>SPORT
            </Link>
            <button
              type="button"
              className="drawer-close-btn"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Đóng menu"
            >
              ✕
            </button>
          </div>
          <span className="admin-badge-v2">
            {isBtc ? "CỔNG BAN TỔ CHỨC" : "CỔNG QUẢN TRỊ VIÊN"}
          </span>
        </div>

        <div className="admin-sidebar-nav-wrap">
          <AdminNavigation role={session?.role} />
        </div>

        <div className="admin-sidebar-user-card">
          <div className="admin-avatar-box">
            {isBtc ? "🏆" : "🥋"}
          </div>
          <div className="admin-user-info">
            <strong>{session?.name || "Quản trị viên"}</strong>
            <span className="admin-role-tag">
              {isBtc ? "Ban Tổ Chức Giải" : "Quản trị tối cao"}
            </span>
          </div>
          <AdminLogoutButton />
        </div>
      </aside>

      {/* 4. MAIN WORKSPACE */}
      <section className="admin-workspace-v2">
        <header className="admin-topbar-v2">
          <div className="topbar-left">
            <span className="topbar-breadcrumb">
              Hệ thống K-SPORT &gt; <strong>{isBtc ? "Bảng Điều Hành Ban Tổ Chức" : "Trung Tâm Quản Trị"}</strong>
            </span>
          </div>
          <div className="topbar-right">
            <div className="topbar-role-badge">
              <span className="role-indicator-dot" />
              <span>Vai trò: <strong>{isBtc ? "Ban Tổ Chức (BTC)" : "Admin Toàn Quyền"}</strong></span>
            </div>
            <Link className="topbar-web-link" href="/" target="_blank">
              Xem website chính ↗
            </Link>
          </div>
        </header>

        <main id="main-content" className="admin-main-v2">
          {children}
        </main>
      </section>
    </div>
  );
}
