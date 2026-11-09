"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMatDisplayName, getTatamiColorClass, type Match } from "@/lib/public-data";
import type { SponsorItem } from "@/lib/admin-store";

interface HomeLiveCenterProps {
  matches: Match[];
}

export function HomeLiveCenter({ matches }: HomeLiveCenterProps) {
  const [selectedTatami, setSelectedTatami] = useState<string>("all");
  const [tatamiSponsors, setTatamiSponsors] = useState<SponsorItem[]>([]);

  useEffect(() => {
    let cancel = false;
    fetch("/api/public/sponsors")
      .then((res) => res.json())
      .then((data) => {
        if (!cancel && Array.isArray(data.items)) {
          setTatamiSponsors(data.items.filter((item: SponsorItem) => item.placements?.includes("tatami")));
        }
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, []);

  // Extract and sort tatamis numerically: Thảm 1, Thảm 2, Thảm 3, Thảm 4...
  const tatamis = Array.from(new Set(matches.map((m) => m.tatami).filter(Boolean))).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
    const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
    if (numA !== numB) return numA - numB;
    return a.localeCompare(b, "vi");
  });

  const filteredMatches = matches.filter((match) => {
    if (selectedTatami === "all") return true;
    return match.tatami === selectedTatami;
  });

  return (
    <section className="ks-live-section" aria-label="Trung tâm điều phối sàn đấu">
      <div className="ks-section-container">
        {/* Section Header */}
        <div className="ks-section-head">
          <div className="ks-head-left">
            <div className="ks-live-pill">
              <span className="ks-pulse-dot" />
              <span>SÀN ĐẤU TRỰC TIẾP</span>
            </div>
            <h2 className="ks-section-title">Trung Tâm Điều Hành & Lịch Thi Đấu</h2>
            <p className="ks-section-sub">
              Chỉ hiển thị các trận đấu đang diễn ra hoặc chuẩn bị thi đấu theo từng thảm.
            </p>
          </div>
          <div className="ks-head-right">
            <Link href="/schedule" className="ks-link-arrow">
              <span>Xem lịch thi đấu toàn bộ</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>

        {/* If no current or upcoming matches exist */}
        {matches.length === 0 ? (
          <div className="ks-empty-card" style={{ padding: "56px 24px" }}>
            <div className="ks-empty-icon" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 style={{ fontSize: "24px", color: "#061a34", margin: "0 0 8px" }}>
              Giải đấu gần nhất đã kết thúc
            </h3>
            <p style={{ maxWidth: "560px", color: "#64748b", margin: "0 0 24px", lineHeight: "1.5" }}>
              Hiện chưa có lịch thi đấu mới trên các thảm từ hôm nay trở đi. Bạn có thể xem kết quả chi tiết các trận đã đấu hoặc theo dõi danh sách các giải tiếp theo.
            </p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/results" className="ks-btn ks-btn-primary">
                <span>Xem Kết Quả Thi Đấu</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link href="/events" className="ks-btn ks-btn-outline-dark">
                <span>Danh Mục Giải Đấu</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Tatami Filter Tabs - strictly sorted 1, 2, 3, 4 */}
            <div className="ks-tatami-tabs" role="tablist" aria-label="Chọn thảm đấu">
              <button
                type="button"
                role="tab"
                aria-selected={selectedTatami === "all"}
                className={`ks-tatami-tab ${selectedTatami === "all" ? "is-active" : ""}`}
                onClick={() => setSelectedTatami("all")}
              >
                <span>Tất cả thảm</span>
                <span className="ks-tatami-badge-count">{matches.length}</span>
              </button>
              {tatamis.map((tatami) => {
                const count = matches.filter((m) => m.tatami === tatami).length;
                const displayName = getMatDisplayName(tatami);
                const colorClass = getTatamiColorClass(tatami);
                const hasLive = matches.some((m) => m.tatami === tatami && m.state === "Đang thi đấu");
                return (
                  <button
                    key={tatami}
                    type="button"
                    role="tab"
                    aria-selected={selectedTatami === tatami}
                    className={`ks-tatami-tab ${colorClass} ${selectedTatami === tatami ? "is-active" : ""}`}
                    onClick={() => setSelectedTatami(tatami)}
                  >
                    <span className={`ks-tatami-indicator ${colorClass}`} aria-hidden="true" />
                    <span>{displayName}</span>
                    <span className="ks-tatami-badge-count">{count}</span>
                    {hasLive && <span className="ks-tatami-live-dot" title="Có trận đang đấu" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            {/* Matches Grid */}
            {filteredMatches.length > 0 ? (
              <div className="ks-matches-grid">
                {filteredMatches.slice(0, 6).map((match) => {
                  const isLive = match.state === "Đang thi đấu";
                  const isEnded = match.state === "Đã kết thúc";
                  const tatamiName = getMatDisplayName(match.tatami);
                  const tatamiColorClass = getTatamiColorClass(match.tatami);

                  return (
                    <article key={match.id} className={`ks-match-card ${isLive ? "is-match-live" : ""}`}>
                      <div className="ks-match-top">
                        <div className="ks-match-info">
                          <span className={`ks-tatami-badge ${tatamiColorClass}`}>{tatamiName}</span>
                          <span className="ks-match-time">{match.time}</span>
                        </div>
                        <div className="ks-match-status-wrap">
                          {isLive ? (
                            <span className="ks-match-live-tag">
                              <span className="ks-pulse-dot" />
                              Đang đấu
                            </span>
                          ) : isEnded ? (
                            <span className="ks-match-ended-tag">Kết thúc</span>
                          ) : (
                            <span className="ks-match-upcoming-tag">Sắp diễn ra</span>
                          )}
                        </div>
                      </div>

                      <div className="ks-match-category" title={match.category}>
                        {match.category}
                      </div>

                      {/* Combatants section */}
                      <div className="ks-match-fighters">
                        {/* Aka (Red) */}
                        <div className="ks-fighter-row is-aka">
                          <div className="ks-fighter-flag">
                            <span className="ks-fighter-belt aka" />
                            <span className="ks-fighter-role">AKA</span>
                          </div>
                          <div className="ks-fighter-meta">
                            <strong className="ks-fighter-name">{match.red}</strong>
                          </div>
                          <div className="ks-fighter-score aka">
                            {match.redScore !== undefined ? match.redScore : "–"}
                          </div>
                        </div>

                        <div className="ks-match-vs-divider">
                          <span className="ks-vs-badge">VS</span>
                        </div>

                        {/* Ao (Blue) */}
                        <div className="ks-fighter-row is-ao">
                          <div className="ks-fighter-flag">
                            <span className="ks-fighter-belt ao" />
                            <span className="ks-fighter-role">AO</span>
                          </div>
                          <div className="ks-fighter-meta">
                            <strong className="ks-fighter-name">{match.blue}</strong>
                          </div>
                          <div className="ks-fighter-score ao">
                            {match.blueScore !== undefined ? match.blueScore : "–"}
                          </div>
                        </div>
                      </div>

                      {match.eventName && (
                        <div className="ks-match-event-name truncate" title={match.eventName}>
                          {match.eventName}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="ks-empty-card">
                <div className="ks-empty-icon" aria-hidden="true">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="6" x2="12" y2="12" />
                    <line x1="12" y1="12" x2="16" y2="14" />
                  </svg>
                </div>
                <h3>Không có trận đấu nào trên thảm này</h3>
                <p>Các trận đấu của thảm này đã hoàn thành hoặc chưa đến giờ thi đấu.</p>
                <button
                  type="button"
                  className="ks-btn ks-btn-outline-dark"
                  onClick={() => setSelectedTatami("all")}
                >
                  Xem tất cả các thảm
                </button>
              </div>
            )}

            {/* Official Tatami Mat Sponsors Backdrop */}
            {tatamiSponsors.length > 0 && (
              <div className="ks-tatami-backdrop-strip">
                <div className="tatami-backdrop-inner">
                  <span className="tatami-backdrop-badge">WKF OFFICIAL TATAMI BACKDROP</span>
                  <span className="tatami-backdrop-lbl">ĐƠN VỊ TÀI TRỢ THIẾT BỊ SÀN ĐẤU &amp; THẢM TATAMI:</span>
                  <div className="tatami-backdrop-logos">
                    {tatamiSponsors.map((s) => (
                      <a
                        key={s.id}
                        href={s.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tatami-backdrop-item"
                        title={`${s.name} — ${s.category}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.logo} alt={s.name} className="tatami-backdrop-img" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="ks-live-bottom-bar">
              <div className="ks-bottom-hint">
                <span className="ks-hint-icon">ℹ️</span>
                <span>Tra cứu mã định danh thẻ VĐV K-SPORT trực tiếp trên hệ thống laptop để biết giờ vào thảm và góc đai.</span>
              </div>
              <div className="ks-bottom-actions">
                <Link href="/results" className="ks-btn-subtle">
                  Xem bảng kết quả các trận đã đấu →
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
