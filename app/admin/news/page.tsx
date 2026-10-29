import type { Metadata } from "next";
import { AdminContentManager } from "@/components/admin-content-manager";
export const metadata: Metadata = { title: "Quản lý tin tức" };
export default function AdminNewsPage() { return <><div className="admin-title"><div><h1>Tin tức</h1><p>Soạn, lưu nháp và xuất bản nội dung Karate.</p></div></div><AdminContentManager kind="news" /></>; }
