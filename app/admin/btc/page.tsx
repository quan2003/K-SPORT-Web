import type { Metadata } from "next";
import { getPublicSession } from "@/lib/auth";
import { AdminBtcDashboard } from "@/components/admin-btc-dashboard";

export const metadata: Metadata = {
  title: "Bảng Điều Hành Ban Tổ Chức (BTC) · K-SPORT",
  description: "Trung tâm thống kê và vận hành giải đấu dành cho Ban Tổ Chức",
};

export default async function AdminBtcPage() {
  const session = await getPublicSession();
  return <AdminBtcDashboard session={session} />;
}

