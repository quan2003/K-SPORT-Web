import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Quản lý người dùng" };
export default function AdminUsersPage() { return <><div className="admin-title"><div><p className="admin-context">QUYỀN TRUY CẬP</p><h1>Người dùng</h1><p>Phân quyền quản trị viên, biên tập viên và tài khoản tổ chức.</p></div><button className="button red" type="button" disabled>Mời người dùng →</button></div><section className="admin-table-empty"><h2>Danh sách người dùng được bảo vệ</h2><p>Không hiển thị tài khoản khi chưa xác thực với Identity API. Website không tự tạo hoặc lưu thông tin đăng nhập.</p><Link href="/login">Đăng nhập quản trị →</Link></section></>; }
