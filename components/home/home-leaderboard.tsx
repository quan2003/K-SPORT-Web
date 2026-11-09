"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Athlete, RankingEntry } from "@/lib/public-data";

interface HomeLeaderboardProps {
  ranking: RankingEntry[];
  athletes?: Athlete[];
  featuredAthlete?: Athlete | null;
}

export function HomeLeaderboard({ ranking, athletes = [], featuredAthlete }: HomeLeaderboardProps) {
  const topRankings = ranking.slice(0, 5);

  // Default to featuredAthlete or the #1 ranked athlete or first athlete from directory
  const defaultAthlete: Athlete = featuredAthlete || (athletes.length > 0 ? athletes[0] : {
    id: "athlete-vie-0001",
    name: "Nguyễn Văn A",
    club: "CLB Karate Phú Thọ",
    category: "Kumite nam -67kg",
    totalMatches: 14,
    wins: 11,
    winRate: 79,
    publicResult: "Thẻ VĐV K-SPORT Phú Thọ 2026 · Hạt giống số 1",
  });

  const [selectedId, setSelectedId] = useState<string>(defaultAthlete.id);

  // Resolve current active athlete from athletes list by id or name, or fallback to default
  const activeAthlete: Athlete =
    athletes.find((a) => a.id === selectedId) ||
    athletes.find((a) => a.name === defaultAthlete.name) ||
    defaultAthlete;

  // Accurately compute match and win rate statistics according to this athlete's data
  const totalMatches = typeof activeAthlete.totalMatches === "number" ? activeAthlete.totalMatches : 0;
  const wins = typeof activeAthlete.wins === "number" ? activeAthlete.wins : 0;
  const winRate =
    totalMatches > 0
      ? Math.round((wins / totalMatches) * 100)
      : (typeof activeAthlete.winRate === "number" ? activeAthlete.winRate : 0);

  const handleSelectAthlete = (itemAthleteId?: string, itemName?: string) => {
    if (itemAthleteId) {
      const match = athletes.find((a) => a.id === itemAthleteId);
      if (match) {
        setSelectedId(match.id);
        return;
      }
    }
    if (itemName) {
      const match = athletes.find((a) => a.name.trim().toLowerCase() === itemName.trim().toLowerCase());
      if (match) {
        setSelectedId(match.id);
      }
    }
  };

  return (
    <section className="ks-leaderboard-section" aria-label="Bảng xếp hạng và vận động viên">
      <div className="ks-section-container">
        {/* Section Header */}
        <div className="ks-section-head">
          <div className="ks-head-left">
            <span className="ks-eyebrow-tag">BẢNG VÀNG THÀNH TÍCH</span>
            <h2 className="ks-section-title">Bảng Xếp Hạng & Vận Động Viên</h2>
            <p className="ks-section-sub">
              Hệ thống tích lũy điểm thi đấu và hồ sơ thành tích vận động viên Karate Việt Nam.
            </p>
          </div>
          <div className="ks-head-right">
            <Link href="/ranking" className="ks-link-arrow">
              <span>Xem đầy đủ bảng xếp hạng</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="ks-leaderboard-grid">
          {/* Left Column: Top 5 Rankings */}
          <div className="ks-ranking-table-card">
            <div className="ks-table-card-head">
              <div className="ks-table-title-wrap">
                <h3 className="ks-table-card-title">Top 5 Điểm Tích Lũy Cao Nhất</h3>
                <span className="ks-table-card-sub">Bấm chọn VĐV để xem thông tin chi tiết</span>
              </div>
              <span className="ks-season-badge">Mùa giải 2026</span>
            </div>

            <div className="ks-ranking-list">
              {topRankings.length > 0 ? (
                topRankings.map((item, index) => {
                  const isTop1 = item.rank === 1;
                  const isTop2 = item.rank === 2;
                  const isTop3 = item.rank === 3;
                  const isSelected =
                    activeAthlete.id === item.athleteId ||
                    activeAthlete.name.trim().toLowerCase() === item.name.trim().toLowerCase();

                  return (
                    <div
                      key={item.athleteId || index}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectAthlete(item.athleteId, item.name)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectAthlete(item.athleteId, item.name);
                        }
                      }}
                      className={`ks-ranking-row ${isTop1 ? "rank-1" : isTop2 ? "rank-2" : isTop3 ? "rank-3" : ""} ${isSelected ? "is-selected" : ""}`}
                      title={`Bấm để xem hồ sơ và tỷ lệ thắng của VĐV ${item.name}`}
                    >
                      <div className="ks-rank-badge">
                        {isTop1 ? "🥇" : isTop2 ? "🥈" : isTop3 ? "🥉" : `#${item.rank}`}
                      </div>

                      <div className="ks-rank-athlete-info">
                        <span className="ks-rank-name">{item.name}</span>
                        <div className="ks-rank-meta">
                          <span className="ks-rank-club">{item.club}</span>
                          <span className="ks-rank-dot">·</span>
                          <span className="ks-rank-cat">{item.category}</span>
                        </div>
                      </div>

                      <div className="ks-rank-points">
                        <strong>{new Intl.NumberFormat("vi-VN").format(item.points)}</strong>
                        <span>điểm</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="ks-empty-ranking">
                  <p>Dữ liệu bảng xếp hạng đang được đồng bộ từ giải đấu mới nhất.</p>
                </div>
              )}
            </div>

            <div className="ks-table-card-footer">
              <Link href="/ranking" className="ks-footer-link">
                Tra cứu điểm số các hạng cân khác →
              </Link>
            </div>
          </div>

          {/* Right Column: Featured Athlete Spotlight Card */}
          <div className="ks-athlete-spotlight-card">
            <div className="ks-spotlight-photo-wrap">
              <Image
                src={activeAthlete.image || "/images/athlete-portrait.png"}
                alt={activeAthlete.name}
                width={600}
                height={750}
                className="ks-spotlight-photo"
                priority
              />
              <div className="ks-photo-gradient" />
              <div className="ks-spotlight-tag">
                <span className="ks-verified-icon">✓</span>
                <span>GƯƠNG MẶT TIÊU BIỂU</span>
              </div>
            </div>

            <div className="ks-spotlight-content">
              <div className="ks-spotlight-header-meta">
                <span className="ks-spotlight-club">{activeAthlete.club}</span>
                <span className="ks-spotlight-cat-badge">{activeAthlete.category}</span>
              </div>

              <h3 className="ks-spotlight-name">{activeAthlete.name}</h3>
              <p className="ks-spotlight-res">
                {activeAthlete.publicResult || `Thẻ VĐV K-SPORT ${activeAthlete.club} 2026`}
              </p>

              {/* Stats Grid - Mathematically accurate to the athlete's actual record */}
              <div className="ks-athlete-stats-grid">
                <div className="ks-stat-box">
                  <span className="ks-stat-val">{totalMatches}</span>
                  <span className="ks-stat-lbl">Trận đã đấu</span>
                </div>
                <div className="ks-stat-box">
                  <span className="ks-stat-val">{wins}</span>
                  <span className="ks-stat-lbl">Trận thắng</span>
                </div>
                <div className="ks-stat-box highlight">
                  <span className="ks-stat-val">{winRate}%</span>
                  <span className="ks-stat-lbl">Tỷ lệ thắng</span>
                </div>
              </div>

              <div className="ks-spotlight-actions">
                <Link href={`/athletes/${activeAthlete.id}`} className="ks-btn ks-btn-primary">
                  <span>Xem Hồ Sơ VĐV</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
                <Link href="/athletes" className="ks-btn ks-btn-outline-dark">
                  <span>Danh Mục Vận Động Viên</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
