"use client";

import { useState } from "react";
import Link from "next/link";

type TimeMode = "today" | "week" | "month" | "year";

type ChartPoint = {
  label: string;
  visits: number;
  users: number;
  highlight?: boolean;
};

// Rich realistic analytics datasets
const ANALYTICS_DATA: {
  today: ChartPoint[];
  week: Record<string, ChartPoint[]>;
  month: Record<string, ChartPoint[]>;
  year: Record<string, ChartPoint[]>;
} = {
  today: [
    { label: "06:00", visits: 120, users: 45 },
    { label: "08:00", visits: 480, users: 190, highlight: true }, // Khai mạc
    { label: "10:00", visits: 920, users: 380, highlight: true }, // Vòng loại Kata
    { label: "12:00", visits: 640, users: 260 },
    { label: "14:00", visits: 1150, users: 490, highlight: true }, // Tứ kết Kumite
    { label: "16:00", visits: 1380, users: 560, highlight: true }, // Bán kết Kumite
    { label: "18:00", visits: 890, users: 340 },
    { label: "20:00", visits: 410, users: 180 },
  ],
  week: {
    "Tuần 45 (Hiện tại)": [
      { label: "Thứ 2 (04/11)", visits: 680, users: 290 },
      { label: "Thứ 3 (05/11)", visits: 740, users: 310 },
      { label: "Thứ 4 (06/11)", visits: 890, users: 380 },
      { label: "Thứ 5 (07/11)", visits: 1120, users: 480 },
      { label: "Thứ 6 (08/11)", visits: 2450, users: 1040, highlight: true }, // Khai mạc giải
      { label: "Thứ 7 (09/11)", visits: 3180, users: 1360, highlight: true }, // Ngày thi đấu đỉnh cao
      { label: "Chủ Nhật (10/11)", visits: 2890, users: 1220, highlight: true }, // Chung kết & Bế mạc
    ],
    "Tuần 44 (Tuần trước)": [
      { label: "Thứ 2", visits: 420, users: 180 },
      { label: "Thứ 3", visits: 480, users: 210 },
      { label: "Thứ 4", visits: 520, users: 230 },
      { label: "Thứ 5", visits: 610, users: 270 },
      { label: "Thứ 6", visits: 780, users: 340 },
      { label: "Thứ 7", visits: 890, users: 390 },
      { label: "Chủ Nhật", visits: 820, users: 360 },
    ],
  },
  month: {
    "Tháng 11/2026": [
      { label: "Tuần 1 (01-07/11)", visits: 4650, users: 1840 },
      { label: "Tuần 2 (08-14/11 - Giải Phú Thọ)", visits: 11840, users: 4890, highlight: true },
      { label: "Tuần 3 (15-21/11)", visits: 5200, users: 2100 },
      { label: "Tuần 4 (22-30/11)", visits: 4800, users: 1950 },
    ],
    "Tháng 10/2026": [
      { label: "Tuần 1", visits: 2800, users: 1100 },
      { label: "Tuần 2", visits: 3100, users: 1250 },
      { label: "Tuần 3", visits: 3950, users: 1620 },
      { label: "Tuần 4", visits: 4200, users: 1740 },
    ],
    "Tháng 09/2026": [
      { label: "Tuần 1", visits: 2400, users: 950 },
      { label: "Tuần 2", visits: 2650, users: 1040 },
      { label: "Tuần 3", visits: 3100, users: 1220 },
      { label: "Tuần 4", visits: 3450, users: 1380 },
    ],
  },
  year: {
    "2026": [
      { label: "Thg 1", visits: 2450, users: 980 },
      { label: "Thg 2", visits: 2890, users: 1140 },
      { label: "Thg 3", visits: 3650, users: 1480 },
      { label: "Thg 4", visits: 4120, users: 1690 },
      { label: "Thg 5", visits: 4980, users: 2040 },
      { label: "Thg 6", visits: 5820, users: 2390 },
      { label: "Thg 7", visits: 7920, users: 3250, highlight: true }, // Giải Trẻ Toàn Quốc
      { label: "Thg 8", visits: 6410, users: 2610 },
      { label: "Thg 9", visits: 5930, users: 2420 },
      { label: "Thg 10", visits: 7450, users: 3080 },
      { label: "Thg 11", visits: 12480, users: 5120, highlight: true }, // Giải Phú Thọ 2026
      { label: "Thg 12 (Dự kiến)", visits: 8500, users: 3500 },
    ],
    "2025": [
      { label: "Thg 1", visits: 1850, users: 740 },
      { label: "Thg 2", visits: 2100, users: 850 },
      { label: "Thg 3", visits: 2640, users: 1050 },
      { label: "Thg 4", visits: 3100, users: 1240 },
      { label: "Thg 5", visits: 3900, users: 1560 },
      { label: "Thg 6", visits: 4800, users: 1920 },
      { label: "Thg 7", visits: 6200, users: 2480 },
      { label: "Thg 8", visits: 5400, users: 2160 },
      { label: "Thg 9", visits: 4900, users: 1960 },
      { label: "Thg 10", visits: 5600, users: 2240 },
      { label: "Thg 11", visits: 7200, users: 2880 },
      { label: "Thg 12", visits: 6100, users: 2440 },
    ],
    "2024": [
      { label: "Thg 1", visits: 1200, users: 480 },
      { label: "Thg 2", visits: 1450, users: 580 },
      { label: "Thg 3", visits: 1900, users: 760 },
      { label: "Thg 4", visits: 2300, users: 920 },
      { label: "Thg 5", visits: 2800, users: 1120 },
      { label: "Thg 6", visits: 3600, users: 1440 },
      { label: "Thg 7", visits: 4900, users: 1960 },
      { label: "Thg 8", visits: 4100, users: 1640 },
      { label: "Thg 9", visits: 3700, users: 1480 },
      { label: "Thg 10", visits: 4300, users: 1720 },
      { label: "Thg 11", visits: 5200, users: 2080 },
      { label: "Thg 12", visits: 4600, users: 1840 },
    ],
    "2023": [
      { label: "Thg 1", visits: 800, users: 320 },
      { label: "Thg 2", visits: 950, users: 380 },
      { label: "Thg 3", visits: 1200, users: 480 },
      { label: "Thg 4", visits: 1500, users: 600 },
      { label: "Thg 5", visits: 1800, users: 720 },
      { label: "Thg 6", visits: 2400, users: 960 },
      { label: "Thg 7", visits: 3200, users: 1280 },
      { label: "Thg 8", visits: 2700, users: 1080 },
      { label: "Thg 9", visits: 2500, users: 1000 },
      { label: "Thg 10", visits: 2900, users: 1160 },
      { label: "Thg 11", visits: 3500, users: 1400 },
      { label: "Thg 12", visits: 3100, users: 1240 },
    ],
  },
};

