import type { Metadata } from "next";
import { InternalLayout } from "@/components/portal-ui";
import { NewsCatalogView } from "@/components/news/news-catalog-view";
import { getNews } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Tin Tức & Hoạt Động Karate Việt Nam | K-SPORT",
  description: "Bản tin chính thức về các giải đấu Karate, hoạt động trọng tài, ứng dụng công nghệ điều hành thảm đấu và câu chuyện võ đường.",
};

export default async function NewsPage() {
  const news = await getNews();

  return (
    <InternalLayout>
      {/* Premium Sports Header - Synchronized with /events, /schedule, /ranking & /athletes */}
      <section className="ks-events-hero-section">
        <div className="ks-section-container">
          <div className="ks-events-hero-content">
            <span className="ks-eyebrow-tag">BẢN TIN CHUYÊN MÔN & HOẠT ĐỘNG KARATE K-SPORT</span>
            <h1 className="ks-events-hero-title">
              Tin Tức & Hoạt Động Karate
            </h1>
            <p className="ks-events-hero-sub">
              Cập nhật nhanh diễn biến các giải đấu toàn quốc, đào tạo trọng tài WKF, số hóa công tác điều hành thảm đấu và lan tỏa tinh thần võ đạo Karate Việt Nam.
            </p>
          </div>
        </div>
      </section>

      {/* Main News Catalog Console */}
      <section className="ks-news-catalog-section">
        <div className="ks-section-container">
          <NewsCatalogView initialNews={news} />
        </div>
      </section>
    </InternalLayout>
  );
}
