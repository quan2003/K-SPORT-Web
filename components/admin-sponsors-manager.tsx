"use client";

import { useState, useEffect, useCallback, FormEvent, useRef } from "react";
import type { SponsorItem, SponsorTier, SponsorPlacement } from "@/lib/admin-store";
import { SPONSOR_LOGOS } from "@/lib/sponsor-logos";

type PresetItem = {
  key: string;
  name: string;
  badge: string;
  url: string;
  website: string;
  category: string;
  tier: SponsorTier;
  desc: string;
};

const PRESET_LOGOS: PresetItem[] = [
  {
    key: "arawaza",
    name: "Arawaza Karate Vietnam",
    badge: "WKF Homologated",
    url: SPONSOR_LOGOS.arawaza,
    website: "https://arawaza.com",
    category: "Võ phục & Thiết bị thi đấu chính thức WKF",
    tier: "equipment",
    desc: "Nhà cung cấp võ phục Kata, Kumite và bảo hộ thi đấu đạt chứng nhận Liên đoàn Karate Thế giới (WKF).",
  },
  {
    key: "tokaido",
    name: "Tokaido Japan Karatedo",
    badge: "Japan Since 1956",
    url: SPONSOR_LOGOS.tokaido,
    website: "https://tokaidojapan.com",
    category: "Võ phục & Đai truyền thống Nhật Bản",
    tier: "equipment",
    desc: "Thương hiệu võ phục Karate cao cấp truyền thống từ Nhật Bản, đồng hành cùng các đội tuyển quyền thuật.",
  },
  {
    key: "shureido",
    name: "Shureido Okinawa",
    badge: "Master Kata",
    url: SPONSOR_LOGOS.shureido,
    website: "https://shureido.com",
    category: "Võ phục Kata Đỉnh cao",
    tier: "equipment",
    desc: "Thương hiệu võ phục chuẩn thi đấu số 1 thế giới tại Okinawa, Nhật Bản.",
  },
  {
    key: "tanviet",
    name: "Tân Việt Karatedo",
    badge: "Vietnam Official",
    url: SPONSOR_LOGOS.tanviet,
    website: "https://tanvietkarate.com",
    category: "Nhà tài trợ Võ phục & Dụng cụ luyện tập",
    tier: "gold",
    desc: "Đơn vị đồng hành sản xuất võ phục, thảm đấu và găng bảo hộ cho các giải đấu trẻ quốc gia.",
  },
  {
    key: "adidas",
    name: "Adidas Combat Sports",
    badge: "WKF Approved",
    url: SPONSOR_LOGOS.adidas,
    website: "https://adidascombatsports.com",
    category: "Võ phục & Thiết bị thi đấu chính thức WKF",
    tier: "equipment",
    desc: "Trang bị thi đấu Kumite và Kata chuẩn Liên đoàn Karate Thế giới WKF chính hãng Adidas.",
  },
  {
    key: "punok",
    name: "Punok World Karate",
    badge: "WKF Premier League",
    url: SPONSOR_LOGOS.punok,
    website: "https://punok.com",
    category: "Võ phục & Thiết bị thi đấu chính thức WKF",
    tier: "equipment",
    desc: "Thương hiệu võ phục và bảo hộ thi đấu chính thức cho các giải đấu Karate đỉnh cao toàn cầu.",
  },
  {
    key: "daedo",
    name: "Daedo International",
    badge: "Official WKF Brand",
    url: SPONSOR_LOGOS.daedo,
    website: "https://daedo.com",
    category: "Võ phục & Thiết bị thi đấu chính thức WKF",
    tier: "equipment",
    desc: "Nhà sản xuất đồ bảo hộ điện tử, giáp thi đấu và võ phục Karate chuẩn WKF quốc tế.",
  },
  {
    key: "smai",
    name: "SMAI Karate Pro",
    badge: "WKF Homologated",
    url: SPONSOR_LOGOS.smai,
    website: "https://smai.com.au",
    category: "Võ phục & Thiết bị thi đấu chính thức WKF",
    tier: "equipment",
    desc: "Thương hiệu thiết bị thể thao võ thuật cao cấp Australia, đạt tiêu chuẩn khắt khe của WKF.",
  },
  {
    key: "hayashi",
    name: "Hayashi Budoland",
    badge: "Budoland Germany",
    url: SPONSOR_LOGOS.hayashi,
    website: "https://hayashi.biz",
    category: "Võ phục & Thiết bị thi đấu chính thức WKF",
    tier: "equipment",
    desc: "Võ phục và phụ kiện Karate chuyên nghiệp từ CHLB Đức được WKF chứng nhận toàn cầu.",
  },
  {
    key: "wesing",
    name: "Wesing Sports",
    badge: "WKF Recognized",
    url: SPONSOR_LOGOS.wesing,
    website: "https://wesingsport.com",
    category: "Võ phục & Thiết bị thi đấu chính thức WKF",
    tier: "equipment",
    desc: "Đơn vị cung cấp thảm đấu và trang thiết bị Karate được chứng nhận bởi WKF.",
  },
  {
    key: "dongluc",
    name: "Động Lực Sport Group",
    badge: "Tài trợ Vàng",
    url: SPONSOR_LOGOS.dongluc,
    website: "https://dongluc.vn",
    category: "Nhà tài trợ Vàng Thiết bị & Trang phục Thể thao",
    tier: "gold",
    desc: "Tập đoàn thể thao hàng đầu Việt Nam, tài trợ thảm đấu EVA Tatami và trang phục trọng tài.",
  },
  {
    key: "lavie",
    name: "Nước khoáng Thiên nhiên LaVie",
    badge: "Bảo trợ Y tế & Nước",
    url: SPONSOR_LOGOS.lavie,
    website: "https://www.laviewater.com",
    category: "Bảo trợ Nước uống & Y tế Vận động viên",
    tier: "beverage",
    desc: "Cung cấp nguồn nước khoáng thiên nhiên tinh khiết phục vụ toàn bộ vận động viên và BTC tại giải.",
  },
];

