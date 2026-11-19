import { AdminRemoteList } from "@/components/admin-remote-list";
import { mayManageLicenses } from "@/lib/license-access";
import { redirect } from "next/navigation";
export default async function PaymentOrdersPage() { if (!(await mayManageLicenses())) redirect("/admin/licenses"); return <AdminRemoteList title="Đơn hàng" description="Theo dõi đơn hàng và trạng thái thanh toán." endpoint="/api/admin/remote/admin/payment-orders" columns={["id", "email", "status", "amount"]} empty="Chưa có đơn hàng." />; }
