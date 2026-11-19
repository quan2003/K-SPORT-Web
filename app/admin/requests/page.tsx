import { AdminRemoteList } from "@/components/admin-remote-list";
import { mayManageLicenses } from "@/lib/license-access";
import { redirect } from "next/navigation";
export default async function RequestsPage() { if (!(await mayManageLicenses())) redirect("/admin/licenses"); return <AdminRemoteList title="Yêu cầu hỗ trợ" description="Các yêu cầu cấp và xử lý license từ người dùng." endpoint="/api/admin/remote/license/requests" columns={["id", "email", "status", "created_at"]} empty="Chưa có yêu cầu." />; }
