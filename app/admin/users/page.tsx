import type { Metadata } from "next";
import { AdminDirectory } from "@/components/admin-directory";

export const metadata: Metadata = { title: "Quản lý người dùng" };

export default function AdminUsersPage() { return <AdminDirectory kind="users" />; }
