import { LicenseAccessGate } from "@/components/license-access-gate";
import { AdminRemoteDashboard } from "@/components/admin-remote-dashboard";
import { mayManageLicenses } from "@/lib/license-access";
import { ProtectedAdminPortal } from "@/components/protected-admin-portal";

export const dynamic = "force-dynamic";

export default async function AdminLicensesPage() {
  return (await mayManageLicenses())
    ? <ProtectedAdminPortal><AdminRemoteDashboard /></ProtectedAdminPortal>
    : <LicenseAccessGate />;
}
