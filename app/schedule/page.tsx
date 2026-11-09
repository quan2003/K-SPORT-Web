import type { Metadata } from "next";
import { InternalLayout } from "@/components/portal-ui";
import { ScheduleView } from "@/components/schedule/schedule-view";
import { getEvents, getSchedule, sortMatches } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Lịch Thi Đấu & Điều Phối Thảm Tatami | K-SPORT",
  description: "Lịch thi đấu Karate trực tiếp theo giải, thời gian, nội dung, thảm đấu và kết quả đối đầu Aka vs Ao.",
};

function valueOf(value: string | string[] | undefined, fallback = "all") {
  return typeof value === "string" && value ? value : fallback;
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const event = valueOf(params.event);
  const tatami = valueOf(params.tatami);
  const status = valueOf(params.status);

  const [events, rawMatches] = await Promise.all([getEvents(), getSchedule()]);
  const matches = sortMatches(rawMatches);

  return (
    <InternalLayout>
      {/* Premium Sports Header - Synchronized with /events */}
      <section className="ks-events-hero-section">
        <div className="ks-section-container">
          <div className="ks-events-hero-content">
            <span className="ks-eyebrow-tag">TRUNG TÂM ĐIỀU PHỐI SÀN ĐẤU K-SPORT</span>
            <h1 className="ks-events-hero-title">
              Lịch Thi Đấu & Điều Phối Thảm Tatami
            </h1>
            <p className="ks-events-hero-sub">
              Tra cứu thứ tự trận đấu theo từng thảm, đối đầu Aka (Đỏ) vs Ao (Xanh) và theo dõi kết quả cập nhật trực tiếp từ bàn thư ký giải đấu.
            </p>
          </div>
        </div>
      </section>

      {/* Main Interactive Schedule Console */}
      <section className="ks-schedule-catalog-section">
        <div className="ks-section-container">
          <ScheduleView
            initialMatches={matches}
            events={events}
            initialEvent={event}
            initialTatami={tatami}
            initialStatus={status}
          />
        </div>
      </section>
    </InternalLayout>
  );
}
