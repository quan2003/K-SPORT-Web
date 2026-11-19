"use client";

import { useEffect, useMemo, useState } from "react";

type Tournament = {
  id: string;
  name: string;
  machine_id?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  last_synced_at?: string;
  is_purged?: boolean;
  status?: string;
  athlete_count?: number;
  category_count?: number;
  storage_bytes?: number;
};

const formatSize = (bytes?: number, purged = false) => {
  if (purged) return "Đã dọn dữ liệu";
  if (!bytes || bytes <= 0) return "Chưa có số liệu";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString("vi-VN") : "Chưa rõ";

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa rõ";

export function TournamentsManager() {
  const [items, setItems] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "purged">("all");
  const [message, setMessage] = useState("");
  const [detail, setDetail] = useState<Tournament | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/remote/cloud-sync/tournaments", {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message);
      setItems(
        Array.isArray(payload.tournaments)
          ? payload.tournaments
          : Array.isArray(payload.data)
            ? payload.data
            : [],
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không tải được danh sách giải đấu.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const isPurged = (tournament: Tournament) =>
    Boolean(tournament.is_purged) || tournament.status === "PURGED";

  const kind = (tournament: Tournament) =>
    isPurged(tournament) ? "purged" : "active";

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((tournament) => {
      const text = `${tournament.name} ${tournament.machine_id ?? ""} ${tournament.location ?? ""}`.toLowerCase();
      return (
        (!needle || text.includes(needle)) &&
        (filter === "all" || kind(tournament) === filter)
      );
    });
  }, [filter, items, query]);

  const runAction = async (
    path: string,
    method = "POST",
  ) => {
    const response = await fetch(`/api/admin/remote/cloud-sync/${path}`, {
      method,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || "Thao tác chưa thành công.");
    await load();
  };

  const download = async (tournament: Tournament) => {
    try {
      const response = await fetch(
        `/api/admin/remote/cloud-sync/download-kbackup/${tournament.id}`,
      );
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${tournament.name.replace(/[^a-z0-9]+/gi, "-")}.kbackup`;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage("Đã tải dữ liệu về máy. Bạn có thể đưa tệp này vào phần mềm máy tính.");
    } catch {
      setMessage("Không tải được dữ liệu. Giải đấu này có thể đã được dọn dữ liệu.");
    }
  };

  const purge = async (tournament: Tournament) => {
    if (!window.confirm(`Dọn dữ liệu chi tiết của giải “${tournament.name}”?`)) return;
    try {
      await runAction(`purge/${tournament.id}`);
      setMessage("Đã dọn dữ liệu chi tiết; thông tin chính của giải vẫn được giữ lại.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể dọn dữ liệu.");
    }
  };

  const remove = async (tournament: Tournament) => {
    if (!window.confirm(`Xóa giải “${tournament.name}” khỏi danh sách?`)) return;
    try {
      await runAction(`tournament/${tournament.id}`, "DELETE");
      setMessage("Đã xóa giải đấu.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể xóa giải đấu.");
    }
  };

  if (loading) {
    return (
      <div className="admin-loading" role="status">
        <span className="admin-loading-spinner" aria-hidden="true" />
        Đang tải danh sách giải đấu…
      </div>
    );
  }

  return (
    <section className="tournaments-page">
      <header className="tournaments-heading">
        <div>
          <p className="admin-eyebrow">KARATE ADMIN</p>
          <h1>Giải đấu &amp; dữ liệu</h1>
          <p>
            Tất cả giải đấu và dữ liệu đang lưu trên máy chủ. Bạn có thể tải về để
            đưa vào phần mềm máy tính.
          </p>
        </div>
        <button type="button" onClick={() => void load()}>
          ↻ Tải lại
        </button>
      </header>

      {message && (
        <p className="orders-message" role="status">
          {message}
        </p>
      )}

      <div className="tournament-tools">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm tên giải, máy thi đấu, địa điểm…"
          aria-label="Tìm giải đấu"
        />
        <div>
          {([
            ["all", "Tất cả"],
            ["active", "Đang hoạt động"],
            ["purged", "Đã dọn dữ liệu"],
          ] as const).map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={filter === value ? "active" : ""}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="tournaments-grid">
        {rows.length === 0 ? (
          <p>Không có giải đấu phù hợp.</p>
        ) : (
          rows.map((tournament) => {
            const purged = isPurged(tournament);
            return (
              <article className="tournament-card" key={tournament.id}>
                <div className="tournament-card-top">
                  <span className={`tournament-status ${kind(tournament)}`}>
                    {purged ? "ĐÃ DỌN DỮ LIỆU" : "ĐANG HOẠT ĐỘNG"}
                  </span>
                  <span>{formatSize(tournament.storage_bytes, purged)}</span>
                </div>
                <h2>{tournament.name}</h2>
                <p>
                  {tournament.location || "Chưa rõ địa điểm"} · Cập nhật {formatDateTime(tournament.last_synced_at)}
                </p>
                <div className="tournament-meta">
                  <span>Vận động viên <b>{tournament.athlete_count ?? "—"}</b></span>
                  <span>Hạng mục <b>{tournament.category_count ?? "—"}</b></span>
                  <span>Ngày <b>{formatDate(tournament.start_date)}</b></span>
                </div>
                <div className="tournament-actions">
                  <button type="button" onClick={() => setDetail(tournament)}>
                    Xem chi tiết
                  </button>
                  <button type="button" disabled={purged} onClick={() => void download(tournament)}>
                    Tải dữ liệu về máy
                  </button>
                  <button type="button" onClick={() => void purge(tournament)}>
                    Dọn dữ liệu cũ
                  </button>
                  <button type="button" className="danger" onClick={() => void remove(tournament)}>
                    Xóa giải
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      {detail && (
        <div className="tournament-modal" role="dialog" aria-modal="true" aria-label="Chi tiết giải đấu">
          <div>
            <button type="button" className="close" onClick={() => setDetail(null)} aria-label="Đóng">
              ×
            </button>
            <p className="admin-eyebrow">Chi tiết giải đấu</p>
            <h2>{detail.name}</h2>
            <dl>
              <dt>Mã giải</dt><dd>{detail.id}</dd>
              <dt>Máy thi đấu</dt><dd>{detail.machine_id || "Chưa rõ"}</dd>
              <dt>Địa điểm</dt><dd>{detail.location || "Chưa rõ"}</dd>
              <dt>Thời gian</dt><dd>{formatDateTime(detail.start_date)} — {formatDateTime(detail.end_date)}</dd>
              <dt>Dữ liệu</dt><dd>{formatSize(detail.storage_bytes, isPurged(detail))}</dd>
            </dl>
          </div>
        </div>
      )}
    </section>
  );
}
