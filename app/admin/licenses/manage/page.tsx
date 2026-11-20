import { redirect } from "next/navigation";
import { LicenseManager } from "@/components/license-manager";
import { ProtectedAdminPortal } from "@/components/protected-admin-portal";
import { mayManageLicenses } from "@/lib/license-access";

export const dynamic = "force-dynamic";

export default async function LicenseManagementPage() {
  if (!(await mayManageLicenses())) redirect("/admin/licenses");

  return (
    <ProtectedAdminPortal>
      <LicenseManager />
    </ProtectedAdminPortal>
  );
}
