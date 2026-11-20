import type { ReactNode } from "react";

export function ProtectedAdminPortal({ children }: { children: ReactNode }) {
  return (
    <section className="protected-admin-portal" aria-label="Khu quản trị riêng">
      {children}
    </section>
  );
}
