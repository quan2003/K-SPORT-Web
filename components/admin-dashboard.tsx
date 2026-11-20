"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Match, TournamentEvent } from "@/lib/public-data";

export type AdminOverviewData = {
  events: TournamentEvent[];
  schedule: Match[];
  results: Match[];
  athletesCount: number;
  clubsCount: number;
  newsCount: number;
  bannersCount: number;
  activeSponsorsCount: number;
  wkfQuestionsCount: number;
  remote: {
    connected: boolean;
    totalLicenses?: number | null;
    activeLicenses?: number | null;
    requestsPending?: number | null;
    paidOrders?: number | null;
    syncedTournamentsCount?: number | null;
    dailyRevenue?: { day: string; revenueVnd: number }[];
  };
  fetchedAt: string;
};

type ChartMode = "tatami" | "events" | "revenue";

type ChartBar = {
  label: string;
  primary: number;
  secondary: number;
  highlight?: boolean;
};

function dedupeMatches(schedule: Match[], results: Match[]): Match[] {
  const map = new Map<string, Match>();
  for (const m of schedule) map.set(m.id, m);
  for (const m of results) map.set(m.id, m);
  return [...map.values()];
}

export function AdminDashboard({ data }: { data: AdminOverviewData }) {
  const hasRevenue = Boolean(data.remote.connected && data.remote.dailyRevenue && data.remote.dailyRevenue.length > 0);
  const [chartMode, setChartMode] = useState<ChartMode>("tatami");
  const [hoveredBar, setHoveredBar] = useState<ChartBar | null>(null);

  const count = useMemo(() => new Intl.NumberFormat("vi-VN"), []);
  const allMatches = useMemo(() => dedupeMatches(data.schedule, data.results), [data.schedule, data.results]);

  const liveEvents = useMemo(() => data.events.filter((e) => e.status === "Đang diễn ra"), [data.events]);
  const upcomingEvents = useMemo(() => data.events.filter((e) => e.status === "Sắp diễn ra"), [data.events]);
  const featuredEvent = liveEvents[0] || upcomingEvents[0] || data.events[0] || null;

  const liveMatches = useMemo(() => allMatches.filter((m) => m.state === "Đang thi đấu"), [allMatches]);
  const finishedMatches = useMemo(() => allMatches.filter((m) => m.state === "Đã kết thúc"), [allMatches]);
  const upcomingMatches = useMemo(() => allMatches.filter((m) => m.state === "Sắp diễn ra"), [allMatches]);

  const uniqueTatamis = useMemo(() => {
    const set = new Set<string>();
    for (const m of allMatches) {
      const name = m.tatami?.trim();
      if (name) set.add(name);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "vi", { numeric: true }));
  }, [allMatches]);

  const tatamiBars: ChartBar[] = useMemo(() => {
    const counts = new Map<string, { total: number; finished: number; live: number }>();
    for (const m of allMatches) {
      const key = m.tatami?.trim() ? `Thảm ${m.tatami.replace(/^(tatami|thảm)\s*/i, "").trim()}` : "Chưa phân thảm";
      const cur = counts.get(key) || { total: 0, finished: 0, live: 0 };
      cur.total += 1;
      if (m.state === "Đã kết thúc") cur.finished += 1;
      if (m.state === "Đang thi đấu") cur.live += 1;
      counts.set(key, cur);
    }
    return [...counts.entries()].map(([label, stat]) => ({
      label,
      primary: stat.total,
      secondary: stat.finished,
      highlight: stat.live > 0,
    }));
  }, [allMatches]);

  const eventBars: ChartBar[] = useMemo(() => {
    return data.events.slice(0, 10).map((ev) => {
      const evMatches = allMatches.filter((m) => m.eventSlug === ev.slug || m.eventName === ev.name);
      return {
        label: ev.name.length > 22 ? `${ev.name.slice(0, 22)}…` : ev.name,
        primary: evMatches.length > 0 ? evMatches.length : ev.categories.length,
        secondary: evMatches.filter((m) => m.state === "Đã kết thúc").length,
        highlight: ev.status === "Đang diễn ra",
      };
    });
  }, [data.events, allMatches]);

  const revenueBars: ChartBar[] = useMemo(() => {
    if (!data.remote.dailyRevenue) return [];
    return data.remote.dailyRevenue.map((item) => ({
      label: item.day,
      primary: item.revenueVnd,
      secondary: 0,
      highlight: item.revenueVnd > 0,
    }));
  }, [data.remote.dailyRevenue]);

  const activeBars = chartMode === "revenue" ? revenueBars : chartMode === "events" ? eventBars : tatamiBars;
  const maxBarValue = Math.max(...activeBars.map((b) => b.primary), 1);

  const totalMatches = allMatches.length;
  const finishedPct = totalMatches > 0 ? Math.round((finishedMatches.length / totalMatches) * 1000) / 10 : 0;
  const livePct = totalMatches > 0 ? Math.round((liveMatches.length / totalMatches) * 1000) / 10 : 0;
  const upcomingPct = totalMatches > 0 ? Math.max(0, Math.round((100 - finishedPct - livePct) * 10) / 10) : 0;

  return (
    <section className="admin-dashboard-v3" aria-labelledby="admin-overview-heading">
      {/* 1. TOURNAMENT LIVE BANNER (FROM REAL PUBLIC API) */}
      <div className="pro-alert-banner">
        <div className="pro-alert-content">
          <div className="pro-alert-badge">
            {liveEvents.length > 0 ? <span className="live-dot-pulse" /> : null}
            <span>
              {liveEvents.length > 0
                ? "GIẢI ĐẤU ĐANG DIỄN RA (DỮ LIỆU THỰC TẾ)"
                : featuredEvent
                  ? `TRẠNG THÁI: ${featuredEvent.status.toUpperCase()}`
                  : "HỆ THỐNG ĐỒNG BỘ DỮ LIỆU K-SPORT"}
            </span>
          </div>
          <h2 className="pro-alert-title">
            {featuredEvent ? featuredEvent.name : "Chưa có giải đấu nào được đồng bộ từ máy chủ"}
          </h2>
          <p className="pro-alert-sub">
            {featuredEvent
              ? `${featuredEvent.location || "Chưa cập nhật địa điểm"} · ${count.format(data.athletesCount)} VĐV · ${count.format(data.clubsCount)} CLB · ${uniqueTatamis.length} Thảm đấu`
              : "Kết nối KSPORT_PUBLIC_API_URL hoặc đồng bộ giải đấu từ K-SPORT Desktop để hiển thị dữ liệu trực tiếp."}
          </p>
        </div>
        <div className="pro-alert-buttons">
          <Link href="/admin/btc" className="btn-pro-primary">
            🏆 Mở Thống Kê Ban Tổ Chức (BTC)
          </Link>
          <Link href="/admin/events" className="btn-pro-outline">
            🥋 Quản Lý Giải Đấu
          </Link>
        </div>
      </div>

      {/* 2. HEADER & CHART VIEW SWITCHER */}
      <div className="analytics-control-bar">
        <div>
          <h1 id="admin-overview-heading" className="analytics-main-title">
            Tổng Quan Dữ Liệu Hệ Thống K-SPORT
          </h1>
          <p className="analytics-sub-title">
            Dữ liệu thực tế tổng hợp từ Public API &amp; máy chủ quản trị lúc{" "}
            {new Intl.DateTimeFormat("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(new Date(data.fetchedAt))}
            .
          </p>
        </div>

        <div className="time-filter-wrapper">
          <div className="filter-tab-group" role="tablist" aria-label="Chế độ biểu đồ thống kê">
            <button
              type="button"
              role="tab"
              aria-selected={chartMode === "tatami"}
              className={`filter-tab-btn ${chartMode === "tatami" ? "is-active" : ""}`}
              onClick={() => {
                setChartMode("tatami");
                setHoveredBar(null);
              }}
            >
              Theo Thảm đấu
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={chartMode === "events"}
              className={`filter-tab-btn ${chartMode === "events" ? "is-active" : ""}`}
              onClick={() => {
                setChartMode("events");
                setHoveredBar(null);
              }}
            >
              Theo Giải đấu
            </button>
            {hasRevenue ? (
              <button
                type="button"
                role="tab"
                aria-selected={chartMode === "revenue"}
                className={`filter-tab-btn ${chartMode === "revenue" ? "is-active" : ""}`}
                onClick={() => {
                  setChartMode("revenue");
                  setHoveredBar(null);
                }}
              >
                Doanh thu 14 ngày (VPS)
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* 3. KPI STATS STRIP (100% REAL DATA) */}
      <div className="kpi-strip-v3">
        <div className="kpi-box-v3">
          <div className="kpi-icon-v3 red">🥋</div>
          <div className="kpi-content-v3">
            <span className="kpi-label-v3">Giải Đấu Công Khai</span>
            <strong className="kpi-val-v3">{count.format(data.events.length)}</strong>
            <span className="kpi-sub-v3">
              {liveEvents.length} đang diễn ra · {upcomingEvents.length} sắp diễn ra
            </span>
          </div>
        </div>

        <div className="kpi-box-v3">
          <div className="kpi-icon-v3 blue">👥</div>
          <div className="kpi-content-v3">
            <span className="kpi-label-v3">Vận Động Viên &amp; CLB</span>
            <strong className="kpi-val-v3">{count.format(data.athletesCount)}</strong>
            <span className="kpi-sub-v3">Thuộc {count.format(data.clubsCount)} CLB / Đoàn tham dự</span>
          </div>
        </div>

        <div className="kpi-box-v3">
          <div className="kpi-icon-v3 amber">⚡</div>
          <div className="kpi-content-v3">
            <span className="kpi-label-v3">Trận Đấu &amp; Kết Quả</span>
            <strong className="kpi-val-v3">{count.format(totalMatches)}</strong>
            <span className="kpi-sub-v3">
              {count.format(finishedMatches.length)} đã xong · {count.format(liveMatches.length)} đang đấu
            </span>
          </div>
        </div>

        <div className="kpi-box-v3">
          <div className="kpi-icon-v3 emerald">🔑</div>
          <div className="kpi-content-v3">
            <span className="kpi-label-v3">License &amp; Đơn Hàng (VPS)</span>
            <strong className="kpi-val-v3">
              {data.remote.connected && typeof data.remote.activeLicenses === "number"
                ? count.format(data.remote.activeLicenses)
                : "—"}
            </strong>
            <span className="kpi-sub-v3">
              {data.remote.connected
                ? `Tổng ${count.format(data.remote.totalLicenses ?? 0)} license · ${count.format(data.remote.paidOrders ?? 0)} đơn đã thanh toán`
                : "Chưa kết nối phiên VPS quản trị"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. REAL DATA BAR CHART */}
      <div className="chart-card-v3">
        <div className="chart-header-v3">
          <div>
            <h3>
              {chartMode === "tatami"
                ? "Phân bổ số trận đấu theo Thảm (Tatami)"
                : chartMode === "events"
                  ? "Quy mô trận đấu / nội dung theo Giải đấu"
                  : "Doanh thu License 14 ngày gần nhất (VNĐ)"}
            </h3>
            <p>
              {activeBars.length > 0
                ? "Rê chuột vào từng cột để xem số liệu chính xác từ hệ thống."
                : "Chưa có dữ liệu trận đấu hoặc giải đấu nào từ máy chủ."}
            </p>
          </div>
          {hoveredBar && (
            <div className="chart-tooltip-badge">
              <strong>{hoveredBar.label}:</strong> {count.format(hoveredBar.primary)}{" "}
              {chartMode === "revenue" ? "VNĐ" : "trận / nội dung"}
              {chartMode !== "revenue" && hoveredBar.secondary > 0
                ? ` (${count.format(hoveredBar.secondary)} đã hoàn thành)`
                : ""}
            </div>
          )}
        </div>

        {activeBars.length === 0 ? (
          <div className="chart-visual-container" style={{ display: "grid", placeItems: "center", minHeight: 180 }}>
            <p style={{ color: "var(--muted)", margin: 0 }}>
              Chưa có dữ liệu từ API cho chế độ hiển thị này.
            </p>
          </div>
        ) : (
          <div className="chart-visual-container">
            <div className="chart-bars-wrap">
              {activeBars.map((bar) => {
                const heightPercent = Math.max((bar.primary / maxBarValue) * 100, 8);
                return (
                  <div
                    key={bar.label}
                    className={`chart-bar-col ${bar.highlight ? "is-highlighted" : ""}`}
                    onMouseEnter={() => setHoveredBar(bar)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div className="chart-bar-fill-wrap">
                      <div className="chart-bar-fill" style={{ height: `${heightPercent}%` }}>
                        <span className="chart-bar-tooltip-top">{count.format(bar.primary)}</span>
                      </div>
                    </div>
                    <span className="chart-bar-x-label">{bar.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. MULTI-COLUMN REAL INSIGHTS */}
      <div className="insights-grid-v3">
        {/* Match Progress Breakdown */}
        <div className="insight-card-v3">
          <div className="insight-header">
            <h4>Tiến Độ Trận Đấu Thực Tế</h4>
            <span className="insight-tag">Public API</span>
          </div>
          <div className="device-stat-list">
            <div className="device-stat-row">
              <div className="device-info">
                <span>✅ Đã kết thúc ({count.format(finishedMatches.length)} trận)</span>
                <strong>{finishedPct}%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-bar green" style={{ width: `${finishedPct}%` }} />
              </div>
            </div>

            <div className="device-stat-row">
              <div className="device-info">
                <span>🔴 Đang thi đấu ({count.format(liveMatches.length)} trận)</span>
                <strong>{livePct}%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-bar red" style={{ width: `${livePct}%` }} />
              </div>
            </div>

            <div className="device-stat-row">
              <div className="device-info">
                <span>🕒 Sắp diễn ra ({count.format(upcomingMatches.length)} trận)</span>
                <strong>{upcomingPct}%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-bar blue" style={{ width: `${upcomingPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* System Content & Modules */}
        <div className="insight-card-v3">
          <div className="insight-header">
            <h4>Tài Nguyên &amp; Mô-đun Hệ Thống</h4>
            <span className="insight-tag">Thực tế</span>
          </div>
          <ul className="channel-list">
            <li>
              <span className="channel-dot qr" />
              <div className="channel-meta">
                <strong>Ngân hàng đề WKF Exam</strong>
                <small>Dữ liệu câu hỏi &amp; đáp án chính thức</small>
              </div>
              <strong className="channel-pct">{count.format(data.wkfQuestionsCount)} câu</strong>
            </li>
            <li>
              <span className="channel-dot direct" />
              <div className="channel-meta">
                <strong>Tin tức &amp; Banner công khai</strong>
                <small>Đồng bộ từ /api/public/news &amp; /banners</small>
              </div>
              <strong className="channel-pct">
                {data.newsCount} tin · {data.bannersCount} banner
              </strong>
            </li>
            <li>
              <span className="channel-dot social" />
              <div className="channel-meta">
                <strong>Nhà tài trợ đang kích hoạt</strong>
                <small>Quản lý tại mục Nhà tài trợ &amp; Võ phục</small>
              </div>
              <strong className="channel-pct">{count.format(data.activeSponsorsCount)} đơn vị</strong>
            </li>
            <li>
              <span className="channel-dot search" />
              <div className="channel-meta">
                <strong>Giải đấu Cloud Sync (VPS)</strong>
                <small>
                  {data.remote.connected ? "Đã kết nối máy chủ quản trị" : "Chưa kết nối phiên VPS"}
                </small>
              </div>
              <strong className="channel-pct">
                {typeof data.remote.syncedTournamentsCount === "number"
                  ? `${count.format(data.remote.syncedTournamentsCount)} giải`
                  : "—"}
              </strong>
            </li>
          </ul>
        </div>

        {/* Real Tournaments List */}
        <div className="insight-card-v3">
          <div className="insight-header">
            <h4>Danh Sách Giải Đấu Hiện Có</h4>
            <span className="insight-tag">{data.events.length} giải</span>
          </div>
          {data.events.length === 0 ? (
            <p style={{ color: "var(--muted)", margin: "0.5rem 0 0" }}>
              Chưa có giải đấu nào trong Public API.
            </p>
          ) : (
            <ul className="top-pages-list">
              {data.events.slice(0, 4).map((ev, index) => (
                <li key={ev.slug}>
                  <span className="page-rank">{index + 1}</span>
                  <div className="page-info">
                    <strong>
                      <Link href={`/events/${ev.slug}`}>{ev.name}</Link>
                    </strong>
                    <small>
                      {ev.location || "Chưa rõ địa điểm"} · {ev.date}
                    </small>
                  </div>
                  <span className="page-views">{ev.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
