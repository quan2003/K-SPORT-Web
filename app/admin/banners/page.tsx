import type { Metadata } from "next";
import { AdminContentManager } from "@/components/admin-content-manager";

export const metadata: Metadata = { title: "Banner trang chủ" };

export default function AdminBannersPage() {
  return <><div className="admin-title"><h1>Banner trang chủ</h1><p>Tạo, sửa và công khai các banner hiển thị trên cổng K-SPORT.</p></div><AdminContentManager kind="banners" /></>;
}
