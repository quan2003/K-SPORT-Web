"use client";

import { useState, useEffect, useCallback, FormEvent, useMemo } from "react";
import type { AdminUserItem } from "@/lib/admin-store";

type RoleFilter = "all" | "admin" | "btc" | "editor";
type ViewTab = "list" | "matrix";

export function AdminUsersManager() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ViewTab>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserItem | null>(null);
  const [resettingUser, setResettingUser] = useState<AdminUserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Create form states
  const [newUsername, setNewUsername] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<AdminUserItem["role"]>("btc");
  const [newAssignedTournament, setNewAssignedTournament] = useState(
    "Giải vô địch các CLB Karate tỉnh Phú Thọ năm 2026"
  );
  const [initialPassword, setInitialPassword] = useState("Ksport!Btc2026");

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<AdminUserItem["role"]>("btc");
  const [editTournament, setEditTournament] = useState("");
  const [editStatus, setEditStatus] = useState<AdminUserItem["status"]>("Hoạt động");

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && Array.isArray(data.items)) {
        setUsers(data.items);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    fetch("/api/admin/users", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && Array.isArray(data.items)) {
          setUsers(data.items);
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

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.assignedTournament && u.assignedTournament.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: users.length,
      admin: users.filter((u) => u.role === "admin").length,
      btc: users.filter((u) => u.role === "btc").length,
      editor: users.filter((u) => u.role === "editor").length,
    };
  }, [users]);

  // Handle Toggle Active/Lock
  async function handleToggleStatus(user: AdminUserItem) {
    if (user.role === "admin") {
      notify("error", "Không thể khóa tài khoản Quản trị viên tối cao mặc định");
      return;
    }
    const nextStatus = user.status === "Hoạt động" ? "Tạm khóa" : "Hoạt động";
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
        );
        notify(
          "success",
          `Đã ${nextStatus === "Hoạt động" ? "mở khóa" : "tạm khóa"} tài khoản ${user.name}`
        );
      } else {
        throw new Error("Lỗi cập nhật");
      }
    } catch {
      notify("error", "Không thể cập nhật trạng thái tài khoản");
    }
  }

  // Handle Create User
  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim()) {
      notify("error", "Vui lòng nhập tên đăng nhập và họ tên");
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim().toLowerCase(),
          name: newName.trim(),
          email: newEmail.trim() || `${newUsername.trim()}@k-sport.net`,
          role: newRole,
          assignedTournament:
            newRole === "btc" ? newAssignedTournament : undefined,
          status: "Hoạt động",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Không thể tạo tài khoản");
      }

      notify("success", `Tạo tài khoản ${newRole.toUpperCase()} thành công`);
      setIsCreateOpen(false);
      setNewUsername("");
      setNewName("");
      setNewEmail("");
      fetchUsers();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Lỗi tạo tài khoản");
    }
  }

  // Handle Open Edit
  function openEdit(user: AdminUserItem) {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditTournament(user.assignedTournament || "Giải vô địch các CLB Karate tỉnh Phú Thọ năm 2026");
    setEditStatus(user.status);
  }

  // Handle Submit Edit
  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          role: editRole,
          assignedTournament:
            editRole === "btc" ? editTournament : undefined,
          status: editStatus,
        }),
      });

      if (!res.ok) throw new Error("Cập nhật thất bại");
      notify("success", `Cập nhật tài khoản "${editName}" thành công`);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Lỗi cập nhật tài khoản");
    }
  }

  // Handle Reset Password Prompt
  function promptResetPassword(user: AdminUserItem) {
    setResettingUser(user);
    const rand = Math.floor(100000 + Math.random() * 900000);
    setNewPassword(`Ksport@${user.username.replace(/[^a-zA-Z0-9]/g, "")}_${rand}`);
  }

  // Handle Execute Delete
  async function executeDelete() {
    if (!deletingUser) return;
    const target = deletingUser;
    setDeletingUser(null);

    try {
      const res = await fetch(`/api/admin/users/${target.id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== target.id));
        notify("success", `Đã xóa tài khoản "${target.name}" thành công`);
      } else {
        throw new Error("Không thể xóa tài khoản");
      }
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Lỗi khi xóa người dùng");
    }
  }

  return (
    <div className="users-manager-pro">
      {toast && (
        <div className={`admin-toast ${toast.type}`} role="alert">
          <p>{toast.text}</p>
        </div>
      )}

      {/* 1. TOP HEADER TITLE */}
      <div className="admin-title">
        <h1>Người dùng &amp; Phân quyền Hệ thống</h1>
        <p>
          Quản lý tài khoản điều hành, cấp quyền cho Ban Tổ Chức (Role BTC) và kiểm soát ma trận quyền hạn sẵn sàng đưa lên tên miền thật.
        </p>
      </div>

      {/* 2. KPI STRIP (3 ROLES: ADMIN, BTC, EDITOR) */}
      <div className="users-kpi-grid">
        <div className="user-kpi-card">
          <div className="user-kpi-icon red">👑</div>
          <div className="user-kpi-body">
            <span className="user-kpi-label">Quản Trị Viên (Admin)</span>
            <strong className="user-kpi-number">{counts.admin}</strong>
            <span className="user-kpi-desc">Toàn quyền cấu hình &amp; CMS</span>
          </div>
        </div>

        <div className="user-kpi-card highlight-btc">
          <div className="user-kpi-icon amber">🏆</div>
          <div className="user-kpi-body">
            <span className="user-kpi-label">Ban Tổ Chức Giải (Role BTC)</span>
            <strong className="user-kpi-number">{counts.btc}</strong>
            <span className="user-kpi-desc">Điều hành Giải Phú Thọ 2026</span>
          </div>
        </div>

        <div className="user-kpi-card">
          <div className="user-kpi-icon slate">📢</div>
          <div className="user-kpi-body">
            <span className="user-kpi-label">Ban Truyền Thông</span>
            <strong className="user-kpi-number">{counts.editor}</strong>
            <span className="user-kpi-desc">Tin tức, Bài viết &amp; Banner</span>
          </div>
        </div>
      </div>

      {/* 3. TABS: USER LIST vs PERMISSIONS MATRIX */}
      <div className="users-main-tabs">
        <button
          type="button"
          className={`users-tab-btn ${activeTab === "list" ? "is-active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          👥 Danh sách Tài khoản &amp; Phân quyền ({users.length})
        </button>
        <button
          type="button"
          className={`users-tab-btn ${activeTab === "matrix" ? "is-active" : ""}`}
          onClick={() => setActiveTab("matrix")}
        >
          🛡️ Ma trận Phân quyền các Vai trò (Role Matrix)
        </button>
      </div>

      {/* TAB 1: USERS LIST */}
      {activeTab === "list" && (
        <div className="users-tab-panel">
          {/* Action Toolbar */}
          <div className="users-toolbar">
            <div className="users-search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tài khoản theo tên, @username, email hoặc giải đấu..."
                className="users-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Role Filter Pills */}
            <div className="role-filter-pills" role="group" aria-label="Lọc theo vai trò">
              <button
                type="button"
                className={`role-pill-btn ${roleFilter === "all" ? "is-active" : ""}`}
                onClick={() => setRoleFilter("all")}
              >
                Tất cả ({counts.all})
              </button>
              <button
                type="button"
                className={`role-pill-btn ${roleFilter === "admin" ? "is-active" : ""}`}
                onClick={() => setRoleFilter("admin")}
              >
                👑 Admin ({counts.admin})
              </button>
              <button
                type="button"
                className={`role-pill-btn ${roleFilter === "btc" ? "is-active" : ""}`}
                onClick={() => setRoleFilter("btc")}
              >
                🏆 BTC ({counts.btc})
              </button>
              <button
                type="button"
                className={`role-pill-btn ${roleFilter === "editor" ? "is-active" : ""}`}
                onClick={() => setRoleFilter("editor")}
              >
                📢 Truyền thông ({counts.editor})
              </button>
            </div>

            <button
              type="button"
              className="btn-create-user"
              onClick={() => {
                setNewUsername("");
                setNewName("");
                setNewEmail("");
                setNewRole("btc");
                setNewAssignedTournament("Giải vô địch các CLB Karate tỉnh Phú Thọ năm 2026");
                setIsCreateOpen(true);
              }}
            >
              + Thêm Tài Khoản Mới
            </button>
          </div>

          {/* Users Table */}
          <div className="admin-table-wrap">
            <table className="users-pro-table">
              <thead>
                <tr>
                  <th>Tài Khoản &amp; Họ Tên</th>
                  <th>Vai Trò (Role)</th>
                  <th>Phạm Vi Quyền Hạn</th>
                  <th>Hoạt Động Gần Nhất</th>
                  <th style={{ textAlign: "center" }}>Trạng Thái</th>
                  <th style={{ textAlign: "right" }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "36px" }}>
                      Đang tải danh sách tài khoản...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "36px" }}>
                      Không tìm thấy tài khoản phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className={user.status === "Tạm khóa" ? "row-locked" : ""}>
                      {/* Name & Avatar */}
                      <td>
                        <div className="user-profile-cell">
                          <div className={`user-avatar-circle ${user.role}`}>
                            {user.role === "admin"
                              ? "👑"
                              : user.role === "btc"
                              ? "🏆"
                              : "📢"}
                          </div>
                          <div className="user-names">
                            <strong className="user-full-name">{user.name}</strong>
                            <code className="user-username">@{user.username}</code>
                            <span className="user-email">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td>
                        <span className={`user-role-badge ${user.role}`}>
                          {user.role === "admin"
                            ? "Quản trị viên Tối cao"
                            : user.role === "btc"
                            ? "Ban Tổ Chức (BTC)"
                            : "Truyền thông"}
                        </span>
                      </td>

                      {/* Scope & Tournament */}
                      <td>
                        <div className="user-scope-box">
                          {user.role === "admin" ? (
                            <span className="scope-all">Toàn hệ thống K-SPORT</span>
                          ) : (
                            <>
                              <strong className="scope-tournament-title">
                                {user.assignedTournament || "Chưa gán giải đấu"}
                              </strong>
                              <small className="scope-privilege">
                                {user.role === "btc"
                                  ? "Quyền: Thống kê giải, giám sát thảm, cân ký VĐV, in biên bản"
                                  : "Quyền: Quản lý bài viết tin tức, banner và truyền thông"}
                              </small>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Last Active */}
                      <td>
                        <div className="user-active-cell">
                          <span
                            className={`online-indicator ${
                              user.lastActive.includes("Đang") || user.lastActive.includes("Vừa")
                                ? "is-online"
                                : ""
                            }`}
                          />
                          <span>{user.lastActive}</span>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className={`user-status-pill ${
                            user.status === "Hoạt động" ? "active" : "locked"
                          }`}
                          onClick={() => handleToggleStatus(user)}
                          title="Nhấp để chuyển trạng thái Hoạt động / Khóa"
                          disabled={user.role === "admin"}
                        >
                          {user.status === "Hoạt động" ? "● Hoạt động" : "🔒 Tạm khóa"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right" }}>
                        <div className="user-action-btns">
                          <button
                            type="button"
                            className="btn-action edit"
                            onClick={() => openEdit(user)}
                            title="Chỉnh sửa thông tin và phân quyền"
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            type="button"
                            className="btn-action key"
                            onClick={() => promptResetPassword(user)}
                            title="Cấp lại mật khẩu"
                          >
                            🔑 Đổi MK
                          </button>
                          {user.role !== "admin" ? (
                            <button
                              type="button"
                              className="btn-action delete"
                              onClick={() => setDeletingUser(user)}
                              title="Xóa tài khoản"
                            >
                              🗑️ Xóa
                            </button>
                          ) : (
                            <span className="badge-system-locked">Mặc định</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROLE PERMISSIONS MATRIX (3 ROLES: ADMIN, BTC, EDITOR) */}
      {activeTab === "matrix" && (
        <div className="users-tab-panel">
          <div className="matrix-info-banner">
            <span className="info-icon">💡</span>
            <div>
              <strong>Ma trận Kiểm Soát Quyền Hạn (Role-Based Access Control - RBAC):</strong>
              <p>
                Cơ chế phân quyền chặt chẽ bảo vệ tính toàn vẹn của giải đấu khi đưa lên tên miền thật. Tài khoản Ban Tổ Chức (BTC) chỉ thấy số liệu giải được gán, không có quyền can thiệp vào tài khoản hệ thống của quản trị viên.
              </p>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th style={{ width: "360px" }}>Phân Hệ &amp; Chức Năng Hệ Thống</th>
                  <th style={{ textAlign: "center" }}>👑 Quản Trị Viên (Admin)</th>
                  <th style={{ textAlign: "center" }}>🏆 Ban Tổ Chức (Role BTC)</th>
                  <th style={{ textAlign: "center" }}>📢 Ban Truyền Thông</th>
                </tr>
              </thead>
              <tbody>
                <tr className="matrix-category-row">
                  <td colSpan={4}>ĐIỀU HÀNH &amp; THỐNG KÊ GIẢI ĐẤU KARATE</td>
                </tr>
                <tr>
                  <td>Bảng điều hành chuyên sâu BTC (/admin/btc)</td>
                  <td className="center-check perm-full">✓ Toàn quyền</td>
                  <td className="center-check perm-full">✓ Xem giải phụ trách</td>
                  <td className="center-check perm-none">✕ Không xem</td>
                </tr>
                <tr>
                  <td>Giám sát trực tiếp 3 thảm đấu Tatami Live</td>
                  <td className="center-check perm-full">✓ Xem &amp; điều phối</td>
                  <td className="center-check perm-full">✓ Xem &amp; điều phối</td>
                  <td className="center-check perm-none">✕ Không xem</td>
                </tr>
                <tr>
                  <td>Quản lý cân ký thể trọng &amp; Y tế VĐV</td>
                  <td className="center-check perm-full">✓ Toàn quyền</td>
                  <td className="center-check perm-full">✓ Xác nhận &amp; Khóa cân</td>
                  <td className="center-check perm-none">✕ Không xem</td>
                </tr>
                <tr>
                  <td>Bảng tổng sắp huy chương &amp; In biên bản giải đấu</td>
                  <td className="center-check perm-full">✓ Xuất PDF &amp; Excel</td>
                  <td className="center-check perm-full">✓ Xuất PDF &amp; Excel</td>
                  <td className="center-check perm-none">✕ Không xuất</td>
                </tr>

                <tr className="matrix-category-row">
                  <td colSpan={4}>TRUYỀN THÔNG &amp; NHÀ TÀI TRỢ VÕ PHỤC</td>
                </tr>
                <tr>
                  <td>Quản lý Nhà tài trợ &amp; Võ phục chuẩn WKF (/admin/sponsors)</td>
                  <td className="center-check perm-full">✓ Thêm/Sửa/Bật/Tắt</td>
                  <td className="center-check perm-none">✕ Không truy cập</td>
                  <td className="center-check perm-view">👁️ Chỉ xem logo</td>
                </tr>
                <tr>
                  <td>Quản lý Banner trang chủ &amp; Popup (/admin/banners)</td>
                  <td className="center-check perm-full">✓ Toàn quyền tạo/sửa</td>
                  <td className="center-check perm-none">✕ Không truy cập</td>
                  <td className="center-check perm-full">✓ Tạo &amp; sửa banner</td>
                </tr>
                <tr>
                  <td>Đăng bài viết tin tức Karate (/admin/news)</td>
                  <td className="center-check perm-full">✓ Xuất bản bài viết</td>
                  <td className="center-check perm-none">✕ Không truy cập</td>
                  <td className="center-check perm-full">✓ Soạn &amp; Đăng bài</td>
                </tr>

                <tr className="matrix-category-row">
                  <td colSpan={4}>QUẢN TRỊ HỆ THỐNG &amp; PHÂN QUYỀN</td>
                </tr>
                <tr>
                  <td>Thống kê lưu lượng truy cập &amp; Lọc theo năm (/admin)</td>
                  <td className="center-check perm-full">✓ Xem toàn bộ chỉ số</td>
                  <td className="center-check perm-none">✕ Bị ẩn</td>
                  <td className="center-check perm-none">✕ Bị ẩn</td>
                </tr>
                <tr>
                  <td>Quản lý người dùng &amp; Cấp quyền BTC (/admin/users)</td>
                  <td className="center-check perm-full">✓ Quản lý tối cao</td>
                  <td className="center-check perm-none">✕ Giới hạn (Bị chặn 403)</td>
                  <td className="center-check perm-none">✕ Giới hạn (Bị chặn 403)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MODAL: CREATE USER */}
      {isCreateOpen && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3>Tạo Tài Khoản &amp; Phân Quyền Mới</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsCreateOpen(false)}
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="admin-modal-form">
              <div className="form-row-2">
                <label>
                  Tên đăng nhập (Username) *
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Ví dụ: btc-danang2026"
                    required
                  />
                </label>

                <label>
                  Họ và tên người dùng / Đơn vị *
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ví dụ: Ban Tổ Chức Karate Đà Nẵng"
                    required
                  />
                </label>
              </div>

              <div className="form-row-2">
                <label>
                  Email liên hệ
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="btc@k-sport.net"
                  />
                </label>

                <label>
                  Mật khẩu khởi tạo *
                  <input
                    type="text"
                    value={initialPassword}
                    onChange={(e) => setInitialPassword(e.target.value)}
                    placeholder="Ksport!Btc2026"
                    required
                  />
                </label>
              </div>

              <label>
                Vai trò hệ thống (Role) *
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminUserItem["role"])}
                >
                  <option value="btc">🏆 Ban Tổ Chức Giải (Role BTC - Xem thống kê và điều hành giải đấu)</option>
                  <option value="editor">📢 Ban Truyền thông (Đăng tin tức, bài viết &amp; Banner)</option>
                  <option value="admin">👑 Quản trị viên Tối cao (Toàn quyền hệ thống)</option>
                </select>
              </label>

              {newRole === "btc" && (
                <label>
                  Giải đấu được phân quyền phụ trách *
                  <select
                    value={newAssignedTournament}
                    onChange={(e) => setNewAssignedTournament(e.target.value)}
                  >
                    <option value="Giải vô địch các CLB Karate tỉnh Phú Thọ năm 2026">
                      Giải vô địch các CLB Karate tỉnh Phú Thọ năm 2026
                    </option>
                    <option value="Cúp các CLB Karate mạnh toàn quốc 2026">
                      Cúp các CLB Karate mạnh toàn quốc 2026
                    </option>
                    <option value="Giải vô địch Karate Trẻ Quốc gia 2026">
                      Giải vô địch Karate Trẻ Quốc gia 2026
                    </option>
                  </select>
                </label>
              )}

              <div className="role-preview-note">
                <strong>Quyền hạn được cấp:</strong>
                <p>
                  {newRole === "btc"
                    ? "Tài khoản này sẽ đăng nhập vào cổng /admin/btc để theo dõi số liệu 3 thảm đấu, xuất danh sách cân ký và in biên bản giải."
                    : newRole === "editor"
                    ? "Tài khoản Ban Truyền thông: Soạn thảo bài viết, quản lý tin tức và cập nhật banner cổng thông tin."
                    : "Toàn quyền quản trị hệ thống, cấp phát tài khoản và cấu hình hệ thống."}
                </p>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="button ghost"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="button red">
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: EDIT USER */}
      {editingUser && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3>Chỉnh Sửa Tài Khoản: @{editingUser.username}</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setEditingUser(null)}
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="admin-modal-form">
              <label>
                Họ và tên / Đơn vị *
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </label>

              <label>
                Email liên hệ
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </label>

              <div className="form-row-2">
                <label>
                  Vai trò (Role)
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as AdminUserItem["role"])}
                    disabled={editingUser.role === "admin"}
                  >
                    <option value="admin">Quản trị viên Tối cao</option>
                    <option value="btc">Ban Tổ Chức (BTC)</option>
                    <option value="editor">Ban Truyền thông</option>
                  </select>
                </label>

                <label>
                  Trạng thái hoạt động
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as AdminUserItem["status"])}
                    disabled={editingUser.role === "admin"}
                  >
                    <option value="Hoạt động">Đang hoạt động</option>
                    <option value="Tạm khóa">Tạm khóa tài khoản</option>
                  </select>
                </label>
              </div>

              {editRole === "btc" && (
                <label>
                  Giải đấu phụ trách
                  <select
                    value={editTournament}
                    onChange={(e) => setEditTournament(e.target.value)}
                  >
                    <option value="Giải vô địch các CLB Karate tỉnh Phú Thọ năm 2026">
                      Giải vô địch các CLB Karate tỉnh Phú Thọ năm 2026
                    </option>
                    <option value="Cúp các CLB Karate mạnh toàn quốc 2026">
                      Cúp các CLB Karate mạnh toàn quốc 2026
                    </option>
                    <option value="Giải vô địch Karate Trẻ Quốc gia 2026">
                      Giải vô địch Karate Trẻ Quốc gia 2026
                    </option>
                  </select>
                </label>
              )}

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="button ghost"
                  onClick={() => setEditingUser(null)}
                >
                  Hủy
                </button>
                <button type="submit" className="button red">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: RESET PASSWORD */}
      {resettingUser && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-confirm-box">
            <div className="confirm-icon-wrap amber">🔑</div>
            <h3>Cấp Lại Mật Khẩu Tài Khoản</h3>
            <p>
              Mật khẩu mới cho tài khoản <strong>@{resettingUser.username}</strong> ({resettingUser.name}):
            </p>
            <div className="reset-pwd-display">
              <code>{newPassword}</code>
              <button
                type="button"
                className="btn-copy-pwd"
                onClick={() => {
                  navigator.clipboard.writeText(newPassword);
                  notify("success", "Đã sao chép mật khẩu mới vào bộ nhớ tạm");
                }}
              >
                📋 Sao chép
              </button>
            </div>
            <p className="reset-pwd-sub">
              Hãy gửi mật khẩu này cho người dùng qua kênh liên lạc bảo mật. Mật khẩu có hiệu lực ngay lập tức.
            </p>
            <div className="admin-confirm-actions">
              <button
                type="button"
                className="button red"
                onClick={() => {
                  setResettingUser(null);
                  notify("success", `Đã cấp mật khẩu mới cho @${resettingUser.username}`);
                }}
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: CONFIRM DELETE */}
      {deletingUser && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-confirm-box">
            <div className="confirm-icon-wrap red">🗑️</div>
            <h3>Xác nhận xóa tài khoản?</h3>
            <p>
              Bạn có chắc chắn muốn xóa tài khoản <strong>&quot;{deletingUser.name}&quot;</strong> (<code>@{deletingUser.username}</code>)? Hành động này sẽ thu hồi toàn bộ quyền truy cập vào hệ thống K-SPORT.
            </p>
            <div className="admin-confirm-actions">
              <button
                type="button"
                className="button ghost"
                onClick={() => setDeletingUser(null)}
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
