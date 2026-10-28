"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const links = [
  ["Trang chủ", "/"],
  ["Giải đấu", "/events"],
  ["Lịch thi đấu", "/schedule"],
  ["Xếp hạng", "/ranking"],
  ["Tin tức", "/news"],
  ["Vận động viên", "/athletes"],
  ["Phần mềm", "/software"],
  ["Liên hệ", "/contact"],
] as const;

function Brand() {
  return (
    <Link className="brand" href="/" translate="no" aria-label="K-SPORT, trang chủ">
      <Image className="brand-horizontal" src="/images/logo-header.png" alt="K-SPORT — Phần mềm quản lý giải đấu Karate" width={2159} height={728} priority />
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  const closeMenu = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return () => document.body.classList.remove("menu-open");

    const navigation = mobileNavRef.current;
    const focusable = navigation ? Array.from(navigation.querySelectorAll<HTMLElement>("button, a[href]")) : [];
    focusable[0]?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }
      if (event.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <header className="site-header">
      <Brand />
      <nav className="desktop-nav" aria-label="Điều hướng chính">
        {links.map(([label, href]) => (
          <Link key={href} href={href} aria-current={pathname === href || (href !== "/" && pathname.startsWith(href)) ? "page" : undefined}>{label}</Link>
        ))}
      </nav>
      <div className={`header-search-wrap${searchOpen ? " is-open" : ""}`}>
        {searchOpen && <form className="header-search-form" role="search" onSubmit={(event) => { event.preventDefault(); router.push(`/events${query.trim() ? `?query=${encodeURIComponent(query.trim())}` : ""}`); }}><label className="sr-only" htmlFor="site-search">Tìm kiếm</label><input id="site-search" name="query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm giải đấu…" autoComplete="off" spellCheck={false} autoFocus /><button type="submit" aria-label="Thực hiện tìm kiếm">→</button></form>}
        <button className="header-search" type="button" aria-label={searchOpen ? "Đóng tìm kiếm" : "Mở tìm kiếm"} aria-expanded={searchOpen} onClick={() => setSearchOpen((value) => !value)}>
          <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m16 16 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" /></svg>
        </button>
      </div>
      <button ref={menuButtonRef} className="menu-button" type="button" aria-label={open ? "Đóng menu" : "Mở menu"} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
        <span aria-hidden="true" />
      </button>
      {open && (
        <nav ref={mobileNavRef} id="mobile-nav" className="mobile-nav" aria-label="Điều hướng di động" aria-modal="true" role="dialog">
          <button className="mobile-menu-close" type="button" onClick={() => closeMenu(true)} aria-label="Đóng menu">×</button>
          {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
          <Link className="mobile-primary" href="/software" onClick={() => setOpen(false)}>Phần mềm K-SPORT</Link>
          <form className="mobile-search-form" role="search" onSubmit={(event) => { event.preventDefault(); router.push(`/events${query.trim() ? `?query=${encodeURIComponent(query.trim())}` : ""}`); setOpen(false); }}><label htmlFor="mobile-site-search">Tìm kiếm giải đấu</label><input id="mobile-site-search" name="query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nhập tên giải đấu…" autoComplete="off" spellCheck={false} /><button type="submit">Tìm kiếm →</button></form>
        </nav>
      )}
    </header>
  );
}
