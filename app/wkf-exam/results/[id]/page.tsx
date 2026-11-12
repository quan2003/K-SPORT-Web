import type { Metadata } from "next";
import { InternalLayout } from "@/components/portal-ui";
import { ExamResultView } from "@/components/wkf-exam/exam-result-view";
import { WkfSubnav } from "@/components/wkf-exam/wkf-subnav";
import { getPublicSession } from "@/lib/auth";
import { getAttemptForOwner } from "@/lib/wkf-exam/attempt-service";

export const metadata: Metadata = {
  title: "Kết quả bài thi & Xem đáp án — WKF Referee Academy",
  description:
    "Tổng kết điểm số, tỷ lệ trả lời đúng, thời gian hoàn thành và đối chiếu đáp án chi tiết từng câu hỏi luật Karate WKF.",
};

export default async function WkfExamResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getPublicSession();
  const initialServerAttempt = getAttemptForOwner(id, session?.userId);

  return (
    <InternalLayout>
      <section className="wkf-hero wkf-hero-compact">
        <div className="wkf-hero-inner">
          <p className="wkf-hero-eyebrow">WKF REFEREE ACADEMY · KẾT QUẢ CHẤM ĐIỂM</p>
          <h1>Kết quả bài làm &amp; Đối chiếu đáp án</h1>
          <p className="wkf-hero-desc">
            Xem thống kê độ chính xác, kiểm tra lại từng câu trả lời và thực hiện Thi lại hoặc Ôn câu sai.
          </p>
        </div>
      </section>

      <WkfSubnav />

      <ExamResultView
        attemptId={id}
        initialServerAttempt={initialServerAttempt}
      />
    </InternalLayout>
  );
}

