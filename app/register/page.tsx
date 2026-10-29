import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Đăng ký tài khoản" };

export default function RegisterPage() { redirect("/login"); }
