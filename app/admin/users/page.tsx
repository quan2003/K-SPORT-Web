import type { Metadata } from "next";
import { AdminUsersManager } from "@/components/admin-users-manager";

export const metadata: Metadata = {
  title: "Người dùng & Phân quyền · K-SPORT Admin",
  description: "Quản lý tài khoản điều hành, phân quyền Ban Tổ Chức (BTC) và trọng tài",
};

export default function AdminUsersPage() {
  return <AdminUsersManager />;
}
