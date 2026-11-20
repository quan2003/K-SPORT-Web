"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RemoteState = { loading: boolean; error?: string; data?: Record<string, unknown> };

function numberFrom(data: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "number") return new Intl.NumberFormat("vi-VN").format(value);
  }
  return "—";
}

function listFrom(data: Record<string, unknown>) {
  for (const key of ["tournaments", "data", "items", "rows"]) {
    if (Array.isArray(data[key])) return data[key] as Record<string, unknown>[];
  }
  return [];
}

export function AdminRemoteDashboard() {
  const [state, setState] = useState<RemoteState>({ loading: true });
  const [tournaments, setTournaments] = useState<Record<string, unknown>[]>([]);
  useEffect(() => {
    Promise.all([fetch("/api/admin/remote/stats/dashboard"), fetch("/api/admin/remote/cloud-sync/tournaments")])
      .then(async ([statsResponse, tournamentsResponse]) => {
        const payload = await statsResponse.json().catch(() => ({}));
        if (!statsResponse.ok) throw new Error(payload.message || "Không tải được dữ liệu máy chủ.");
        const tournamentPayload = await tournamentsResponse.json().catch(() => ({}));
        setTournaments(listFrom(tournamentPayload));
        setState({ loading: false, data: payload });
      })
      .catch((error: Error) => setState({ loading: false, error: error.message }));
  }, []);

  const data = state.data || {};
  const stats = (data.stats && typeof data.stats === "object" ? data.stats : data) as Record<string, unknown>;
  const payments = (stats.payments && typeof stats.payments === "object" ? stats.payments : {}) as Record<string, unknown>;
  const dailyRevenue = Array.isArray(stats.dailyRevenue) ? stats.dailyRevenue as Record<string, unknown>[] : [];
  const licensesByType = Array.isArray(stats.licensesByType) ? stats.licensesByType as Record<string, unknown>[] : [];
  const maxRevenue = Math.max(...dailyRevenue.map((item) => Number(item.revenue_vnd || 0)), 1);
  const maxLicenseType = Math.max(...licensesByType.map((item) => Number(item.count || 0)), 1);
  return (
    <section className="admin-dashboard-v3" aria-labelledby="admin-overview-heading">
      <div className="admin-page-heading">
        <div><h1 id="admin-overview-heading">Tổng quan license</h1><p>Theo dõi license, đơn hàng và dữ liệu giải đấu từ máy chủ quản trị.</p></div>
        <Link className="btn-pro-primary" href="/admin/tournaments">Quản lý giải đấu</Link>
      </div>
      {state.loading && <div className="admin-loading" role="status"><span className="admin-loading-spinner" aria-hidden="true" />Đang tải dữ liệu thật từ máy chủ…</div>}
      {state.error && <p className="admin-error" role="alert">{state.error}</p>}
      {!state.loading && !state.error && <>
        <div className="admin-stat-grid">
          <article className="admin-stat-card"><span>Tổng license</span><strong>{numberFrom(stats, ["totalLicenses"])}</strong></article>
          <article className="admin-stat-card"><span>License đang hoạt động</span><strong>{numberFrom(stats, ["activeLicenses"])}</strong></article>
          <article className="admin-stat-card"><span>Yêu cầu đang chờ</span><strong>{numberFrom(stats, ["requestsPending"])}</strong></article>
          <article className="admin-stat-card"><span>Đơn hàng đã thanh toán</span><strong>{numberFrom(payments, ["paid_orders"])}</strong></article>
        </div>
        <section className="admin-panel"><div className="admin-panel-heading"><h2>Giải đấu đồng bộ gần đây</h2><Link href="/admin/tournaments">Xem tất cả</Link></div>
          {tournaments.length === 0 ? <p>Máy chủ chưa trả về danh sách giải đấu.</p> : <div className="admin-data-list">{tournaments.slice(0, 6).map((row, index) => <div className="admin-data-row" key={String(row.id || row._id || index)}><strong>{String(row.name || row.title || row.tournamentName || "Giải đấu")}</strong><span>{String(row.status || row.syncStatus || "Cloud Synced")}</span></div>)}</div>}
        </section>
        <div className="admin-chart-grid">
          <section className="admin-panel admin-chart-panel"><div className="admin-panel-heading"><h2>Doanh thu 14 ngày gần nhất</h2><span>VNĐ</span></div>
            {dailyRevenue.length === 0 ? <p>Chưa có dữ liệu doanh thu.</p> : <div className="admin-bar-chart" aria-label="Biểu đồ doanh thu 14 ngày">{dailyRevenue.map((item, index) => <div className="admin-bar-column" key={String(item.day || index)}><div className="admin-bar-value" style={{ height: `${Math.max(4, (Number(item.revenue_vnd || 0) / maxRevenue) * 100)}%` }} title={`${String(item.day || "")} — ${String(item.revenue_vnd || 0)} VNĐ`} /><span>{String(item.day || "")}</span></div>)}</div>}
          </section>
          <section className="admin-panel admin-chart-panel"><div className="admin-panel-heading"><h2>License theo loại</h2><span>Số lượng</span></div>
            {licensesByType.length === 0 ? <p>Chưa có dữ liệu phân loại license.</p> : <div className="admin-horizontal-chart">{licensesByType.map((item, index) => <div className="admin-horizontal-row" key={String(item.name || index)}><span>{String(item.name || "Không rõ")}</span><div><i style={{ width: `${Math.max(4, (Number(item.count || 0) / maxLicenseType) * 100)}%` }} /><strong>{String(item.count || 0)}</strong></div></div>)}</div>}
          </section>
        </div>
      </>}
    </section>
  );
}
