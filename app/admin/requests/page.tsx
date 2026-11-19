import { RequestsManager } from "@/components/requests-manager";
import { mayManageLicenses } from "@/lib/license-access";
import { redirect } from "next/navigation";
export default async function RequestsPage() { if (!(await mayManageLicenses())) redirect("/admin/licenses"); return <RequestsManager />; }
