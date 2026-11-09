import { getPublicSession } from "@/lib/auth";
import { AdminShellClient } from "@/components/admin-shell-client";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await getPublicSession();
  return <AdminShellClient session={session}>{children}</AdminShellClient>;
}
