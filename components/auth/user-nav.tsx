"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { UserSession } from "@/lib/auth";
import { ProfileEditDialog } from "@/components/auth/profile-edit-dialog";

interface Props {
  initialSession?: UserSession | null;
  onOpenAuthModal?: (tab?: "login" | "register") => void;
  isMobileDrawer?: boolean;
}

export function UserNav({
  initialSession,
  onOpenAuthModal,
  isMobileDrawer = false,
}: Props) {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(initialSession ?? null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch current session on mount to ensure fresh state
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (data.authenticated && data.user) {
          setSession(data.user);
        } else {
          setSession(null);
        }
      } catch {
        // Keep initial
      }
    }
    checkSession();
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setSession(null);
      setDropdownOpen(false);
      window.location.reload();
    } catch {
      window.location.reload();
    } finally {
      setLoggingOut(false);
    }
  }

  const roleLabel =
    session?.role === "admin"
      ? "Quản trị viên"
      : session?.role === "btc"
      ? "Ban Tổ Chức"
      : "Thành viên";

  const initials = session?.name
    ? session.name
        .split(" ")
        .filter(Boolean)
        .slice(-2)
        .map((p) => p[0]?.toUpperCase())
        .join("") || "KS"
    : "KS";

  // Mobile drawer variant
  if (isMobileDrawer) {
    if (session) {
      return (
        <div className="ks-drawer-user-card">
          <div className="ks-drawer-user-info">
            <div className="ks-user-avatar-circle">{initials}</div>
            <div className="ks-drawer-user-text">
              <strong className="ks-user-display-name">{session.name}</strong>
              <span className="ks-user-role-badge">{roleLabel}</span>
              <span className="ks-user-email-text">{session.email}</span>
            </div>
          </div>
          <div className="ks-drawer-user-actions">
            <Link href="/wkf-exam/history" className="ks-drawer-user-action-btn">
              Tiến độ học & Lịch sử thi
            </Link>
            <button type="button" className="ks-drawer-user-action-btn" onClick={() => setEditingProfile(true)}>Chỉnh sửa thông tin</button>
            {session.role === "admin" && (
              <Link href="/admin" className="ks-drawer-user-action-btn">
                Trang Quản trị Admin
              </Link>
            )}
            {session.role === "btc" && (
              <Link href="/admin/btc" className="ks-drawer-user-action-btn">
                Bảng điều hành BTC
              </Link>
            )}
            <button
              type="button"
              className="ks-drawer-logout-btn"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </button>
          </div>
          {editingProfile && <ProfileEditDialog session={session} onClose={() => setEditingProfile(false)} onSaved={setSession} />}
        </div>
      );
    }

      return (
        <>
      <div className="ks-drawer-auth-buttons">
        <button
          type="button"
          className="ks-drawer-login-btn"
          onClick={() => (onOpenAuthModal ? onOpenAuthModal("login") : router.push("/login"))}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          <span className="ks-login-text-full">Đăng nhập</span>
        <span className="ks-login-text-short">Vào</span>
        </button>
        <button
          type="button"
          className="ks-drawer-register-btn"
          onClick={() => (onOpenAuthModal ? onOpenAuthModal("register") : router.push("/login?tab=register"))}
        >
          <span>Đăng ký</span>
        </button>
        </div></>
      );
  }

  // Desktop header variant
  if (session) {
    return (
      <div className="ks-user-nav-wrapper" ref={menuRef}>
        <button
          type="button"
          className="ks-user-profile-btn"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
          title={`${session.name} (${roleLabel})`}
        >
          <span className="ks-user-avatar-circle">{initials}</span>
          <span className="ks-user-btn-name">{session.name.split(" ").slice(-1)[0]}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`ks-user-chevron ${dropdownOpen ? "is-open" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="ks-user-dropdown-menu" role="menu">
            <div className="ks-user-dropdown-head">
              <strong>{session.name}</strong>
              <span className="ks-user-dropdown-role">{roleLabel}</span>
              <span className="ks-user-dropdown-email">{session.email}</span>
            </div>

            <div className="ks-user-dropdown-body">
              <Link
                href="/wkf-exam/history"
                className="ks-user-dropdown-item"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 20v-6M6 20V10M18 20V4" />
                </svg>
                <span>Tiến độ & Lịch sử thi</span>
              </Link>
              <button type="button" className="ks-user-dropdown-item" role="menuitem" onClick={() => { setDropdownOpen(false); setEditingProfile(true); }}>
                <span aria-hidden="true">✎</span><span>Chỉnh sửa thông tin</span>
              </button>
              <Link
                href="/wkf-exam/mistakes"
                className="ks-user-dropdown-item"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>Kho câu hỏi sai</span>
              </Link>
              {session.role === "admin" && (
                <Link
                  href="/admin"
                  className="ks-user-dropdown-item"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <span>Khu vực Quản trị Admin</span>
                </Link>
              )}
              {session.role === "btc" && (
                <Link
                  href="/admin/btc"
                  className="ks-user-dropdown-item"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                  </svg>
                  <span>Bảng điều hành BTC</span>
                </Link>
              )}
            </div>

            <div className="ks-user-dropdown-foot">
              <button
                type="button"
                className="ks-user-logout-action"
                onClick={handleLogout}
                disabled={loggingOut}
                role="menuitem"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>{loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
              </button>
            </div>
          </div>
        )}
        {editingProfile && <ProfileEditDialog session={session} onClose={() => setEditingProfile(false)} onSaved={setSession} />}
      </div>
    );
  }

  // Not logged in: Desktop header buttons
  return (
    <div className="ks-header-auth-group">
      <button
        type="button"
        className="ks-header-login-btn"
        onClick={() => (onOpenAuthModal ? onOpenAuthModal("login") : router.push("/login"))}
        aria-label="Đăng nhập tài khoản"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        <span className="ks-login-text-full">Đăng nhập</span>
        <span className="ks-login-text-short">Vào</span>
      </button>
    </div>
  );
}
