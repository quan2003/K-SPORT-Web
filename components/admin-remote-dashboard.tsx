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
  return (
    <section className="admin-dashboard-v3" aria-labelledby="admin-overview-heading">
      <div className="admin-page-heading">
        <div><p className="admin-eyebrow">Tổng quan máy chủ</p><h1 id="admin-overview-heading">Tổng quan hệ thống</h1><p>Dữ liệu đồng bộ trực tiếp từ máy chủ quản trị.</p></div>
        <Link className="btn-pro-primary" href="/admin/events">Quản lý giải đấu</Link>
      </div>
      {state.loading && <p role="status">Đang tải dữ liệu thật…</p>}
      {state.error && <p className="admin-error" role="alert">{state.error}</p>}
      {!state.loading && !state.error && <>
        <div className="admin-stat-grid">
          <article className="admin-stat-card"><span>Tổng license</span><strong>{numberFrom(stats, ["totalLicenses"])}</strong></article>
          <article className="admin-stat-card"><span>License đang hoạt động</span><strong>{numberFrom(stats, ["activeLicenses"])}</strong></article>
          <article className="admin-stat-card"><span>Yêu cầu đang chờ</span><strong>{numberFrom(stats, ["requestsPending"])}</strong></article>
          <article className="admin-stat-card"><span>Đơn hàng đã thanh toán</span><strong>{numberFrom(payments, ["paid_orders"])}</strong></article>
        </div>
        <section className="admin-panel"><div className="admin-panel-heading"><h2>Giải đấu đồng bộ gần đây</h2><Link href="/admin/events">Xem tất cả</Link></div>
          {tournaments.length === 0 ? <p>Máy chủ chưa trả về danh sách giải đấu.</p> : <div className="admin-data-list">{tournaments.slice(0, 6).map((row, index) => <div className="admin-data-row" key={String(row.id || row._id || index)}><strong>{String(row.name || row.title || row.tournamentName || "Giải đấu")}</strong><span>{String(row.status || row.syncStatus || "Cloud Synced")}</span></div>)}</div>}
        </section>
      </>}
    </section>
  );
}