export function AdminDashboard() {
  const [mode, setMode] = useState<TimeMode>("year");
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedMonth, setSelectedMonth] = useState<string>("Tháng 11/2026");
  const [selectedWeek, setSelectedWeek] = useState<string>("Tuần 45 (Hiện tại)");
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);

  // Compute active data points
  let currentPoints: ChartPoint[] = [];
  if (mode === "today") {
    currentPoints = ANALYTICS_DATA.today;
  } else if (mode === "week") {
    currentPoints = ANALYTICS_DATA.week[selectedWeek] || ANALYTICS_DATA.week["Tuần 45 (Hiện tại)"];
  } else if (mode === "month") {
    currentPoints = ANALYTICS_DATA.month[selectedMonth] || ANALYTICS_DATA.month["Tháng 11/2026"];
  } else {
    currentPoints = ANALYTICS_DATA.year[selectedYear] || ANALYTICS_DATA.year["2026"];
  }

  const totalVisits = currentPoints.reduce((acc, p) => acc + p.visits, 0);
  const totalUsers = currentPoints.reduce((acc, p) => acc + p.users, 0);
  const maxVisits = Math.max(...currentPoints.map((p) => p.visits), 1);
  const count = new Intl.NumberFormat("vi-VN");

  return (
    <section className="admin-dashboard-v3" aria-labelledby="admin-overview-heading">
      {/* 1. TOURNAMENT LIVE BANNER */}
      <div className="pro-alert-banner">
        <div className="pro-alert-content">
          <div className="pro-alert-badge">
            <span className="live-dot-pulse" />
            <span>ĐANG TRUYỀN DỮ LIỆU TRỰC TIẾP</span>
          </div>
          <h2 className="pro-alert-title">Giải vô địch các CLB Karate tỉnh Phú Thọ 2026</h2>
          <p className="pro-alert-sub">
            342 VĐV tranh tài · 3 Thảm đấu Tatami điện tử · Cổng thông tin đang đón lượt truy cập cao điểm
          </p>
        </div>
        <div className="pro-alert-buttons">
          <Link href="/admin/btc" className="btn-pro-primary">
            🏆 Mở Thống Kê Ban Tổ Chức (BTC)
          </Link>
          <Link href="/admin/sponsors" className="btn-pro-outline">
            🤝 Quản Lý Nhà Tài Trợ Võ Phục
          </Link>
        </div>
      </div>

      {/* 2. HEADER & ADVANCED TIME FILTERS */}
      <div className="analytics-control-bar">
        <div>
          <h1 id="admin-overview-heading" className="analytics-main-title">
            Thống Kê Lượng Người Truy Cập K-SPORT
          </h1>
          <p className="analytics-sub-title">
            Dữ liệu người xem trực tiếp, người dùng quét mã QR thẻ VĐV và theo dõi kết quả các thảm đấu.
          </p>
        </div>

        {/* Time Filter Controls */}
        <div className="time-filter-wrapper">
          {/* Main Mode Tabs */}
          <div className="filter-tab-group" role="tablist" aria-label="Khoảng thời gian thống kê">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "today"}
              className={`filter-tab-btn ${mode === "today" ? "is-active" : ""}`}
              onClick={() => setMode("today")}
            >
              Hôm nay
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "week"}
              className={`filter-tab-btn ${mode === "week" ? "is-active" : ""}`}
              onClick={() => setMode("week")}
            >
              Theo tuần
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "month"}
              className={`filter-tab-btn ${mode === "month" ? "is-active" : ""}`}
              onClick={() => setMode("month")}
            >
              Theo tháng
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "year"}
              className={`filter-tab-btn ${mode === "year" ? "is-active" : ""}`}
              onClick={() => setMode("year")}
            >
              Theo năm
            </button>
          </div>

          {/* Granular Dropdowns depending on Mode */}
          {mode === "year" && (
            <div className="filter-dropdown-box">
              <label htmlFor="year-select">Chọn năm:</label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="filter-select-pro"
              >
                <option value="2026">Năm 2026 (Năm hiện tại)</option>
                <option value="2025">Năm 2025</option>
                <option value="2024">Năm 2024</option>
                <option value="2023">Năm 2023</option>
              </select>
            </div>
          )}

          {mode === "month" && (
            <div className="filter-dropdown-box">
              <label htmlFor="month-select">Chọn tháng:</label>
              <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="filter-select-pro"
              >
                <option value="Tháng 11/2026">Tháng 11/2026 (Giải Phú Thọ)</option>
                <option value="Tháng 10/2026">Tháng 10/2026</option>
                <option value="Tháng 09/2026">Tháng 09/2026</option>
              </select>
            </div>
          )}

          {mode === "week" && (
            <div className="filter-dropdown-box">
              <label htmlFor="week-select">Chọn tuần:</label>
              <select
                id="week-select"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="filter-select-pro"
              >
                <option value="Tuần 45 (Hiện tại)">Tuần 45 (04/11 - 10/11/2026)</option>
                <option value="Tuần 44 (Tuần trước)">Tuần 44 (28/10 - 03/11/2026)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 3. KPI STATS STRIP */}
      <div className="kpi-strip-v3">
        <div className="kpi-box-v3">
          <div className="kpi-icon-v3 red">📈</div>
          <div className="kpi-content-v3">
            <span className="kpi-label-v3">Tổng Lượt Truy Cập (Pageviews)</span>
            <strong className="kpi-val-v3">{count.format(totalVisits)}</strong>
            <span className="kpi-growth-tag positive">↑ +24.8% so với kỳ trước</span>
          </div>
        </div>

        <div className="kpi-box-v3">
          <div className="kpi-icon-v3 blue">👥</div>
          <div className="kpi-content-v3">
            <span className="kpi-label-v3">Khách Truy Cập Duy Nhất</span>
            <strong className="kpi-val-v3">{count.format(totalUsers)}</strong>
            <span className="kpi-growth-tag positive">↑ +19.2% tăng trưởng</span>
          </div>
        </div>

        <div className="kpi-box-v3">
          <div className="kpi-icon-v3 amber">📱</div>
          <div className="kpi-content-v3">
            <span className="kpi-label-v3">Quét Mã QR Thẻ VĐV &amp; Tatami</span>
            <strong className="kpi-val-v3">34.2%</strong>
            <span className="kpi-sub-v3">Hơn 4,200 lượt quét thẻ trên sàn đấu</span>
          </div>
        </div>

        <div className="kpi-box-v3">
          <div className="kpi-icon-v3 emerald">⏱️</div>
          <div className="kpi-content-v3">
            <span className="kpi-label-v3">Thời Gian Xem Trực Tiếp TB</span>
            <strong className="kpi-val-v3">4m 38s</strong>
            <span className="kpi-sub-v3">Khán giả theo dõi sát các trận Kumite</span>
          </div>
        </div>
      </div>

      {/* 4. MAIN INTERACTIVE CHART */}
      <div className="chart-card-v3">
        <div className="chart-header-v3">
          <div>
            <h3>
              Biểu đồ lưu lượng truy cập {mode === "today" ? "Hôm nay (theo khung giờ)" : mode === "week" ? selectedWeek : mode === "month" ? selectedMonth : `Năm ${selectedYear} (12 Tháng)`}
            </h3>
            <p>
              Rê chuột vào các cột mốc để xem chi tiết lượt xem và số người truy cập tương ứng.
            </p>
          </div>
          {hoveredPoint && (
            <div className="chart-tooltip-badge">
              <strong>{hoveredPoint.label}:</strong> {count.format(hoveredPoint.visits)} lượt xem · {count.format(hoveredPoint.users)} người
            </div>
          )}
        </div>

        {/* Visual Bar/Area Hybrid SVG Chart */}
        <div className="chart-visual-container">
          <div className="chart-bars-wrap">
            {currentPoints.map((point) => {
              const heightPercent = Math.max((point.visits / maxVisits) * 100, 8);
              return (
                <div
                  key={point.label}
                  className={`chart-bar-col ${point.highlight ? "is-highlighted" : ""}`}
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <div className="chart-bar-fill-wrap">
                    <div
                      className="chart-bar-fill"
                      style={{ height: `${heightPercent}%` }}
                    >
                      <span className="chart-bar-tooltip-top">{count.format(point.visits)}</span>
                    </div>
                  </div>
                  <span className="chart-bar-x-label">{point.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. MULTI-COLUMN INSIGHTS (DEVICES, CHANNELS, POPULAR MATCHES) */}
      <div className="insights-grid-v3">
        {/* Device Breakdown */}
        <div className="insight-card-v3">
          <div className="insight-header">
            <h4>Thiết Bị Truy Cập</h4>
            <span className="insight-tag">Realtime</span>
          </div>
          <div className="device-stat-list">
            <div className="device-stat-row">
              <div className="device-info">
                <span>📱 Điện thoại di động (Smartphones)</span>
                <strong>74.2%</strong>
              </div>
              <div className="progress-track"><div className="progress-bar red" style={{ width: "74.2%" }} /></div>
            </div>

            <div className="device-stat-row">
              <div className="device-info">
                <span>💻 Máy tính &amp; Laptop</span>
                <strong>21.6%</strong>
              </div>
              <div className="progress-track"><div className="progress-bar blue" style={{ width: "21.6%" }} /></div>
            </div>

            <div className="device-stat-row">
              <div className="device-info">
                <span>📟 Máy tính bảng &amp; Màn hình LED Thảm</span>
                <strong>4.2%</strong>
              </div>
              <div className="progress-track"><div className="progress-bar green" style={{ width: "4.2%" }} /></div>
            </div>
          </div>
        </div>

        {/* Traffic Channels */}
        <div className="insight-card-v3">
          <div className="insight-header">
            <h4>Nguồn Truy Cập &amp; Tiếp Cận</h4>
            <span className="insight-tag">K-SPORT Tracking</span>
          </div>
          <ul className="channel-list">
            <li>
              <span className="channel-dot qr" />
              <div className="channel-meta">
                <strong>Quét mã QR Thẻ VĐV &amp; Poster</strong>
                <small>Khán đài và võ sinh quét trực tiếp tại sàn đấu</small>
              </div>
              <strong className="channel-pct">38.4%</strong>
            </li>
            <li>
              <span className="channel-dot direct" />
              <div className="channel-meta">
                <strong>Truy cập trực tiếp k-sport.net</strong>
                <small>Ban huấn luyện, trọng tài và VĐV lưu bookmark</small>
              </div>
              <strong className="channel-pct">32.1%</strong>
            </li>
            <li>
              <span className="channel-dot social" />
              <div className="channel-meta">
                <strong>Mạng xã hội (Facebook, Zalo)</strong>
                <small>Chia sẻ link livestream và bảng điểm thảm đấu</small>
              </div>
              <strong className="channel-pct">21.5%</strong>
            </li>
            <li>
              <span className="channel-dot search" />
              <div className="channel-meta">
                <strong>Tìm kiếm Google</strong>
                <small>Tìm kiếm kết quả giải Karate Phú Thọ</small>
              </div>
              <strong className="channel-pct">8.0%</strong>
            </li>
          </ul>
        </div>

        {/* Top Visited Pages & Matches */}
        <div className="insight-card-v3">
          <div className="insight-header">
            <h4>Trang &amp; Thảm Đấu Được Xem Nhiều</h4>
            <span className="insight-tag">Hôm nay</span>
          </div>
          <ul className="top-pages-list">
            <li>
              <span className="page-rank">1</span>
              <div className="page-info">
                <strong>Thảm 1 — Kumite Nam -67kg</strong>
                <small>/schedule (Thảm 1 trực tiếp)</small>
              </div>
              <span className="page-views">2,410 lượt</span>
            </li>
            <li>
              <span className="page-rank">2</span>
              <div className="page-info">
                <strong>Thảm 2 — Kumite Nữ -55kg</strong>
                <small>/schedule (Thảm 2 trực tiếp)</small>
              </div>
              <span className="page-views">1,890 lượt</span>
            </li>
            <li>
              <span className="page-rank">3</span>
              <div className="page-info">
                <strong>Bảng Tổng Sắp Huy Chương</strong>
                <small>/ranking (Toàn đoàn Phú Thọ 2026)</small>
              </div>
              <span className="page-views">1,420 lượt</span>
            </li>
            <li>
              <span className="page-rank">4</span>
              <div className="page-info">
                <strong>Thẻ VĐV Nguyễn Văn A</strong>
                <small>/athletes/athlete-vie-0001 (Quét QR)</small>
              </div>
              <span className="page-views">980 lượt</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
