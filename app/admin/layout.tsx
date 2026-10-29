import { AdminShell } from "@/components/admin-shell";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_TOKEN_COOKIE } from "@/lib/admin-api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) redirect("/login");
  return <AdminShell>{children}</AdminShell>;
}
