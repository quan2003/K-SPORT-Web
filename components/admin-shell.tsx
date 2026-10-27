import Link from "next/link";
import { getPublicSession } from "@/lib/auth";

const nav = [
  ["Tổng quan", "/admin"],
  ["Tin tức", "/admin/news"],
  ["Giải đấu", "/admin/events"],
  ["Người dùng", "/admin/users"],
] as const;

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await getPublicSession();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/" translate="no"><span>K-</span>SPORT<small>Quản trị cổng thông tin</small></Link>
        <nav aria-label="Điều hướng quản trị">{nav.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav>
        <Link className="admin-back" href="/">← Về cổng thông tin</Link>
      </aside>
      <section className="admin-workspace">
        <header className="admin-topbar"><div><span>K-SPORT Admin</span><strong>{session ? session.name : "Chưa xác thực"}</strong></div><Link href="/login">Đăng nhập</Link></header>
        <main id="main-content" className="admin-main">{children}</main>
      </section>
    </div>
  );
}
