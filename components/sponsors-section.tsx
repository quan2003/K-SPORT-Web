"use client";

import { useEffect, useState } from "react";
import type { SponsorItem } from "@/lib/admin-store";
import Link from "next/link";

export function SponsorsSection() {
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/sponsors")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data.items)) {
          setSponsors(data.items.filter((item: SponsorItem) => item.placements?.includes("home")));
        }
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && sponsors.length === 0) return null;

  const equipmentBrands = sponsors.filter((s) => s.tier === "equipment" || s.category.includes("Võ phục"));
  const officialPartners = sponsors.filter((s) => s.tier !== "equipment" && !s.category.includes("Võ phục"));

  return (
    <section className="sponsors-pro-section" aria-labelledby="sponsors-heading">
      <div className="sponsors-pro-container">
        {/* Header Bar */}
        <div className="sponsors-pro-header">
          <div className="sponsors-badge-pill">
            <span className="dot-red" />
            <span>WKF APPROVED BRANDS &amp; OFFICIAL PARTNERS</span>
          </div>
          <h2 id="sponsors-heading" className="sponsors-pro-title">
            Thương Hiệu Võ Phục &amp; Nhà Tài Trợ Đồng Hành
          </h2>
          <p className="sponsors-pro-sub">
            Các thương hiệu trang phục, thiết bị thi đấu đạt chuẩn Liên đoàn Karate Thế giới (WKF) cùng các đơn vị đồng hành phát triển Karate chuyên nghiệp tại Việt Nam.
          </p>
        </div>

        {/* SECTION 1: WKF EQUIPMENT BRANDS */}
        {equipmentBrands.length > 0 && (
          <div className="sponsors-tier-block">
            <div className="tier-header-bar">
              <span className="tier-title-label">THƯƠNG HIỆU VÕ PHỤC &amp; THIẾT BỊ BẢO HỘ CHUẨN WKF</span>
              <span className="tier-spec">Kata · Kumite · Giáp &amp; Găng thi đấu chính thức</span>
            </div>

            <div className="sponsors-cards-row">
              {equipmentBrands.map((item) => (
                <a
                  key={item.id}
                  href={item.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pro-sponsor-card"
                  title={`Khám phá ${item.name}`}
                >
                  <div className="pro-logo-canvas">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.logo}
                      alt={item.name}
                      className="pro-sponsor-img"
                      loading="lazy"
                    />
                  </div>
                  <div className="pro-sponsor-meta">
                    <span className="pro-sponsor-tag">{item.category}</span>
                    <strong className="pro-sponsor-name">{item.name}</strong>
                    <span className="pro-sponsor-hover-cta">Khám phá sản phẩm ↗</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: OFFICIAL EVENT PARTNERS */}
        {officialPartners.length > 0 && (
          <div className="sponsors-tier-block">
            <div className="tier-header-bar">
              <span className="tier-title-label">ĐỐI TÁC CHIẾN LƯỢC &amp; BẢO TRỢ GIẢI ĐẤU</span>
              <span className="tier-spec">Thảm đấu Tatami · Nước khoáng · Truyền thông thể thao</span>
            </div>

            <div className="sponsors-cards-row">
              {officialPartners.map((item) => (
                <a
                  key={item.id}
                  href={item.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pro-sponsor-card"
                  title={`Khám phá ${item.name}`}
                >
                  <div className="pro-logo-canvas">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.logo}
                      alt={item.name}
                      className="pro-sponsor-img"
                      loading="lazy"
                    />
                  </div>
                  <div className="pro-sponsor-meta">
                    <span className="pro-sponsor-tag">{item.category}</span>
                    <strong className="pro-sponsor-name">{item.name}</strong>
                    <span className="pro-sponsor-hover-cta">Trang web đối tác ↗</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Partnership Action Banner */}
        <div className="sponsors-cta-banner">
          <div className="cta-banner-text">
            <strong>Bạn muốn quảng bá thương hiệu võ phục hoặc tài trợ giải đấu Karate?</strong>
            <p>Đồng hành cùng nền tảng số hóa giải đấu K-SPORT tiếp cận hơn 50,000 võ sinh, huấn luyện viên và khán giả toàn quốc.</p>
          </div>
          <Link href="/contact" className="btn-sponsor-contact">
            Liên Hệ Ban Tài Trợ K-SPORT →
          </Link>
        </div>
      </div>
    </section>
  );
}
