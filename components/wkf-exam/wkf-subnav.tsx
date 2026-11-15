"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const subnavItems = [
  {
    label: "Tổng quan Academy",
    shortLabel: "Tổng quan",
    href: "/wkf-exam",
    exact: true,
  },
  {
    label: "Kumite (246 câu)",
    shortLabel: "Kumite (246)",
    href: "/wkf-exam/kumite",
    exact: false,
  },
  {
    label: "Kata & Para Karate (132 câu)",
    shortLabel: "Kata & Para (132)",
    href: "/wkf-exam/kata",
    exact: false,
  },
  {
    label: "Ôn câu sai",
    shortLabel: "Ôn câu sai",
    href: "/wkf-exam/mistakes",
    exact: false,
  },
  {
    label: "Lịch sử & Tiến độ",
    shortLabel: "Tiến độ",
    href: "/wkf-exam/history",
    exact: false,
  },
];

export function WkfSubnav() {
  const pathname = usePathname();
  const activeLinkRef = useRef<HTMLAnchorElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active item into visible center on mobile
  useEffect(() => {
    if (activeLinkRef.current && containerRef.current) {
      activeLinkRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [pathname]);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -180, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 180, behavior: "smooth" });
    }
  };

  return (
    <nav className="wkf-subnav" aria-label="Điều hướng WKF Referee Academy">
      <div className="wkf-subnav-inner">
        {/* Mobile Left Scroll Arrow */}
        <button
          type="button"
          className="wkf-subnav-arrow-btn left"
          onClick={scrollLeft}
          aria-label="Cuộn sang trái"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="wkf-subnav-links" ref={containerRef}>
          {subnavItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                ref={isActive ? activeLinkRef : undefined}
                aria-current={isActive ? "page" : undefined}
                className={`wkf-subnav-link ${isActive ? "is-active" : ""}`}
              >
                <span className="wkf-tab-full">{item.label}</span>
                <span className="wkf-tab-short">{item.shortLabel}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile Right Scroll Arrow */}
        <button
          type="button"
          className="wkf-subnav-arrow-btn right"
          onClick={scrollRight}
          aria-label="Cuộn sang phải"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
