import type { Metadata } from "next";
import { AdminSponsorsManager } from "@/components/admin-sponsors-manager";

export const metadata: Metadata = {
  title: "Quản lý Nhà tài trợ & Đối tác · K-SPORT Admin",
  description: "Thêm, sửa logo và banner các đối tác, nhà tài trợ võ phục và giải đấu",
};

export default function AdminSponsorsPage() {
  return (
    <>
      <div className="admin-title">
        <h1>Nhà tài trợ & Đối tác K-SPORT</h1>
        <p>Quản lý các thương hiệu võ phục, nhà tài trợ kim cương, vàng và đơn vị đồng hành cùng giải đấu.</p>
      </div>
      <AdminSponsorsManager />
    </>
  );
}

