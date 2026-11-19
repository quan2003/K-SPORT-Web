import { PaymentConfigManager } from "@/components/payment-config-manager";
import { mayManageLicenses } from "@/lib/license-access";
import { redirect } from "next/navigation";
export default async function PaymentConfigPage() { if (!(await mayManageLicenses())) redirect("/admin/licenses"); return <PaymentConfigManager />; }
