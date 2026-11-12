import type { Metadata } from "next";
import { InternalLayout } from "@/components/portal-ui";
import { WkfHomeClient } from "@/components/wkf-exam/wkf-home-client";
import { WkfSubnav } from "@/components/wkf-exam/wkf-subnav";
import { getPublicSession } from "@/lib/auth";
import { getQuestionBank } from "@/lib/wkf-exam/question-bank";

export const metadata: Metadata = {
  title: "WKF Referee Academy — Ôn thi luật trọng tài Karate WKF",
  description:
    "Luyện tập kiến thức luật Karate, thi thử trực tuyến 378 câu hỏi Kumite và Kata & Para Karate WKF và theo dõi tiến độ học tập.",
};

export default async function WkfExamHomePage() {
  const bank = getQuestionBank();
  const session = await getPublicSession();

  return (
    <InternalLayout>
      {/* Hero Section per Section 7 specification */}
      <section className="wkf-hero">
        <div className="wkf-hero-inner">
          <p className="wkf-hero-eyebrow">WKF REFEREE ACADEMY</p>
          <h1>Ôn thi luật trọng tài Karate WKF</h1>
          <p className="wkf-hero-desc">
            Luyện tập kiến thức luật Karate, thi thử trực tuyến và theo dõi tiến độ học tập.
          </p>
        </div>
      </section>

      <WkfSubnav />

      <WkfHomeClient
        categories={bank.categories}
        bankVersion={bank.bankVersion}
        authenticatedUserName={session?.name ?? null}
      />
    </InternalLayout>
  );
}

