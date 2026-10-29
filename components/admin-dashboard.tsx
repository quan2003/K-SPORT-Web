"use client";

import { useMemo, useState } from "react";
import { adminAnalyticsDemo } from "@/lib/mock-data";

type Range = "month" | "year";

function LineChart({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(...values);
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${92 - (value / max) * 76}`).join(" ");
  return <div className="admin-chart" role="img" aria-label="Biểu đồ lượt truy cập"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path className="admin-chart-grid" d="M0 16H100M0 42H100M0 68H100M0 92H100" /><polyline className="admin-chart-line" points={points} /></svg><div className="admin-chart-labels">{labels.map((label) => <span key={label}>{label}</span>)}</div></div>;
}

export function AdminDashboard() {
  const [range, setRange] = useState<Range>("month");
  const data = range === "month" ? adminAnalyticsDemo.months : adminAnalyticsDemo.years;
  const totals = useMemo(() => data.reduce((sum, item) => ({ visits: sum.visits + item.visits, users: sum.users + item.users, events: sum.events + item.events }), { visits: 0, users: 0, events: 0 }), [data]);
  const current = data.at(-1)!;
  const count = new Intl.NumberFormat("vi-VN");

  return <section className="admin-dashboard" aria-labelledby="admin-overview-heading">
    <div className="admin-title admin-dashboard-title"><div><p className="admin-context">Dữ liệu minh họa</p><h1 id="admin-overview-heading">Tổng quan</h1><p>Theo dõi lượng truy cập, tài khoản và hoạt động quản trị của cổng thông tin.</p></div><div className="admin-range" role="group" aria-label="Khoảng thời gian"><button type="button" aria-pressed={range === "month"} onClick={() => setRange("month")}>Theo tháng</button><button type="button" aria-pressed={range === "year"} onClick={() => setRange("year")}>Theo năm</button></div></div>
    <div className="admin-kpi-strip">
      <div><span>Lượt truy cập</span><strong>{count.format(totals.visits)}</strong><small>{range === "month" ? "6 tháng gần nhất" : "4 năm gần nhất"}</small></div>
      <div><span>Người dùng hoạt động</span><strong>{count.format(current.users)}</strong><small>{range === "month" ? `Tháng ${current.label.replace("Thg ", "")}` : `Năm ${current.label}`}</small></div>
      <div><span>Giải đấu ghi nhận</span><strong>{count.format(totals.events)}</strong><small>Trong kỳ đang xem</small></div>
    </div>
    <div className="admin-analytics-grid">
      <section className="admin-panel admin-traffic-panel" aria-labelledby="traffic-heading"><header><div><h2 id="traffic-heading">Lưu lượng truy cập</h2><p>{count.format(current.visits)} lượt ở kỳ gần nhất.</p></div><span className="admin-demo-mark">Dữ liệu minh họa</span></header><LineChart values={data.map((item) => item.visits)} labels={data.map((item) => item.label)} /></section>
      <section className="admin-panel admin-activity-panel" aria-labelledby="activity-heading"><header><h2 id="activity-heading">Hoạt động gần đây</h2></header><ul>{adminAnalyticsDemo.recentActivity.map((item) => <li key={item.label}><div><strong>{item.label}</strong><span>{item.type}</span></div><time>{item.time}</time></li>)}</ul></section>
    </div>
  </section>;
}
