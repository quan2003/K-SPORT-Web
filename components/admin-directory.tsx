"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import type { EventItem, AdminUserItem } from "@/lib/admin-store";

type DirectoryKind = "events" | "users";

const roleMeta: Record<AdminUserItem["role"], { label: string; scope: string }> = {
  admin: { label: "Quản trị hệ thống", scope: "Toàn hệ thống" },
  btc: { label: "Ban Tổ Chức (BTC)", scope: "Giải đấu được phân công" },
  editor: { label: "Ban Truyền thông", scope: "Nội dung & Truyền thông" },
};

export function AdminDirectory({ kind }: { kind: DirectoryKind }) {
  const isEvents = kind === "events";
  const [events, setEvents] = useState<EventItem[]>([]);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<{ id: string; name: string } | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states for Events
  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventRegistrations, setEventRegistrations] = useState(150);
  const [eventStatus, setEventStatus] = useState<EventItem["status"]>("Mở đăng ký");

  // Form states for Users
  const [username, setUsername] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<AdminUserItem["role"]>("btc");
  const [assignedTournament, setAssignedTournament] = useState("Giải vô địch các CLB Karate tỉnh Phú Thọ năm 2026");

  const fetchData = useCallback(async () => {
    try {
      const url = isEvents ? "/api/admin/events" : "/api/admin/users";
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (res.ok && Array.isArray(data.items)) {
        if (isEvents) setEvents(data.items);
        else setUsers(data.items);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [isEvents]);

  useEffect(() => {
    let isCancelled = false;
    const url = isEvents ? "/api/admin/events" : "/api/admin/users";
    fetch(url, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && Array.isArray(data.items)) {
          if (isEvents) setEvents(data.items);
          else setUsers(data.items);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });
    return () => {
      isCancelled = true;
    };
  }, [isEvents]);

  function notify(type: "success" | "error", text: string) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleCreateEvent(e: FormEvent) {
    e.preventDefault();
    if (!eventName.trim() || !eventLocation.trim()) {
      notify("error", "Vui lòng nhập tên giải đấu và địa điểm");
      return;
    }

    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eventName.trim(),
          location: eventLocation.trim(),
          date: eventDate.trim() || "Tháng 12/2026",
          registrations: Number(eventRegistrations) || 0,
          status: eventStatus,
        }),
      });

      if (!res.ok) throw new Error("Không thể tạo giải đấu");
      notify("success", "Tạo giải đấu mới thành công");
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Lỗi tạo giải");
    }
  }

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !userName.trim()) {
      notify("error", "Vui lòng nhập đầy đủ tên đăng nhập và họ tên");
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          name: userName.trim(),
          email: userEmail.trim() || `${username.trim()}@k-sport.net`,
          role: userRole,
          assignedTournament: userRole === "btc" ? assignedTournament : undefined,
          status: "Hoạt động",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Không thể tạo tài khoản");
      }

      notify("success", `Tạo tài khoản ${userRole.toUpperCase()} thành công`);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Lỗi tạo tài khoản");
    }
  }

  function promptDeleteUser(id: string, name: string) {
    setDeletingUser({ id, name });
  }

  async function executeDeleteUser() {
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
    } catch {
      notify("error", "Lỗi xóa người dùng");
    }
  }

  return (
    <section className="admin-directory" aria-labelledby="admin-directory-heading">
      {toast && (
        <div className={`admin-toast ${toast.type}`} role="alert">
          <p>{toast.text}</p>
        </div>
      )}

      <div className="admin-title">
        <h1 id="admin-directory-heading">{isEvents ? "Quản lý Giải đấu Karate" : "Người dùng & Phân quyền"}</h1>
        <p>
          {isEvents
            ? "Theo dõi trạng thái tổ chức, lịch thi đấu và số lượng VĐV đăng ký tham dự các giải."
            : "Quản lý tài khoản và phạm vi truy cập cho quản trị hệ thống, Ban Tổ Chức, trọng tài và biên tập viên."}
        </p>
      </div>

      <div className="admin-directory-header">
        <div>
          <h2>{isEvents ? "Danh sách Giải đấu" : "Danh sách Tài khoản Quản trị & BTC"}</h2>
          <p>
            {isEvents ? `${events.length} giải đấu trong hệ thống` : `${users.length} tài khoản đang phân quyền`}
          </p>
        </div>
        <button
          className="button red"
          type="button"
          onClick={() => {
            if (isEvents) {
              setEventName("");
              setEventLocation("");
              setEventDate("");
              setEventRegistrations(120);
              setEventStatus("Mở đăng ký");
            } else {
              setUsername("");
              setUserName("");
              setUserEmail("");
              setUserRole("btc");
            }
            setIsModalOpen(true);
          }}
        >
          {isEvents ? "+ Tạo giải đấu mới" : "+ Thêm tài khoản"}
        </button>
      </div>

      {isEvents ? (
        <div className="admin-table-wrap">
          <table className="admin-directory-table">
            <thead>
              <tr>
                <th scope="col">Giải đấu</th>
                <th scope="col">Thời gian &amp; Địa điểm</th>
                <th scope="col" className="num">VĐV Đăng ký</th>
                <th scope="col">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: "center", padding: "24px" }}>Đang tải danh sách giải đấu...</td></tr>
              ) : events.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                    {row.organizer && <small style={{ color: "#64748b" }}>{row.organizer}</small>}
                  </td>
                  <td>
                    <span>{row.date}</span>
                    <small>{row.location}</small>
                  </td>
                  <td className="num">
                    <strong>{row.registrations}</strong> VĐV
                  </td>
                  <td>
                    <span
                      className={`admin-status ${
                        row.status === "Đang diễn ra"
                          ? "is-live"
                          : row.status === "Mở đăng ký"
                          ? "is-live"
                          : "is-draft"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-directory-table">
            <thead>
              <tr>
                <th scope="col">Tài khoản &amp; Họ tên</th>
                <th scope="col">Vai trò (Role)</th>
                <th scope="col">Phạm vi truy cập</th>
                <th scope="col">Hoạt động gần nhất</th>
                <th scope="col">Trạng thái</th>
                <th scope="col" style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "24px" }}>Đang tải danh sách người dùng...</td></tr>
              ) : users.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                    <code style={{ display: "block", color: "#64748b", fontSize: "12px" }}>@{row.username}</code>
                  </td>
                  <td>
                    <span className={`role-badge ${row.role}`}>{roleMeta[row.role].label}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: "13px" }}>{row.assignedTournament || roleMeta[row.role].scope}</span>
                  </td>
                  <td>{row.lastActive}</td>
                  <td>
                    <span className={`admin-status ${row.status === "Hoạt động" ? "is-live" : "is-draft"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {row.role !== "admin" ? (
                      <button
                        type="button"
                        onClick={() => promptDeleteUser(row.id, row.name)}
                        style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                      >
                        Xóa
                      </button>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "12px" }}>Mặc định</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3>{isEvents ? "Tạo giải đấu Karate mới" : "Thêm tài khoản & Cấp quyền BTC"}</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            {isEvents ? (
              <form onSubmit={handleCreateEvent} className="admin-modal-form">
                <label>
                  Tên giải đấu *
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Ví dụ: Giải vô địch Karate các CLB toàn quốc 2026"
                    required
                  />
                </label>
                <label>
                  Địa điểm tổ chức *
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Ví dụ: Nhà thi đấu TDTT tỉnh Phú Thọ"
                    required
                  />
                </label>
                <div className="form-row-2">
                  <label>
                    Thời gian diễn ra
                    <input
                      type="text"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      placeholder="Ví dụ: 08/11/2026 - 10/11/2026"
                    />
                  </label>
                  <label>
                    Trạng thái
                    <select
                      value={eventStatus}
                      onChange={(e) => setEventStatus(e.target.value as EventItem["status"])}
                    >
                      <option value="Mở đăng ký">Mở đăng ký</option>
                      <option value="Đang diễn ra">Đang diễn ra</option>
                      <option value="Sắp diễn ra">Sắp diễn ra</option>
                      <option value="Đã kết thúc">Đã kết thúc</option>
                    </select>
                  </label>
                </div>
                <div className="admin-modal-actions">
                  <button type="button" className="button ghost" onClick={() => setIsModalOpen(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="button red">
                    Tạo giải đấu
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateUser} className="admin-modal-form">
                <label>
                  Tên đăng nhập (Username) *
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ví dụ: btc-danang2026"
                    required
                  />
                </label>
                <label>
                  Họ và tên người dùng / Đơn vị *
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Ví dụ: Ban Tổ Chức Karate Đà Nẵng 2026"
                    required
                  />
                </label>
                <div className="form-row-2">
                  <label>
                    Vai trò (Role) *
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value as AdminUserItem["role"])}
                    >
                      <option value="btc">Ban Tổ Chức (BTC) — thống kê và vận hành giải được phân công</option>
                      <option value="editor">Ban Truyền thông — nội dung &amp; bài viết công khai</option>
                      <option value="admin">Quản trị hệ thống — toàn quyền</option>
                    </select>
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="btc@k-sport.net"
                    />
                  </label>
                </div>

                {userRole === "btc" && (
                  <label>
                    Giải đấu được phân quyền phụ trách
                    <select
                      value={assignedTournament}
                      onChange={(e) => setAssignedTournament(e.target.value)}
                    >
                      <option value="Giải vô địch các CLB Karate tỉnh Phú Thọ năm 2026">
                        Giải vô địch các CLB Karate tỉnh Phú Thọ năm 2026
                      </option>
                      <option value="Cúp các CLB Karate mạnh toàn quốc 2026">
                        Cúp các CLB Karate mạnh toàn quốc 2026
                      </option>
                    </select>
                  </label>
                )}

                <div className="admin-modal-actions">
                  <button type="button" className="button ghost" onClick={() => setIsModalOpen(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="button red">
                    Tạo tài khoản
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG (Replaces ugly browser window.confirm) */}
      {deletingUser && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-confirm-box">
            <div className="confirm-icon-wrap red">🗑️</div>
            <h3>Xác nhận xóa tài khoản?</h3>
            <p>
              Bạn có chắc chắn muốn xóa tài khoản <strong>&quot;{deletingUser.name}&quot;</strong> khỏi hệ thống K-SPORT?
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
                onClick={executeDeleteUser}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
