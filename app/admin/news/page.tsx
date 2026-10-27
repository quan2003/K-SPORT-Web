import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Quản lý tin tức" };
export default function AdminNewsPage() { return <><div className="admin-title"><div><p className="admin-context">NỘI DUNG</p><h1>Tin tức</h1><p>Soạn, duyệt và xuất bản nội dung Karate.</p></div><button className="button red" type="button" disabled>Viết bài mới →</button></div><section className="admin-table-empty"><h2>Chưa có kết nối nội dung</h2><p>Danh sách bài viết và trình soạn thảo sẽ mở sau khi Identity API và Content API được cấu hình.</p><Link href="/login">Đăng nhập quản trị →</Link></section></>; }
