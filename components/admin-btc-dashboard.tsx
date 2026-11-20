"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PublicSession } from "@/lib/auth";
import type { Athlete, Club, Match, RankingEntry, TournamentEvent } from "@/lib/public-data";

type BtcTab = "overview" | "tatami" | "medals" | "athletes" | "sync";

interface AdminBtcDashboardProps {
  session: PublicSession | null;
  events: TournamentEvent[];
  schedule: Match[];
  results: Match[];
  athletes: Athlete[];
  clubs: Club[];
  ranking: RankingEntry[];
}

function dedupeMatches(schedule: Match[], results: Match[]): Match[] {
  const map = new Map<string, Match>();
  for (const m of schedule) map.set(m.id, m);
  for (const m of results) map.set(m.id, m);
  return [...map.values()];
}

function normalizeTatamiLabel(value?: string) {
  const raw = value?.trim();
  if (!raw) return "Chưa phân thảm";
  const cleaned = raw.replace(/^(tatami|thảm)\s*/i, "").trim();
  return cleaned ? `Thảm ${cleaned}` : raw;
}

export function AdminBtcDashboard({
  session,
  events,
  schedule,
  results,
  athletes,
  clubs,
  ranking,
}: AdminBtcDashboardProps) {
  const [activeTab, setActiveTab] = useState<BtcTab>("overview");
  const [selectedEventSlug, setSelectedEventSlug] = useState<string>(events[0]?.slug || "");
  const [selectedTatami, setSelectedTatami] = useState<string>("");

  const isBtcOrAdmin = session?.role === "btc" || session?.role === "admin";
  const count = useMemo(() => new Intl.NumberFormat("vi-VN"), []);

  const selectedEvent = useMemo(
    () => events.find((e) => e.slug === selectedEventSlug) || events[0] || null,
    [events, selectedEventSlug],
  );

  const allMatches = useMemo(() => dedupeMatches(schedule, results), [schedule, results]);

  const eventMatches = useMemo(() => {
    if (!selectedEvent) return allMatches;
    const filtered = allMatches.filter(
      (m) => m.eventSlug === selectedEvent.slug || m.eventName === selectedEvent.name,
    );
    return filtered.length > 0 ? filtered : allMatches;
  }, [allMatches, selectedEvent]);

  const eventAthletes = useMemo(() => {
    if (!selectedEvent) return athletes;
    const filtered = athletes.filter(
      (a) => a.eventSlug === selectedEvent.slug || a.eventId === selectedEvent.slug,
    );
    return filtered.length > 0 ? filtered : athletes;
  }, [athletes, selectedEvent]);

  const eventRanking = useMemo(() => {
    if (!selectedEvent) return ranking;
    const filtered = ranking.filter(
      (r) => r.eventSlug === selectedEvent.slug || r.eventName === selectedEvent.name,
    );
    return filtered.length > 0 ? filtered : ranking;
  }, [ranking, selectedEvent]);

  const tatamiGroups = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of eventMatches) {
      const label = normalizeTatamiLabel(m.tatami);
      const list = map.get(label) || [];
      list.push(m);
      map.set(label, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "vi", { numeric: true }));
  }, [eventMatches]);

  const activeTatamiLabel = selectedTatami && tatamiGroups.some(([l]) => l === selectedTatami)
    ? selectedTatami
    : tatamiGroups[0]?.[0] || "";

  const activeTatamiMatches = useMemo(
    () => tatamiGroups.find(([l]) => l === activeTatamiLabel)?.[1] || [],
    [tatamiGroups, activeTatamiLabel],
  );

  const clubStandings = useMemo(() => {
    const map = new Map<string, { club: string; gold: number; silver: number; bronze: number; points: number }>();
    for (const r of eventRanking) {
      const clubName = r.club?.trim() || "Đoàn khác";
      const cur = map.get(clubName) || { club: clubName, gold: 0, silver: 0, bronze: 0, points: 0 };
      cur.gold += r.medals?.gold ?? 0;
      cur.silver += r.medals?.silver ?? 0;
      cur.bronze += r.medals?.bronze ?? 0;
      cur.points += r.points ?? 0;
      map.set(clubName, cur);
    }
    return [...map.values()].sort(
      (a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || b.points - a.points,
    );
  }, [eventRanking]);

  if (!isBtcOrAdmin) {
    return (
      <div className="btc-forbidden">
        <div className="btc-forbidden-card">
          <span className="btc-forbidden-icon">🔒</span>
          <h2>Khu vực giới hạn Ban Tổ Chức (Role BTC)</h2>
          <p>
            Tài khoản hiện tại ({session?.name || "Người dùng"}) không có quyền truy cập dữ liệu điều hành của Ban Tổ Chức giải.
          </p>
          <Link href="/admin" className="button red">Quay lại Tổng quan Admin</Link>
        </div>
      </div>
    );
  }

  const completedMatchesCount = eventMatches.filter((m) => m.state === "Đã kết thúc").length;
  const liveMatchesCount = eventMatches.filter((m) => m.state === "Đang thi đấu").length;
  const progressPct = eventMatches.length > 0
    ? Math.round((completedMatchesCount / eventMatches.length) * 1000) / 10
    : 0;

  const uniqueClubNames = new Set(eventAthletes.map((a) => a.club?.trim()).filter(Boolean));
  const clubCount = uniqueClubNames.size > 0 ? uniqueClubNames.size : clubs.length;
  const categoriesCount = selectedEvent?.categories.length || new Set(eventMatches.map((m) => m.category)).size;

  return (
    <div className="btc-portal">
      {/* Tournament Top Banner */}
      <header className="btc-header">
        <div className="btc-header-left">
          <div className="btc-badge-row">
            <span className={`btc-status-badge ${selectedEvent?.status === "Đang diễn ra" ? "is-live" : ""}`}>
              {selectedEvent ? `● ${selectedEvent.status}` : "● Chưa có giải đấu"}
            </span>
            <span className="btc-sub-badge">Phân quyền: Ban Tổ Chức Giải (BTC)</span>
            <span className="btc-sub-badge">Dữ liệu thực tế Public API</span>
          </div>
          <h1 className="btc-tournament-title">
            {selectedEvent ? selectedEvent.name : "Chưa có giải đấu nào được đồng bộ"}
          </h1>
          <div className="btc-meta-row">
            <span>📅 {selectedEvent ? (selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.date ? `${selectedEvent.date} - ${selectedEvent.endDate}` : selectedEvent.date) : "—"}</span>
            <span>📍 {selectedEvent?.location || "Chưa cập nhật địa điểm"}</span>
            <span>🥋 {count.format(clubCount)} CLB · {count.format(eventAthletes.length)} VĐV</span>
            <span>⚡ {tatamiGroups.length} Thảm đấu</span>
          </div>
        </div>

        <div className="btc-header-actions">
          {events.length > 1 ? (
            <select
              aria-label="Chọn giải đấu"
              className="filter-select-pro"
              value={selectedEvent?.slug || ""}
              onChange={(e) => {
                setSelectedEventSlug(e.target.value);
                setSelectedTatami("");
              }}
            >
              {events.map((ev) => (
                <option key={ev.slug} value={ev.slug}>
                  {ev.name} ({ev.status})
                </option>
              ))}
            </select>
          ) : null}
          {selectedEvent ? (
            <Link href={`/events/${selectedEvent.slug}`} className="btc-action-btn primary">
              Xem trang giải đấu ↗
            </Link>
          ) : null}
        </div>
      </header>

      {/* KPI Overview Grid */}
      <div className="btc-kpi-grid">
        <div className="btc-kpi-card">
          <div className="btc-kpi-icon">👥</div>
          <div className="btc-kpi-content">
            <span className="btc-kpi-label">Tổng số Vận Động Viên</span>
            <strong className="btc-kpi-val">{count.format(eventAthletes.length)}</strong>
            <span className="btc-kpi-sub">Đồng bộ từ danh sách VĐV công khai</span>
          </div>
        </div>

        <div className="btc-kpi-card">
          <div className="btc-kpi-icon">🏛️</div>
          <div className="btc-kpi-content">
            <span className="btc-kpi-label">Đoàn / Câu Lạc Bộ</span>
            <strong className="btc-kpi-val">{count.format(clubCount)}</strong>
            <span className="btc-kpi-sub">Tổng số đơn vị tham gia thi đấu</span>
          </div>
        </div>

        <div className="btc-kpi-card">
          <div className="btc-kpi-icon">🏅</div>
          <div className="btc-kpi-content">
            <span className="btc-kpi-label">Nội Dung Thi Đấu</span>
            <strong className="btc-kpi-val">{count.format(categoriesCount)}</strong>
            <span className="btc-kpi-sub">Kata &amp; Kumite theo điều lệ giải</span>
          </div>
        </div>

        <div className="btc-kpi-card highlight">
          <div className="btc-kpi-icon">⚡</div>
          <div className="btc-kpi-content">
            <span className="btc-kpi-label">Tiến Độ Trận Đấu</span>
            <strong className="btc-kpi-val">{progressPct}%</strong>
            <span className="btc-kpi-sub">
              Đã xong {count.format(completedMatchesCount)}/{count.format(eventMatches.length)} trận ({liveMatchesCount} đang đấu)
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="btc-tabs" role="tablist" aria-label="Các mục điều hành BTC">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "overview"}
          className={`btc-tab ${activeTab === "overview" ? "is-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Tổng quan thảm đấu
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "tatami"}
          className={`btc-tab ${activeTab === "tatami" ? "is-active" : ""}`}
          onClick={() => setActiveTab("tatami")}
        >
          🥋 Lịch &amp; Trận theo Thảm ({tatamiGroups.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "medals"}
          className={`btc-tab ${activeTab === "medals" ? "is-active" : ""}`}
          onClick={() => setActiveTab("medals")}
        >
          🥇 Bảng xếp hạng đoàn ({clubStandings.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "athletes"}
          className={`btc-tab ${activeTab === "athletes" ? "is-active" : ""}`}
          onClick={() => setActiveTab("athletes")}
        >
          👥 Danh sách VĐV ({eventAthletes.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "sync"}
          className={`btc-tab ${activeTab === "sync" ? "is-active" : ""}`}
          onClick={() => setActiveTab("sync")}
        >
          ⚖️ Cân ký &amp; Trọng tài
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="btc-tab-content">
          <div className="btc-section-card">
            <div className="btc-card-header">
              <h3>Trạng thái {tatamiGroups.length} Thảm đấu hiện tại</h3>
              <span className="btc-live-dot">Đồng bộ Public API</span>
            </div>
            {tatamiGroups.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>Chưa có dữ liệu trận đấu nào cho giải này.</p>
            ) : (
              <div className="btc-tatami-cards">
                {tatamiGroups.map(([label, matches]) => {
                  const done = matches.filter((m) => m.state === "Đã kết thúc").length;
                  const live = matches.find((m) => m.state === "Đang thi đấu") || matches[0];
                  const pct = matches.length > 0 ? Math.round((done / matches.length) * 100) : 0;
                  return (
                    <div key={label} className={`btc-tatami-mini ${pct === 100 ? "is-done" : "is-ongoing"}`}>
                      <div className="btc-mini-top">
                        <span className="btc-tatami-tag red">{label.toUpperCase()}</span>
                        <span className="btc-tatami-status">{live?.state || "Chờ cập nhật"}</span>
                      </div>
                      <strong className="btc-match-name">{live?.category || "Chưa có nội dung"}</strong>
                      {live ? (
                        <div className="btc-athletes-match">
                          <span className="aka">🔴 AKA: {live.red} {typeof live.redScore === "number" ? `(${live.redScore}đ)` : ""}</span>
                          <span className="ao">🔵 AO: {live.blue} {typeof live.blueScore === "number" ? `(${live.blueScore}đ)` : ""}</span>
                        </div>
                      ) : null}
                      <div className="btc-progress-bar">
                        <div className="btc-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="btc-progress-txt">Hoàn thành {done}/{matches.length} trận ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TATAMI MATCHES */}
      {activeTab === "tatami" && (
        <div className="btc-tab-content">
          <div className="btc-tatami-selector">
            <span>Chọn thảm:</span>
            {tatamiGroups.map(([label, matches]) => (
              <button
                key={label}
                type="button"
                className={`btc-tatami-btn ${activeTatamiLabel === label ? "is-selected" : ""}`}
                onClick={() => setSelectedTatami(label)}
              >
                {label} ({matches.length} trận)
              </button>
            ))}
          </div>

          <div className="btc-section-card">
            <div className="btc-card-header">
              <h3>Danh sách trận đấu — {activeTatamiLabel || "Tất cả"}</h3>
            </div>
            {activeTatamiMatches.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>Chưa có trận đấu nào trên thảm này.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-content-table admin-responsive-table">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Nội dung</th>
                      <th>AKA (Đỏ)</th>
                      <th>Tỉ số</th>
                      <th>AO (Xanh)</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTatamiMatches.map((m) => (
                      <tr key={m.id}>
                        <td data-label="Thời gian">{m.date} {m.time}</td>
                        <td data-label="Nội dung"><strong>{m.category}</strong></td>
                        <td data-label="AKA (Đỏ)">{m.red}</td>
                        <td data-label="Tỉ số">
                          {typeof m.redScore === "number" && typeof m.blueScore === "number"
                            ? `${m.redScore} - ${m.blueScore}`
                            : "—"}
                        </td>
                        <td data-label="AO (Xanh)">{m.blue}</td>
                        <td data-label="Trạng thái">{m.state}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MEDAL TABLE */}
      {activeTab === "medals" && (
        <div className="btc-tab-content">
          <div className="btc-section-card">
            <div className="btc-card-header">
              <div>
                <h3>Bảng tổng sắp theo dữ liệu Xếp hạng (Public API)</h3>
                <p>Tổng hợp từ /api/public/ranking</p>
              </div>
            </div>
            {clubStandings.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>Chưa có dữ liệu bảng xếp hạng / huy chương cho giải đấu này.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-content-table admin-responsive-table">
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>Hạng</th>
                      <th>Đoàn / Câu Lạc Bộ</th>
                      <th style={{ textAlign: "center" }}>🥇 Vàng</th>
                      <th style={{ textAlign: "center" }}>🥈 Bạc</th>
                      <th style={{ textAlign: "center" }}>🥉 Đồng</th>
                      <th style={{ textAlign: "right" }}>Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clubStandings.map((row, idx) => (
                      <tr key={row.club}>
                        <td data-label="Hạng"><strong>{idx + 1}</strong></td>
                        <td data-label="Đoàn / CLB"><strong>{row.club}</strong></td>
                        <td data-label="Vàng" style={{ textAlign: "center", fontWeight: "bold" }}>{row.gold}</td>
                        <td data-label="Bạc" style={{ textAlign: "center", fontWeight: "bold" }}>{row.silver}</td>
                        <td data-label="Đồng" style={{ textAlign: "center", fontWeight: "bold" }}>{row.bronze}</td>
                        <td data-label="Điểm" style={{ textAlign: "right", fontWeight: "bold" }}>{count.format(row.points)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ATHLETES */}
      {activeTab === "athletes" && (
        <div className="btc-tab-content">
          <div className="btc-section-card">
            <div className="btc-card-header">
              <h3>Danh sách Vận Động Viên ({count.format(eventAthletes.length)})</h3>
            </div>
            {eventAthletes.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>Chưa có danh sách VĐV được đồng bộ cho giải đấu này.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-content-table admin-responsive-table">
                  <thead>
                    <tr>
                      <th>Mã VĐV</th>
                      <th>Họ và tên</th>
                      <th>Đoàn / CLB</th>
                      <th>Nội dung</th>
                      <th>Thành tích</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventAthletes.slice(0, 100).map((a) => (
                      <tr key={a.id}>
                        <td data-label="Mã VĐV"><code>{a.athleteCode || a.id}</code></td>
                        <td data-label="Họ và tên">
                          <Link href={`/athletes/${encodeURIComponent(a.id)}`}><strong>{a.name}</strong></Link>
                        </td>
                        <td data-label="Đoàn / CLB">{a.club}</td>
                        <td data-label="Nội dung">{a.category}</td>
                        <td data-label="Thành tích">{a.publicResult || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: WEIGH-IN & REFEREES (NOT EXPOSED BY API YET) */}
      {activeTab === "sync" && (
        <div className="btc-tab-content">
          <div className="btc-section-card">
            <div className="btc-card-header">
              <h3>Cân ký &amp; Phân công Trọng tài</h3>
            </div>
            <p style={{ color: "var(--muted)", margin: 0 }}>
              Máy chủ Public API hiện chưa cung cấp dữ liệu nội bộ về biên bản cân ký và phân công trọng tài. Dữ liệu chỉ hiển thị khi K-SPORT Desktop đồng bộ các bảng này lên máy chủ quản trị.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
