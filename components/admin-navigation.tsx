"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  ["Tổng quan", "/admin"],
  ["Banner", "/admin/banners"],
  ["Tin tức", "/admin/news"],
  ["Giải đấu", "/admin/events"],
  ["Người dùng", "/admin/users"],
] as const;

export function AdminNavigation() {
  const pathname = usePathname();

  return <nav aria-label="Điều hướng quản trị">
    {nav.map(([label, href]) => {
      const isCurrent = href === "/admin" ? pathname === href : pathname.startsWith(href);
      return <Link href={href} key={href} aria-current={isCurrent ? "page" : undefined}>{label}</Link>;
    })}
  </nav>;
}
