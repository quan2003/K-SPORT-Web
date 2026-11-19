import { TournamentsManager } from "@/components/tournaments-manager";
import { mayManageLicenses } from "@/lib/license-access";
import { redirect } from "next/navigation";
export default async function TournamentsPage() { if (!(await mayManageLicenses())) redirect("/admin/licenses"); return <TournamentsManager />; }
