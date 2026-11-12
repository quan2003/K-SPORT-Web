"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const subnavItems = [
  { label: "Tổng quan Academy", href: "/wkf-exam", exact: true },
  { label: "Kumite (246 câu)", href: "/wkf-exam/kumite", exact: false },
  { label: "Kata & Para Karate (132 câu)", href: "/wkf-exam/kata", exact: false },
  { label: "Ôn câu sai", href: "/wkf-exam/mistakes", exact: false },
  { label: "Lịch sử & Tiến độ", href: "/wkf-exam/history", exact: false },
];

export function WkfSubnav() {
  const pathname = usePathname();

  return (
    <nav className="wkf-subnav" aria-label="Điều hướng WKF Referee Academy">
      <div className="wkf-subnav-inner">
        <div className="wkf-subnav-links">
          {subnavItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`wkf-subnav-link ${isActive ? "is-active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="wkf-subnav-meta">
          <span>Ngân hàng đề gốc WKF: <strong>378 câu</strong> (True / False)</span>
        </div>
      </div>
    </nav>
  );
}

