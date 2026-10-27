import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Quản lý giải đấu" };
export default function AdminEventsPage() { return <><div className="admin-title"><div><p className="admin-context">VẬN HÀNH</p><h1>Giải đấu</h1><p>Quản lý lịch thi đấu, kết quả và trạng thái công bố.</p></div><Link className="button red" href="/login">Đăng nhập để quản lý →</Link></div><section className="admin-table-empty"><h2>Dữ liệu lấy từ hệ thống điều hành</h2><p>Trang quản trị không tạo bản ghi riêng. Nội dung sẽ đồng bộ từ API desktop/Admin sau khi được cấp quyền đọc và ghi phù hợp.</p></section></>; }
