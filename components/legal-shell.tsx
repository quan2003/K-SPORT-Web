"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface LegalTocItem {
  id: string;
  num: string;
  title: string;
}

interface LegalShellProps {
  title: string;
  docSubtitle?: string;
  version?: string;
  effectiveDate?: string;
  toc: LegalTocItem[];
  children: React.ReactNode;
}

export function LegalShell({
  title,
  docSubtitle = "Cổng thông tin & Phần mềm Quản lý Giải đấu Karate Việt Nam chuẩn WKF",
  version = "2026.1",
  effectiveDate = "Tháng 01/2026",
  toc,
  children,
}: LegalShellProps) {
  const pathname = usePathname();

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="ks-legal-wrapper">
      <div className="ks-legal-container">
        {/* Top Legal Navigation Bar */}
        <div className="ks-legal-tabs-bar">
          <nav className="ks-legal-tabs" role="tablist" aria-label="Chuyển đổi văn bản pháp lý">
            <Link
              href="/privacy"
              className={`ks-legal-tab-item ${pathname === "/privacy" ? "is-active" : ""}`}
              role="tab"
              aria-selected={pathname === "/privacy"}
            >
              <span className="ks-legal-tab-icon" aria-hidden="true">🛡️</span>
              <span>Chính Sách Bảo Mật</span>
            </Link>
            <Link
              href="/terms"
              className={`ks-legal-tab-item ${pathname === "/terms" ? "is-active" : ""}`}
              role="tab"
              aria-selected={pathname === "/terms"}
            >
              <span className="ks-legal-tab-icon" aria-hidden="true">⚖️</span>
              <span>Điều Khoản Sử Dụng</span>
            </Link>
            <Link
              href="/cookies"
              className={`ks-legal-tab-item ${pathname === "/cookies" ? "is-active" : ""}`}
              role="tab"
              aria-selected={pathname === "/cookies"}
            >
              <span className="ks-legal-tab-icon" aria-hidden="true">🍪</span>
              <span>Chính Sách Cookie</span>
            </Link>
          </nav>

          <div className="ks-legal-actions">
            <button
              type="button"
              onClick={handlePrint}
              className="ks-legal-print-btn"
              title="In hoặc lưu văn bản dưới dạng PDF"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>In văn bản</span>
            </button>
          </div>
        </div>

        {/* 2-Column Executive Document Grid */}
        <div className="ks-legal-grid">
          {/* Left Sticky Sidebar Navigator */}
          <aside className="ks-legal-sidebar" aria-label="Mục lục văn bản">
            <div className="ks-legal-toc-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span>Mục Lục Văn Bản</span>
            </div>

            <nav>
              <ul className="ks-legal-toc-list">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="ks-legal-toc-link">
                      <span className="ks-legal-toc-num">{item.num}</span>
                      <span>{item.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Quick Contact Card */}
            <div className="ks-legal-sidebar-contact">
              <h5>Hỗ Trợ Pháp Lý & Kỹ Thuật</h5>
              <p>Ban thư ký & Bộ phận an toàn dữ liệu K-SPORT hỗ trợ các đoàn giải đấu:</p>
              <a href="https://zalo.me/0336440523" target="_blank" rel="noreferrer" className="ks-legal-support-pill">
                <span>💬 Hotline / Zalo:</span>
                <strong>0336 440 523</strong>
              </a>
              <a href="mailto:lienhe@k-sport.net" className="ks-legal-support-pill">
                <span>✉️ Email:</span>
                <strong>lienhe@k-sport.net</strong>
              </a>
            </div>
          </aside>

          {/* Right Main Paper Sheet */}
          <main className="ks-legal-paper">
            {/* Document Official Header */}
            <header className="ks-legal-doc-header">
              <div className="ks-legal-org-eyebrow">
                HỆ THỐNG ĐIỀU HÀNH GIẢI ĐẤU KARATE K-SPORT
              </div>
              <h1 className="ks-legal-doc-title">{title}</h1>
              <div className="ks-legal-doc-meta">
                <span className="ks-legal-meta-badge">VĂN BẢN QUY CHUẨN</span>
                <span className="ks-legal-meta-item">
                  <strong>Phiên bản:</strong> {version}
                </span>
                <span className="ks-legal-meta-item">
                  <strong>Hiệu lực:</strong> {effectiveDate}
                </span>
                <span className="ks-legal-meta-item">
                  <strong>Phạm vi:</strong> Giải đấu toàn quốc & Hệ thống Tatami WKF
                </span>
              </div>
            </header>

            {/* Main Document Content */}
            <div className="ks-legal-content-body">
              {children}
            </div>

            {/* Document Official Seal / Sign-off Block */}
            <footer className="ks-legal-seal-box">
              <div className="ks-legal-seal-left">
                <h4>BAN ĐIỀU HÀNH & BAN THƯ KÝ GIẢI ĐẤU K-SPORT</h4>
                <p>{docSubtitle}</p>
                <p style={{ marginTop: "4px", fontSize: "12px", color: "#94a3b8" }}>
                  Mọi sửa đổi, cập nhật văn bản đều được công bố chính thức trên cổng thông tin K-SPORT.
                </p>
              </div>
              <div className="ks-legal-seal-badge">
                <span aria-hidden="true">✓</span>
                <span>VĂN BẢN ĐÃ XÁC THỰC</span>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

