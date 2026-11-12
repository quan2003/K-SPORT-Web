import type { Metadata } from "next";
import { InternalLayout } from "@/components/portal-ui";
import { PracticeSessionView } from "@/components/wkf-exam/practice-session-view";
import { WkfSubnav } from "@/components/wkf-exam/wkf-subnav";
import { getPublicSession } from "@/lib/auth";
import { getAttemptForOwner } from "@/lib/wkf-exam/attempt-service";

export const metadata: Metadata = {
  title: "Làm bài ôn thi Luật WKF — WKF Referee Academy",
  description:
    "Màn hình làm bài Luyện tập và Thi thử câu hỏi Đúng/Sai luật trọng tài Karate WKF.",
};

export default async function WkfPracticeSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getPublicSession();
  const initialServerAttempt = getAttemptForOwner(id, session?.userId);

  return (
    <InternalLayout>
      <section className="wkf-hero wkf-hero-session">
        <div className="wkf-hero-inner">
          <p className="wkf-hero-eyebrow">WKF REFEREE ACADEMY · PHÒNG LÀM BÀI</p>
          <h1>Phiên làm bài Luật Trọng tài Karate WKF</h1>
        </div>
      </section>

      <WkfSubnav />

      <PracticeSessionView
        attemptId={id}
        initialServerAttempt={initialServerAttempt}
      />
    </InternalLayout>
  );
}

