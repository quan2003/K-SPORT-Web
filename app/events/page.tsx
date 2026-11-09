import type { Metadata } from "next";
import { InternalLayout } from "@/components/portal-ui";
import { EventsCatalogView } from "@/components/events/events-catalog-view";
import { getEvents, sortEvents } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Giải đấu Karate Toàn Quốc | K-SPORT",
  description: "Cổng thông tin và hệ thống theo dõi các giải vô địch Karate quốc gia, giải các câu lạc bộ và cúp toàn quốc.",
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "all";
  const year = typeof params.year === "string" ? params.year : "all";
  const events = sortEvents(await getEvents());

  return (
    <InternalLayout>
      {/* Premium Sports Header */}
      <section className="ks-events-hero-section">
        <div className="ks-section-container">
          <div className="ks-events-hero-content">
            <span className="ks-eyebrow-tag">CỔNG ĐIỀU HÀNH & GIẢI ĐẤU K-SPORT</span>
            <h1 className="ks-events-hero-title">
              Hệ Thống Giải Đấu Karate Toàn Quốc
            </h1>
            <p className="ks-events-hero-sub">
              Theo dõi lịch thi đấu, sơ đồ phân nhánh thảm, kết quả trực tiếp và điều lệ thi đấu chính thức từ các liên đoàn và ban tổ chức giải.
            </p>
          </div>
        </div>
      </section>

      {/* Main Interactive Catalog Section */}
      <section className="ks-events-catalog-section">
        <div className="ks-section-container">
          <EventsCatalogView
            initialEvents={events}
            initialStatus={status}
            initialYear={year}
          />
        </div>
      </section>
    </InternalLayout>
  );
}
