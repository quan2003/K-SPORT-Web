import { PaymentOrdersManager } from "@/components/payment-orders-manager";
import { mayManageLicenses } from "@/lib/license-access";
import { redirect } from "next/navigation";
export default async function PaymentOrdersPage() { if (!(await mayManageLicenses())) redirect("/admin/licenses"); return <PaymentOrdersManager />; }
