import { AdminRemoteList } from "@/components/admin-remote-list";
import { mayManageLicenses } from "@/lib/license-access";
import { redirect } from "next/navigation";
export default async function TournamentsPage() { if (!(await mayManageLicenses())) redirect("/admin/licenses"); return <AdminRemoteList title="Giải đấu & Storage" description="Các giải đấu đang được đồng bộ từ Cloud/VPS." endpoint="/api/admin/remote/cloud-sync/tournaments" columns={["name", "status", "id"]} empty="Chưa có giải đấu được đồng bộ." />; }
