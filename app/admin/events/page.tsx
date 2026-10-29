import type { Metadata } from "next";
import { AdminDirectory } from "@/components/admin-directory";

export const metadata: Metadata = { title: "Quản lý giải đấu" };

export default function AdminEventsPage() { return <AdminDirectory kind="events" />; }
