import { AdminRemoteList } from "@/components/admin-remote-list";
import { mayManageLicenses } from "@/lib/license-access";
import { redirect } from "next/navigation";
export default async function PaymentConfigPage() { if (!(await mayManageLicenses())) redirect("/admin/licenses"); return <AdminRemoteList title="VietQR & Gói" description="Cấu hình gói và thông tin thanh toán từ máy chủ." endpoint="/api/admin/remote/admin/pricing" columns={["id", "name", "price", "active"]} empty="Chưa có cấu hình gói." />; }
