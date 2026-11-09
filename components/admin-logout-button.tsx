"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault();
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // fallback
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <form action="/api/admin/logout" method="POST" className="admin-logout-form">
      <button
        type="submit"
        onClick={handleLogout}
        className="admin-logout-btn"
        title="Đăng xuất khỏi hệ thống"
        disabled={loggingOut}
      >
        {loggingOut ? "Đang đăng xuất..." : "Đăng xuất ⎋"}
      </button>
    </form>
  );
}
