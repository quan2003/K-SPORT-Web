import type { Metadata } from "next";
import { InternalLayout } from "@/components/portal-ui";
import { QuizConfigView } from "@/components/wkf-exam/quiz-config-view";
import { WkfSubnav } from "@/components/wkf-exam/wkf-subnav";
import { getQuestionBank } from "@/lib/wkf-exam/question-bank";

export const metadata: Metadata = {
  title: "Đề thi Luật Kumite (246 câu) — WKF Referee Academy",
  description:
    "Luyện tập và thi thử 246 câu hỏi Đúng/Sai luật thi đấu Kumite dành cho Trọng tài và Giám định Karate.",
};

export default async function WkfKumiteConfigPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialMode = params.mode === "exam" ? "exam" : "practice";
  const bank = getQuestionBank();

  return (
    <InternalLayout>
      <section className="wkf-hero wkf-hero-compact">
        <div className="wkf-hero-inner">
          <p className="wkf-hero-eyebrow">WKF REFEREE ACADEMY · BỘ ĐỀ 01</p>
          <h1>Bộ đề Luật thi đấu Kumite (246 câu)</h1>
          <p className="wkf-hero-desc">
            Chọn chế độ Luyện tập hoặc Thi thử, thiết lập số lượng câu hỏi và bắt đầu lượt làm bài với thứ tự câu hỏi ngẫu nhiên độc lập.
          </p>
        </div>
      </section>

      <WkfSubnav />

      <QuizConfigView
        categoryMeta={bank.categories.kumite}
        initialMode={initialMode}
      />
    </InternalLayout>
  );
}

