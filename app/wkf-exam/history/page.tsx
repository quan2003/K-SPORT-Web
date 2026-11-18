import type { Metadata } from "next";
import { InternalLayout } from "@/components/portal-ui";
import { HistoryView } from "@/components/wkf-exam/history-view";
import { WkfSubnav } from "@/components/wkf-exam/wkf-subnav";
import { getPublicSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Lịch sử & Tiến độ học tập — WKF Referee Academy",
  description:
    "Theo dõi tiến độ ôn tập, độ chính xác trung bình và lịch sử các lượt làm bài luật trọng tài Karate WKF.",
};

export default async function WkfExamHistoryPage() {
  const session = await getPublicSession();

  return (
    <InternalLayout>
      <section className="wkf-hero wkf-hero-compact">
        <div className="wkf-hero-inner">
          <p className="wkf-hero-eyebrow">WKF REFEREE ACADEMY · TIẾN ĐỘ CÁ NHÂN</p>
          <h1>Lịch sử làm bài &amp; Tiến độ học tập</h1>
          <p className="wkf-hero-desc">
            Tra cứu các bài đang làm dở, kết quả các lần thi đã hoàn thành và mức độ bao phủ 378 câu hỏi luật Karate WKF.
          </p>
        </div>
      </section>

      <WkfSubnav />

      <HistoryView authenticatedUserName={session?.name ?? null} />
    </InternalLayout>
  );
}

