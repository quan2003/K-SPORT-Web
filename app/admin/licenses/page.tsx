import { LicenseAccessGate } from "@/components/license-access-gate";
import { LicenseManager } from "@/components/license-manager";
import { mayManageLicenses } from "@/lib/license-access";

export const dynamic = "force-dynamic";

export default async function AdminLicensesPage() {
  return (await mayManageLicenses()) ? <LicenseManager /> : <LicenseAccessGate />;
}
