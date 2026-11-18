import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminWkfManager } from "@/components/wkf-exam/admin-wkf-manager";
import { getPublicSession } from "@/lib/auth";
import {
  getImportAuditReport,
  getQuestionBank,
  validateQuestionBankIntegrity,
} from "@/lib/wkf-exam/question-bank";

export const metadata: Metadata = {
  title: "Quản trị Ngân hàng đề WKF Exam | K-SPORT Admin",
  description:
    "Quản lý 378 câu hỏi luật trọng tài Karate WKF, kiểm duyệt bản dịch tiếng Việt, giải thích luật và kiểm toán dữ liệu.",
};

export default async function AdminWkfExamPage() {
  const session = await getPublicSession();
  if (!session) {
    redirect("/login");
  }
  if (session.role === "btc") {
    redirect("/admin/btc");
  }

  const bank = getQuestionBank();
  const auditReport = getImportAuditReport();
  const integrity = validateQuestionBankIntegrity(bank);

  return (
    <AdminWkfManager
      initialBank={bank}
      initialAudit={auditReport}
      initialIntegrity={integrity}
    />
  );
}

