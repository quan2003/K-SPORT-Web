import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDirectory } from "@/components/admin-directory";
import { getPublicSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Quản lý giải đấu" };
export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const session = await getPublicSession();
  if (session?.role === "btc") redirect("/admin/btc");
  return <AdminDirectory kind="events" />;
}
