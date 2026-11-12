"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SOFTWARE_RELEASE } from "@/lib/software-release";
import { DownloadModal } from "@/components/download-modal";

const navLinks = [
  { label: "Trang chủ", href: "/" },
  { label: "Giải đấu", href: "/events" },
  { label: "Lịch thi đấu", href: "/schedule" },
  { label: "Xếp hạng", href: "/ranking" },
  { label: "Vận động viên", href: "/athletes" },
  { label: "Thi Trọng tài WKF", href: "/wkf-exam" },
  { label: "Tin tức", href: "/news" },
  { label: "Phần mềm", href: "/software" },
  { label: "Liên hệ", href: "/contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return () => document.body.classList.remove("menu-open");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/events?query=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setOpen(false);
  };

  return (
    <>
      {/* Top Utility Announcement Bar */}
      <div className="ks-topbar" aria-label="Thông báo K-SPORT">
        <div className="ks-topbar-inner">
          <div className="ks-topbar-left">
            <span className="ks-topbar-live-dot" />
            <span className="ks-topbar-text">
              Hệ thống quản lý & điều hành giải đấu Karate Việt Nam chuẩn WKF
            </span>
          </div>
          <div className="ks-topbar-right">
            <a href="https://zalo.me/0336440523" target="_blank" rel="noreferrer" className="ks-topbar-link">
              <span>Hỗ trợ kỹ thuật: <strong>0336 440 523</strong> (Zalo)</span>
            </a>
            <span className="ks-topbar-divider">|</span>
            <Link href="/contact" className="ks-topbar-link">
              Tư vấn tổ chức giải
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`ks-main-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="ks-header-container">
          {/* Logo Brand */}
          <Link href="/" className="ks-header-brand" aria-label="K-SPORT Trang chủ">
            <Image
              src="/images/logo-header.png"
              alt="K-SPORT Karate Portal"
              width={220}
              height={70}
              priority
              className="ks-brand-img"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="ks-desktop-nav" aria-label="Điều hướng chính">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`ks-nav-item ${isActive ? "is-active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                  {isActive && <span className="ks-nav-active-pill" />}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="ks-header-actions">
            {/* Search Bar / Toggle */}
            <div className={`ks-header-search-wrap ${searchOpen ? "is-open" : ""}`}>
              {searchOpen ? (
                <form className="ks-header-search-form" onSubmit={handleSearchSubmit} role="search">
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Tìm giải đấu, VĐV..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="ks-search-input"
                  />
                  <button type="submit" className="ks-search-submit-btn" aria-label="Tìm kiếm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="ks-search-close-btn"
                    onClick={() => setSearchOpen(false)}
                    aria-label="Đóng tìm kiếm"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  className="ks-header-icon-btn"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Mở tìm kiếm"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              )}
            </div>

            {/* CTA Button: Software Download */}
            <div
              className="ks-header-cta-wrapper"
              onMouseEnter={() => setDownloadOpen(true)}
              onMouseLeave={() => setDownloadOpen(false)}
            >
              <button
                type="button"
                className="ks-header-cta-btn"
                onClick={() => setModalOpen(true)}
                title={`Tải phần mềm K-SPORT ${SOFTWARE_RELEASE.tag} - Chọn hệ điều hành`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Phần Mềm K-SPORT</span>
                <span className="ks-cta-badge">{SOFTWARE_RELEASE.tag}</span>
              </button>

              {/* Download Dropdown on Hover/Focus */}
              {downloadOpen && (
                <div className="ks-header-download-menu" role="menu">
                  <div className="ks-download-menu-head">
                    <div className="ks-download-ver-row">
                      <span className="ks-download-dot" />
                      <strong>K-SPORT {SOFTWARE_RELEASE.tag}</strong>
                      <span className="ks-download-status">Mới nhất</span>
                    </div>
                    <p className="ks-download-desc">Phần mềm quản lý giải đấu & bảng điểm Tatami chuẩn WKF</p>
                  </div>

                  <div className="ks-download-menu-body">
                    <a
                      href={SOFTWARE_RELEASE.downloadWindows}
                      className="ks-download-item primary"
                      role="menuitem"
                      download
                    >
                      <div className="ks-download-item-icon win">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.951-1.801" />
                        </svg>
                      </div>
                      <div className="ks-download-item-info">
                        <strong>Tải bản Windows (.exe)</strong>
                        <span>Cài đặt cho máy tính bàn thư ký & điều hành thảm</span>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </a>

                    <a
                      href={SOFTWARE_RELEASE.downloadMac}
                      className="ks-download-item"
                      role="menuitem"
                      download
                    >
                      <div className="ks-download-item-icon mac">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.17.65-2.83 1.42-.58.67-1.06 1.74-.98 2.81 1.07.08 2.19-.61 2.8-1.36z" />
                        </svg>
                      </div>
                      <div className="ks-download-item-info">
                        <strong>Bản cho macOS (.dmg)</strong>
                        <span>File .dmg cho Macbook chip M1–M4 & Intel</span>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </a>

                    <a
                      href={SOFTWARE_RELEASE.downloadLinux}
                      className="ks-download-item"
                      role="menuitem"
                      download
                    >
                      <div className="ks-download-item-icon linux" style={{ background: "#ffffff", border: "1px solid #cbd5e1" }}>
                        <Image
                          src="/images/linux-tux.jpg"
                          alt="Linux Tux"
                          width={26}
                          height={30}
                          className="ks-tux-img"
                        />
                      </div>
                      <div className="ks-download-item-info">
                        <strong>Bản cho Linux (.AppImage)</strong>
                        <span>File chạy trực tiếp cho Ubuntu & Debian</span>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </a>

                    <button
                      type="button"
                      className="ks-download-item trigger-modal"
                      onClick={() => {
                        setDownloadOpen(false);
                        setModalOpen(true);
                      }}
                      role="menuitem"
                    >
                      <div className="ks-download-item-icon all">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                      </div>
                      <div className="ks-download-item-info">
                        <strong>Mở Bảng Chọn Hệ Điều Hành Chi Tiết</strong>
                        <span>Xem thông tin yêu cầu và hướng dẫn cài đặt</span>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>

                  <div className="ks-download-menu-foot">
                    <Link href="/software" className="ks-download-foot-link" onClick={() => setDownloadOpen(false)}>
                      <span>Xem giới thiệu tính năng phần mềm & bảng điểm</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              ref={menuBtnRef}
              type="button"
              className={`ks-mobile-menu-btn ${open ? "is-open" : ""}`}
              onClick={() => setOpen(!open)}
              aria-label={open ? "Đóng menu" : "Mở menu"}
              aria-expanded={open}
            >
              <span className="line" />
              <span className="line" />
              <span className="line" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {open && (
          <div className="ks-mobile-drawer-backdrop" onClick={() => setOpen(false)}>
            <nav
              ref={mobileNavRef}
              className="ks-mobile-drawer"
              onClick={(e) => e.stopPropagation()}
              aria-label="Menu di động"
            >
              <div className="ks-drawer-header">
                <Link href="/" className="ks-drawer-logo" onClick={() => setOpen(false)}>
                  <Image
                    src="/images/logo-header.png"
                    alt="K-SPORT"
                    width={180}
                    height={58}
                    className="ks-brand-img"
                  />
                </Link>
                <button
                  type="button"
                  className="ks-drawer-close"
                  onClick={() => setOpen(false)}
                  aria-label="Đóng menu"
                >
                  ✕
                </button>
              </div>

              {/* Mobile Search */}
              <form className="ks-drawer-search" onSubmit={handleSearchSubmit}>
                <input
                  type="search"
                  placeholder="Tìm giải đấu, võ sĩ..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" aria-label="Tìm kiếm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </form>

              {/* Mobile Links List */}
              <div className="ks-drawer-links">
                {navLinks.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href));

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`ks-drawer-link-item ${isActive ? "is-active" : ""}`}
                      onClick={() => setOpen(false)}
                    >
                      <span>{link.label}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Drawer Footer */}
              <div className="ks-drawer-footer">
                <button
                  type="button"
                  className="ks-drawer-primary-btn"
                  onClick={() => {
                    setOpen(false);
                    setModalOpen(true);
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Tải Phần Mềm K-SPORT ({SOFTWARE_RELEASE.tag})</span>
                </button>

                <div className="ks-drawer-contact-info">
                  <p>Hỗ trợ kỹ thuật sàn đấu: <strong>0336 440 523</strong></p>
                  <p>Email: <a href="mailto:lienhe@k-sport.net">lienhe@k-sport.net</a></p>
                </div>
              </div>
            </nav>
          </div>
        )}

        {/* OS Selection Download Modal */}
        <DownloadModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </header>
    </>
  );
}
