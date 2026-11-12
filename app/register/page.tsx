import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Đăng ký tài khoản — K-SPORT WKF Academy",
};

export default function RegisterPage() {
  redirect("/login?tab=register");
}
