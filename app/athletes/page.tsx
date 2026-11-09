import type { Metadata } from "next";
import { InternalLayout } from "@/components/portal-ui";
import { AthletesCatalogView } from "@/components/athletes/athletes-catalog-view";
import { getAthletes, groupAthletesForDirectory } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Danh Sách Vận Động Viên Karate | K-SPORT",
  description: "Tra cứu hồ sơ công khai, thẻ VĐV, thành tích thi đấu và tỷ lệ thắng của các VĐV Karate trên hệ thống K-SPORT.",
};

function valueOf(value: string | string[] | undefined, fallback = "") {
  return typeof value === "string" && value ? value : fallback;
}

export default async function AthletesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = valueOf(params.query);
  const category = valueOf(params.category, "all");

  const athletes = await getAthletes();
  const athleteDirectory = groupAthletesForDirectory(athletes);

  return (
    <InternalLayout>
      {/* Premium Sports Header - Synchronized with /events, /schedule & /ranking */}
      <section className="ks-events-hero-section">
        <div className="ks-section-container">
          <div className="ks-events-hero-content">
            <span className="ks-eyebrow-tag">HỒ SƠ VẬN ĐỘNG VIÊN & THẺ THI ĐẤU ĐIỆN TỬ K-SPORT</span>
            <h1 className="ks-events-hero-title">
              Danh Sách Vận Động Viên Karate
            </h1>
            <p className="ks-events-hero-sub">
              Tra cứu hồ sơ thi đấu, câu lạc bộ trực thuộc, nội dung tranh tài và phong độ thi đấu đối đầu của các vận động viên Kumite và Kata trên toàn quốc.
            </p>
          </div>
        </div>
      </section>

      {/* Main Athletes Catalog Console */}
      <section className="ks-athletes-catalog-section">
        <div className="ks-section-container">
          <AthletesCatalogView
            initialAthletes={athleteDirectory}
            initialQuery={query}
            initialCategory={category}
          />
        </div>
      </section>
    </InternalLayout>
  );
}
