import type { Metadata } from "next";
import { InternalLayout } from "@/components/portal-ui";
import { MistakesReviewView } from "@/components/wkf-exam/mistakes-review-view";
import { WkfSubnav } from "@/components/wkf-exam/wkf-subnav";
import type { ExamCategory } from "@/lib/wkf-exam/types";

export const metadata: Metadata = {
  title: "Ôn lại câu sai — WKF Referee Academy",
  description:
    "Ôn tập chuyên sâu các câu hỏi luật trọng tài Karate WKF từng trả lời sai thuộc hai bộ đề Kumite và Kata & Para Karate.",
};

export default async function WkfExamMistakesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const catParam = params.category;
  const initialCategory: ExamCategory | "all" =
    catParam === "kumite" || catParam === "kata" ? catParam : "all";

  return (
    <InternalLayout>
      <section className="wkf-hero wkf-hero-compact">
        <div className="wkf-hero-inner">
          <p className="wkf-hero-eyebrow">WKF REFEREE ACADEMY · ÔN TẬP TRỌNG TÂM</p>
          <h1>Ôn lại câu trả lời sai</h1>
          <p className="wkf-hero-desc">
            Tập trung rèn luyện các câu hỏi chưa trả lời đúng ở lần gần nhất. Thứ tự câu hỏi được xáo trộn mới mỗi khi bắt đầu lượt ôn.
          </p>
        </div>
      </section>

      <WkfSubnav />

      <MistakesReviewView initialCategory={initialCategory} />
    </InternalLayout>
  );
}

