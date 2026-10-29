import Link from "next/link";
import { getPublicSession } from "@/lib/auth";
import { AdminNavigation } from "@/components/admin-navigation";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await getPublicSession();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/" translate="no"><span>K-</span>SPORT<small>Cổng quản trị nội dung</small></Link>
        <AdminNavigation />
        <Link className="admin-back" href="/">Xem cổng thông tin <span aria-hidden="true">↗</span></Link>
      </aside>
      <section className="admin-workspace">
        <header className="admin-topbar"><strong>{session?.name || "Quản trị nội dung"}</strong><Link href="/">Xem cổng thông tin <span aria-hidden="true">↗</span></Link></header>
        <main id="main-content" className="admin-main">{children}</main>
      </section>
    </div>
  );
}
