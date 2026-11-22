"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Match, TournamentEvent } from "@/lib/public-data";
import type { SiteAnalyticsSnapshot } from "@/lib/analytics-store";

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
  analytics: SiteAnalyticsSnapshot;
  remote: {
    connected: boolean;
    totalLicenses?: number | null;
    activeLicenses?: number | null;
    requestsPending?: number | null;
    paidOrders?: number | null;
    syncedTournamentsCount?: number | null;
  };
  fetchedAt: string;
};

type ChartMode = "visitors" | "tatami" | "events";

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
  const [chartMode, setChartMode] = useState<ChartMode>("visitors");
  const [selectedYear, setSelectedYear] = useState<number>(data.analytics.year);
  const [hoveredBar, setHoveredBar] = useState<ChartBar | null>(null);

  const count = useMemo(() => new Intl.NumberFormat("vi-VN"), []);
  const allMatches = useMemo(() => dedupeMatches(data.schedule, data.results), [data.schedule, data.results]);

  const liveEvents = useMemo(() => data.events.filter((e) => e.status === "Đang diễn ra"), [data.events]);
  const upcomingEvents = useMemo(() => data.events.filter((e) => e.status === "Sắp diễn ra"), [data.events]);
  const featuredEvent = liveEvents[0] || upcomingEvents[0] || data.events[0] || null;

  const liveMatches = useMemo(() => allMatches.filter((m) => m.state === "Đang thi đấu"), [allMatches]);
  const finishedMatches = useMemo(() => allMatches.filter((m) => m.state === "Đã kết thúc"), [allMatches]);

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

  const visitorBars: ChartBar[] = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const yearPoints = data.analytics.monthlyByYear[selectedYear] || [];
    return yearPoints.map((m) => ({
      label: m.label,
      primary: m.views,
      secondary: m.users,
      highlight: selectedYear === data.analytics.year && m.monthIndex === currentMonth && m.views > 0,
    }));
  }, [data.analytics.monthlyByYear, data.analytics.year, selectedYear]);

  const activeBars = chartMode === "visitors" ? visitorBars : chartMode === "events" ? eventBars : tatamiBars;
  const maxBarValue = Math.max(...activeBars.map((b) => b.primary), 1);

  const totalMatches = allMatches.length;

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
              aria-selected={chartMode === "visitors"}
              className={`filter-tab-btn ${chartMode === "visitors" ? "is-active" : ""}`}
              onClick={() => {
                setChartMode("visitors");
                setHoveredBar(null);
              }}
            >
              Người dùng (12 tháng)
            </button>
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
          </div>
          {chartMode === "visitors" ? (
            <div className="filter-dropdown-box">
              <label htmlFor="admin-year-select">Năm:</label>
              <select
                id="admin-year-select"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setHoveredBar(null);
                }}
                className="filter-select-pro"
              >
                {data.analytics.availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y === data.analytics.year ? `Năm ${y} (Hiện tại)` : `Năm ${y}`}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
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
              {chartMode === "visitors"
                ? `Biểu đồ lưu lượng người dùng Năm ${selectedYear} (12 Tháng)`
                : chartMode === "tatami"
                  ? "Phân bổ số trận đấu theo Thảm (Tatami)"
                  : "Quy mô trận đấu / nội dung theo Giải đấu"}
            </h3>
            <p>
              {chartMode === "visitors"
                ? "Số liệu thực tế ghi nhận lượt xem trang và người dùng duy nhất theo từng tháng."
                : activeBars.length > 0
                  ? "Rê chuột vào từng cột để xem số liệu chính xác từ hệ thống."
                  : "Chưa có dữ liệu trận đấu hoặc giải đấu nào từ máy chủ."}
            </p>
          </div>
          {hoveredBar && (
            <div className="chart-tooltip-badge">
              <strong>{hoveredBar.label}:</strong> {count.format(hoveredBar.primary)}{" "}
              {chartMode === "visitors" ? "lượt xem" : "trận / nội dung"}
              {chartMode === "visitors"
                ? ` · ${count.format(hoveredBar.secondary)} người dùng duy nhất`
                : hoveredBar.secondary > 0
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
        {/* Real Device & Visitor Breakdown */}
        <div className="insight-card-v3">
          <div className="insight-header">
            <h4>Người Dùng &amp; Thiết Bị Truy Cập</h4>
            <span className="insight-tag">Realtime</span>
          </div>
          {(() => {
            const totalDev =
              data.analytics.devices.mobile +
              data.analytics.devices.desktop +
              data.analytics.devices.tablet;
            const mobilePct = totalDev > 0 ? Math.round((data.analytics.devices.mobile / totalDev) * 1000) / 10 : 0;
            const desktopPct = totalDev > 0 ? Math.round((data.analytics.devices.desktop / totalDev) * 1000) / 10 : 0;
            const tabletPct = totalDev > 0 ? Math.max(0, Math.round((100 - mobilePct - desktopPct) * 10) / 10) : 0;
            return (
              <div className="device-stat-list">
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569", marginBottom: "6px" }}>
                  <span>Lượt xem: <strong>{count.format(data.analytics.pageviews)}</strong></span>
                  <span>Người dùng duy nhất: <strong>{count.format(data.analytics.uniqueVisitors)}</strong></span>
                </div>
                <div className="device-stat-row">
                  <div className="device-info">
                    <span>📱 Điện thoại ({count.format(data.analytics.devices.mobile)})</span>
                    <strong>{mobilePct}%</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-bar red" style={{ width: `${mobilePct}%` }} />
                  </div>
                </div>
                <div className="device-stat-row">
                  <div className="device-info">
                    <span>💻 Máy tính &amp; Laptop ({count.format(data.analytics.devices.desktop)})</span>
                    <strong>{desktopPct}%</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-bar blue" style={{ width: `${desktopPct}%` }} />
                  </div>
                </div>
                <div className="device-stat-row">
                  <div className="device-info">
                    <span>📟 Máy tính bảng ({count.format(data.analytics.devices.tablet)})</span>
                    <strong>{tabletPct}%</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-bar green" style={{ width: `${tabletPct}%` }} />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Top Visited Pages (Real) */}
        <div className="insight-card-v3">
          <div className="insight-header">
            <h4>Trang Được Truy Cập Nhiều</h4>
            <span className="insight-tag">Phiên hiện tại</span>
          </div>
          {data.analytics.topPages.length === 0 ? (
            <p style={{ color: "var(--muted)", margin: "0.5rem 0 0" }}>
              Chưa ghi nhận lượt truy cập công khai nào trong phiên máy chủ hiện tại.
            </p>
          ) : (
            <ul className="top-pages-list">
              {data.analytics.topPages.map((item, idx) => (
                <li key={item.path}>
                  <span className="page-rank">{idx + 1}</span>
                  <div className="page-info">
                    <strong>{item.path}</strong>
                    <small>Đường dẫn công khai</small>
                  </div>
                  <span className="page-views">{count.format(item.views)} lượt</span>
                </li>
              ))}
            </ul>
          )}
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