type CategoryFilter = "all" | "equipment" | "gold" | "beverage";
type ViewMode = "cards" | "table";

export function AdminSponsorsManager() {
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SponsorItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<SponsorItem | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Võ phục & Thiết bị thi đấu chính thức WKF");
  const [tier, setTier] = useState<SponsorTier>("equipment");
  const [logo, setLogo] = useState("");
  const [website, setWebsite] = useState("https://");
  const [description, setDescription] = useState("");
  const [placements, setPlacements] = useState<SponsorPlacement[]>(["home", "footer"]);
  const [isActive, setIsActive] = useState(true);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchSponsors = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sponsors", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && Array.isArray(data.items)) {
        setSponsors(data.items);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    fetch("/api/admin/sponsors", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && Array.isArray(data.items)) {
          setSponsors(data.items);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });
    return () => {
      isCancelled = true;
    };
  }, []);

  function notify(type: "success" | "error", text: string) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  }

  function openCreateModal() {
    setEditingItem(null);
    setName("");
    setCategory("Võ phục & Thiết bị thi đấu chính thức WKF");
    setTier("equipment");
    setLogo(PRESET_LOGOS[0].url);
    setWebsite("https://");
    setDescription("");
    setPlacements(["home", "footer", "event", "tatami"]);
    setIsActive(true);
    setIsModalOpen(true);
  }

  function openEditModal(item: SponsorItem) {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setTier(item.tier);
    setLogo(item.logo);
    setWebsite(item.website);
    setDescription(item.description);
    setPlacements(item.placements || ["home", "footer"]);
    setIsActive(item.isActive);
    setIsModalOpen(true);
  }

  // Handle Preset Click
  function applyPreset(preset: PresetItem) {
    setLogo(preset.url);
    setName(preset.name);
    setCategory(preset.category);
    setTier(preset.tier);
    setWebsite(preset.website);
    setDescription(preset.desc);
    notify("success", `Đã chọn mẫu thương hiệu "${preset.name}"!`);
  }

  // Handle Local File Upload (Images / SVGs)
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      notify("error", "Kích thước ảnh vượt quá 2.5MB. Vui lòng chọn ảnh nhẹ hơn.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setLogo(result);
        if (!name) {
          const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          setName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }
        notify("success", `Đã tải ảnh "${file.name}" thành công!`);
      }
    };
    reader.readAsDataURL(file);
    // reset input so user can pick the same file again if needed
    e.target.value = "";
  }

  async function handleToggleActive(item: SponsorItem) {
    try {
      const res = await fetch(`/api/admin/sponsors/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (res.ok) {
        setSponsors((prev) =>
          prev.map((s) => (s.id === item.id ? { ...s, isActive: !item.isActive } : s))
        );
        notify("success", `Đã ${!item.isActive ? "kích hoạt" : "tắt"} hiển thị ${item.name}`);
      }
    } catch {
      notify("error", "Không thể cập nhật trạng thái");
    }
  }

  function confirmDelete(item: SponsorItem) {
    setDeletingItem(item);
  }

  async function executeDelete() {
    if (!deletingItem) return;
    const target = deletingItem;
    setDeletingItem(null);
    try {
      const res = await fetch(`/api/admin/sponsors/${target.id}`, { method: "DELETE" });
      if (res.ok) {
        setUsersFilterSync(target.id);
        notify("success", `Đã xóa đối tác "${target.name}" thành công`);
      } else {
        throw new Error("Không thể xóa đối tác");
      }
    } catch {
      notify("error", "Lỗi khi xóa đối tác");
    }
  }

  function setUsersFilterSync(deletedId: string) {
    setSponsors((prev) => prev.filter((s) => s.id !== deletedId));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      notify("error", "Vui lòng nhập tên nhà tài trợ");
      return;
    }

    const payload = {
      name: name.trim(),
      category: category.trim(),
      tier,
      logo: logo.trim() || PRESET_LOGOS[0].url,
      website: website.trim(),
      description: description.trim(),
      placements,
      isActive,
    };

    try {
      if (editingItem) {
        const res = await fetch(`/api/admin/sponsors/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Cập nhật thất bại");
        notify("success", "Cập nhật thông tin đối tác thành công");
      } else {
        const res = await fetch("/api/admin/sponsors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Thêm mới thất bại");
        notify("success", "Thêm đối tác & nhà tài trợ mới thành công");
      }
      setIsModalOpen(false);
      fetchSponsors();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Lỗi lưu dữ liệu");
    }
  }

  function togglePlacement(p: SponsorPlacement) {
    if (placements.includes(p)) {
      setPlacements(placements.filter((x) => x !== p));
    } else {
      setPlacements([...placements, p]);
    }
  }

  // Filtered sponsors
  const filteredSponsors = sponsors.filter((s) => {
    if (filter === "equipment") return s.tier === "equipment" || s.category.includes("Võ phục");
    if (filter === "gold") return s.tier === "gold" || s.tier === "diamond";
    if (filter === "beverage") return s.tier === "beverage" || s.category.includes("Nước");
    return true;
  });

  const activeCount = sponsors.filter((s) => s.isActive).length;
  const homeCount = sponsors.filter((s) => s.placements?.includes("home") && s.isActive).length;
  const tatamiCount = sponsors.filter((s) => s.placements?.includes("tatami") && s.isActive).length;

  return (
    <div className="sponsors-pro-hub">
      {toast && (
        <div className={`admin-toast ${toast.type}`} role="alert">
          <p>{toast.text}</p>
        </div>
      )}

      {/* 1. TOP OVERVIEW KPI STRIP */}
      <div className="sponsors-kpi-bar">
        <div className="sp-kpi-item">
          <div className="sp-kpi-icon red">🏷️</div>
          <div>
            <span className="sp-kpi-lbl">Đối Tác Kích Hoạt</span>
            <strong className="sp-kpi-num">{activeCount} / {sponsors.length}</strong>
            <span className="sp-kpi-note">100% Logo sắc nét chuẩn WKF</span>
          </div>
        </div>

        <div className="sp-kpi-item">
          <div className="sp-kpi-icon blue">🌐</div>
          <div>
            <span className="sp-kpi-lbl">Banner Trang Chủ</span>
            <strong className="sp-kpi-num">{homeCount} Thương hiệu</strong>
            <span className="sp-kpi-note">Xuất hiện ngay trước Footer</span>
          </div>
        </div>

        <div className="sp-kpi-item">
          <div className="sp-kpi-icon amber">⚡</div>
          <div>
            <span className="sp-kpi-lbl">Backdrop Thảm Đấu</span>
            <strong className="sp-kpi-num">{tatamiCount} Thương hiệu</strong>
            <span className="sp-kpi-note">Hiển thị sàn Tatami 1, 2, 3</span>
          </div>
        </div>

        <div className="sp-kpi-cta-wrap">
          <button type="button" className="btn-add-sponsor" onClick={openCreateModal}>
            + Thêm Nhà Tài Trợ Mới
          </button>
        </div>
      </div>

      {/* 2. FILTER & VIEW MODE CONTROLS */}
      <div className="sponsors-filter-bar">
        {/* Category Tabs */}
        <div className="sp-tab-group" role="tablist" aria-label="Bộ lọc đối tác">
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            className={`sp-tab-btn ${filter === "all" ? "is-active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Tất cả ({sponsors.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "equipment"}
            className={`sp-tab-btn ${filter === "equipment" ? "is-active" : ""}`}
            onClick={() => setFilter("equipment")}
          >
            Võ phục &amp; Thiết bị WKF
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "gold"}
            className={`sp-tab-btn ${filter === "gold" ? "is-active" : ""}`}
            onClick={() => setFilter("gold")}
          >
            💎 Kim Cương &amp; Vàng
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "beverage"}
            className={`sp-tab-btn ${filter === "beverage" ? "is-active" : ""}`}
            onClick={() => setFilter("beverage")}
          >
            💧 Nước uống &amp; Y tế
          </button>
        </div>

        {/* View Switcher */}
        <div className="view-mode-toggle" role="group" aria-label="Chế độ hiển thị">
          <button
            type="button"
            className={`view-btn ${viewMode === "cards" ? "is-active" : ""}`}
            onClick={() => setViewMode("cards")}
            title="Xem dạng thẻ trực quan"
          >
            🎴 Thẻ Showcase
          </button>
          <button
            type="button"
            className={`view-btn ${viewMode === "table" ? "is-active" : ""}`}
            onClick={() => setViewMode("table")}
            title="Xem dạng bảng chi tiết"
          >
            📄 Bảng danh sách
          </button>
        </div>
      </div>

      {/* 3. SHOWCASE CARD GRID */}
      {viewMode === "cards" ? (
        <div className="sp-cards-grid">
          {loading ? (
            <div className="sp-loading-box">Đang tải danh sách thương hiệu đối tác...</div>
          ) : filteredSponsors.length === 0 ? (
            <div className="sp-empty-box">Chưa có thương hiệu nào trong danh mục này.</div>
          ) : (
            filteredSponsors.map((item) => (
              <div key={item.id} className={`sp-showcase-card ${item.isActive ? "is-active" : "is-inactive"}`}>
                {/* Brand Logo Banner */}
                <div className="sp-card-logo-stage">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.logo}
                    alt={item.name}
                    className="sp-brand-logo-img"
                  />
                  <div className="sp-card-badges">
                    <span className={`sp-tier-badge ${item.tier}`}>
                      {item.tier === "equipment"
                        ? "WKF HOMOLOGATED"
                        : item.tier === "diamond"
                        ? "💎 TÀI TRỢ KIM CƯƠNG"
                        : item.tier === "gold"
                        ? "🥇 TÀI TRỢ VÀNG"
                        : "💧 ĐỒNG HÀNH Y TẾ"}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="sp-card-body">
                  <div className="sp-title-row">
                    <h3 className="sp-card-name">{item.name}</h3>
                    <button
                      type="button"
                      className={`sp-toggle-pill ${item.isActive ? "on" : "off"}`}
                      onClick={() => handleToggleActive(item)}
                      title="Nhấp để bật hoặc tắt hiển thị"
                    >
                      {item.isActive ? "● Đang hiển thị" : "○ Tạm ẩn"}
                    </button>
                  </div>

                  <p className="sp-card-category">{item.category}</p>
                  <p className="sp-card-desc">{item.description}</p>

                  {/* Placements Pill list */}
                  <div className="sp-card-placements">
                    <span className="placement-label">Vị trí:</span>
                    {item.placements?.includes("home") && <span className="placement-tag red">Trang chủ</span>}
                    {item.placements?.includes("footer") && <span className="placement-tag">Footer</span>}
                    {item.placements?.includes("event") && <span className="placement-tag blue">Giải đấu</span>}
                    {item.placements?.includes("tatami") && <span className="placement-tag amber">Thảm đấu</span>}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="sp-card-footer">
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sp-link-external"
                    >
                      {item.website.replace(/^https?:\/\//, "")} ↗
                    </a>
                    <div className="sp-action-buttons">
                      <button type="button" className="sp-btn-edit" onClick={() => openEditModal(item)}>
                        ✏️ Sửa
                      </button>
                      <button type="button" className="sp-btn-delete" onClick={() => confirmDelete(item)}>
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* TABLE VIEW OPTION */
        <div className="admin-table-wrap">
          <table className="admin-content-table">
            <thead>
              <tr>
                <th style={{ width: "120px" }}>Logo Thương Hiệu</th>
                <th>Tên Nhà Tài Trợ &amp; Đối Tác</th>
                <th>Phân Cấp Quyền Lợi</th>
                <th>Vị Trí Hiển Thị</th>
                <th>Liên Kết Website</th>
                <th style={{ textAlign: "center" }}>Trạng Thái</th>
                <th style={{ textAlign: "right" }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredSponsors.map((item) => (
                <tr key={item.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.logo}
                      alt={item.name}
                      style={{
                        width: "100px",
                        height: "44px",
                        objectFit: "contain",
                        background: "#fff",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        padding: "2px",
                      }}
                    />
                  </td>
                  <td>
                    <strong>{item.name}</strong>
                    <small style={{ display: "block", color: "#64748b" }}>{item.category}</small>
                  </td>
                  <td>
                    <span className={`sp-tier-badge ${item.tier}`}>{item.tier.toUpperCase()}</span>
                  </td>
                  <td>
                    <div className="sp-card-placements">
                      {item.placements?.includes("home") && <span className="placement-tag red">Trang chủ</span>}
                      {item.placements?.includes("tatami") && <span className="placement-tag amber">Thảm đấu</span>}
                    </div>
                  </td>
                  <td>
                    <a href={item.website} target="_blank" rel="noopener noreferrer" style={{ color: "#0284c7" }}>
                      {item.website.replace(/^https?:\/\//, "")} ↗
                    </a>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      className={`sp-toggle-pill ${item.isActive ? "on" : "off"}`}
                      onClick={() => handleToggleActive(item)}
                    >
                      {item.isActive ? "● Bật" : "○ Ẩn"}
                    </button>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="admin-content-card-actions">
                      <button type="button" onClick={() => openEditModal(item)}>Sửa</button>
                      <button type="button" onClick={() => confirmDelete(item)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. MODAL: CREATE / EDIT SPONSOR */}
      {isModalOpen && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-box sponsor-modal-wide">
            <div className="admin-modal-header">
              <div>
                <h3>{editingItem ? "Chỉnh sửa thông tin đối tác" : "Thêm Nhà Tài Trợ & Thương Hiệu Võ Phục WKF"}</h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                  Hỗ trợ tải logo từ máy tính (PNG/SVG) hoặc chọn nhanh các thương hiệu võ phục chuẩn WKF toàn cầu.
                </p>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            {/* Quick Helper Banner */}
            <div className="sponsor-modal-tip">
              <strong>💡 Hướng dẫn thêm logo thương hiệu võ phục WKF:</strong>
              <p>
                • <strong>Cách 1:</strong> Bấm chọn nhanh các hãng võ phục chuẩn WKF bên dưới (Arawaza, Tokaido, Shureido, Adidas, Punok, Daedo, SMAI, Tân Việt...) để tự động điền đủ thông tin và logo SVG sắc nét.<br />
                • <strong>Cách 2:</strong> Bấm <em>&quot;Tải logo từ máy tính&quot;</em> để chọn file hình ảnh (SVG, PNG trong suốt, JPG) có sẵn trên máy của bạn.<br />
                • Đánh dấu chọn <strong>&quot;Trang chủ&quot;</strong> để logo xuất hiện ngay ở dải Đối Tác WKF ngoài trang chủ K-SPORT.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              {/* Quick logo selector */}
              <div className="quick-logo-bar">
                <span className="quick-logo-title">1. Chọn nhanh thương hiệu chuẩn WKF có sẵn:</span>
                <div className="quick-logo-buttons">
                  {PRESET_LOGOS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      className={`quick-logo-btn ${logo === s.url ? "is-selected" : ""}`}
                      onClick={() => applyPreset(s)}
                      title={`Tự động áp dụng mẫu ${s.name}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload from PC & Image URL */}
              <div className="logo-upload-section">
                <span className="quick-logo-title">2. Hoặc tải logo từ máy tính của bạn:</span>
                <div className="logo-upload-controls">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    className="btn-upload-file"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    📁 Tải file logo từ máy tính (PNG, SVG, JPG)
                  </button>
                  <span className="upload-file-hint">Khuyến nghị dùng file PNG nền trong suốt hoặc SVG để hiển thị đẹp nhất.</span>
                </div>
              </div>

              {/* Logo Preview & URL */}
              <div className="form-row-2">
                <label>
                  Đường dẫn Logo URL (hoặc dữ liệu ảnh) *
                  <input
                    type="text"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="Dán link ảnh hoặc chọn từ máy tính"
                    required
                  />
                </label>

                {/* Live Preview Box */}
                <div className="logo-preview-box">
                  <span className="preview-lbl">Xem trước hiển thị Logo:</span>
                  <div className="preview-canvas">
                    {logo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={logo} alt="Preview logo" />
                    ) : (
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>Chưa chọn logo</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Brand Name & Website */}
              <div className="form-row-2">
                <label>
                  Tên thương hiệu / Nhà tài trợ *
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Arawaza Vietnam, Shureido Okinawa, Tân Việt Karatedo..."
                    required
                  />
                </label>

                <label>
                  Website liên kết chính thức
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://arawaza.com"
                  />
                </label>
              </div>

              {/* Category & Tier */}
              <div className="form-row-2">
                <label>
                  Danh mục tài trợ *
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Võ phục & Thiết bị thi đấu chính thức WKF">
                      Võ phục &amp; Thiết bị thi đấu chính thức WKF
                    </option>
                    <option value="Nhà tài trợ Kim Cương (Diamond)">Nhà tài trợ Kim Cương (Diamond)</option>
                    <option value="Nhà tài trợ Vàng (Gold)">Nhà tài trợ Vàng (Gold)</option>
                    <option value="Bảo trợ Nước uống & Y tế Vận động viên">
                      Bảo trợ Nước uống &amp; Y tế Vận động viên
                    </option>
                    <option value="Đối tác Đồng hành & Truyền thông">Đối tác Đồng hành &amp; Truyền thông</option>
                  </select>
                </label>

                <label>
                  Hạng tài trợ (Tier)
                  <select value={tier} onChange={(e) => setTier(e.target.value as SponsorTier)}>
                    <option value="equipment">Thiết bị &amp; Võ phục (WKF Equipment)</option>
                    <option value="diamond">Kim Cương (Diamond)</option>
                    <option value="gold">Vàng (Gold)</option>
                    <option value="silver">Bạc (Silver)</option>
                    <option value="beverage">Nước uống &amp; Dinh dưỡng</option>
                    <option value="media">Truyền thông</option>
                  </select>
                </label>
              </div>

              <label>
                Mô tả ngắn quyền lợi / cam kết
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Đơn vị cung cấp trang phục thi đấu đạt chuẩn WKF cho giải..."
                  rows={2}
                />
              </label>

              <div className="placements-selector">
                <span>Vị trí hiển thị trên Cổng K-SPORT:</span>
                <div className="checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={placements.includes("home")}
                      onChange={() => togglePlacement("home")}
                    />
                    <strong>Trang chủ (Khối Đối Tác WKF)</strong>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={placements.includes("footer")}
                      onChange={() => togglePlacement("footer")}
                    />
                    Chân trang (Footer)
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={placements.includes("event")}
                      onChange={() => togglePlacement("event")}
                    />
                    Trang Chi tiết Giải đấu
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={placements.includes("tatami")}
                      onChange={() => togglePlacement("tatami")}
                    />
                    Backdrop Thảm đấu Tatami Live
                  </label>
                </div>
              </div>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <strong>Kích hoạt hiển thị ngay lập tức trên website</strong>
              </label>

              <div className="admin-modal-actions">
                <button type="button" className="button ghost" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="button red">
                  {editingItem ? "Lưu thay đổi" : "Thêm đối tác"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-confirm-box">
            <div className="confirm-icon-wrap red">🗑️</div>
            <h3>Xác nhận xóa đối tác?</h3>
            <p>
              Bạn có chắc chắn muốn xóa đối tác <strong>&quot;{deletingItem.name}&quot;</strong>? Hành động này sẽ gỡ logo thương hiệu khỏi Trang chủ và website.
            </p>
            <div className="admin-confirm-actions">
              <button
                type="button"
                className="button ghost"
                onClick={() => setDeletingItem(null)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="button red"
                onClick={executeDelete}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
