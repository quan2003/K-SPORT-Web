import type { Metadata } from "next";
import { InternalLayout } from "@/components/portal-ui";
import { RankingView } from "@/components/ranking/ranking-view";
import { getRanking, getAthletes } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Bảng Xếp Hạng Vận Động Viên Karate Toàn Quốc | K-SPORT",
  description: "Bảng xếp hạng vận động viên Karate chính thức theo mùa giải, hạng cân, điểm tích lũy và thành tích thi đấu hệ thống K-SPORT.",
};

function valueOf(value: string | string[] | undefined, fallback = "all") {
  return typeof value === "string" && value ? value : fallback;
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const category = valueOf(params.category);
  const season = valueOf(params.season);
  const topParam = typeof params.top === "string" ? Number.parseInt(params.top, 10) : 10;
  const top = [10, 32, 64, 9999].includes(topParam) ? topParam : 10;

  const [ranking, athletes] = await Promise.all([getRanking(), getAthletes()]);

  return (
    <InternalLayout>
      {/* Premium Sports Header - Synchronized with /events & /schedule */}
      <section className="ks-events-hero-section">
        <div className="ks-section-container">
          <div className="ks-events-hero-content">
            <span className="ks-eyebrow-tag">HỆ THỐNG XẾP HẠNG & TÍCH LŨY ĐIỂM K-SPORT</span>
            <h1 className="ks-events-hero-title">
              Bảng Xếp Hạng Vận Động Viên Karate
            </h1>
            <p className="ks-events-hero-sub">
              Tra cứu thứ hạng, số điểm tích lũy và phong độ thi đấu của các vận động viên Kumite và Kata trên toàn quốc. Cập nhật liên tục từ kết quả các giải đấu chính thức.
            </p>
          </div>
        </div>
      </section>

      {/* Main Ranking Console */}
      <section className="ks-ranking-catalog-section">
        <div className="ks-section-container">
          <RankingView
            initialRanking={ranking}
            athletes={athletes}
            initialCategory={category}
            initialSeason={season}
            initialTop={top}
          />
        </div>
      </section>
    </InternalLayout>
  );
}
