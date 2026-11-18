import type { Metadata } from "next";
import { InternalLayout } from "@/components/portal-ui";
import { QuizConfigView } from "@/components/wkf-exam/quiz-config-view";
import { WkfSubnav } from "@/components/wkf-exam/wkf-subnav";
import { WkfAuthGate } from "@/components/wkf-exam/wkf-auth-gate";
import { getUserSession } from "@/lib/auth";
import { getQuestionBank } from "@/lib/wkf-exam/question-bank";

export const metadata: Metadata = {
  title: "Đề thi Luật Kata & Para Karate (132 câu) — WKF Referee Academy",
  description:
    "Luyện tập và thi thử 132 câu hỏi Đúng/Sai luật thi đấu Kata và Para Karate dành cho Trọng tài và Giám định Karate WKF.",
};

export default async function WkfKataConfigPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialMode = params.mode === "exam" ? "exam" : "practice";
  const bank = getQuestionBank();
  const session = await getUserSession();

  return (
    <InternalLayout>
      <section className="wkf-hero wkf-hero-compact">
        <div className="wkf-hero-inner">
          <p className="wkf-hero-eyebrow">WKF REFEREE ACADEMY · BỘ ĐỀ 02</p>
          <h1>Bộ đề Luật thi đấu Kata & Para Karate (132 câu)</h1>
          <p className="wkf-hero-desc">
            Chọn chế độ Luyện tập hoặc Thi thử, thiết lập số lượng câu hỏi và bắt đầu lượt làm bài với thứ tự câu hỏi ngẫu nhiên độc lập.
          </p>
        </div>
      </section>

      <WkfSubnav />

      {session ? (
        <QuizConfigView
          categoryMeta={bank.categories.kata}
          initialMode={initialMode}
        />
      ) : (
        <WkfAuthGate
          title="Bộ đề Luật thi đấu Kata & Para Karate (132 câu)"
          category="kata"
          redirectPath="/wkf-exam/kata"
        />
      )}
    </InternalLayout>
  );
}
