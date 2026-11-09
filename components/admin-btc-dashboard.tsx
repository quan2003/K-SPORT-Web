"use client";

import { useState } from "react";
import type { PublicSession } from "@/lib/auth";

type BtcTab = "overview" | "tatami" | "weighin" | "medals" | "referees" | "export";

export function AdminBtcDashboard({ session }: { session: PublicSession | null }) {
  const [activeTab, setActiveTab] = useState<BtcTab>("overview");
  const [selectedTatami, setSelectedTatami] = useState<number>(1);
  const [exportNotice, setExportNotice] = useState<string>("");

  const isBtcOrAdmin = session?.role === "btc" || session?.role === "admin";

  if (!isBtcOrAdmin) {
    return (
      <div className="btc-forbidden">
        <div className="btc-forbidden-card">
          <span className="btc-forbidden-icon">🔒</span>
          <h2>Khu vực giới hạn Ban Tổ Chức (Role BTC)</h2>
          <p>
            Tài khoản hiện tại ({session?.name || "Người dùng"}) không có quyền truy cập dữ liệu thống kê mật của Ban Tổ Chức giải.
          </p>
          <a href="/admin" className="button red">Quay lại Tổng quan Admin</a>
        </div>
      </div>
    );
  }

  function handleExport(type: string) {
    setExportNotice(`Đã tạo ${type} thành công. Hệ thống đang chuẩn bị tải tệp...`);
    setTimeout(() => setExportNotice(""), 3500);
  }

  return (
    <div className="btc-portal">
      {/* Tournament Top Banner */}
      <header className="btc-header">
        <div className="btc-header-left">
          <div className="btc-badge-row">
            <span className="btc-status-badge is-live">● Đang diễn ra trực tiếp</span>
            <span className="btc-sub-badge">Phân quyền: Ban Tổ Chức Giải (BTC)</span>
            <span className="btc-sub-badge">Hệ thống K-SPORT v3.0.13</span>
          </div>
          <h1 className="btc-tournament-title">
            Giải vô địch các Câu lạc bộ Karate tỉnh Phú Thọ năm 2026
          </h1>
          <div className="btc-meta-row">
            <span>📅 08/11/2026 - 10/11/2026</span>
            <span>📍 Nhà thi đấu TDTT tỉnh Phú Thọ</span>
            <span>🥋 18 CLB tham dự · 342 VĐV</span>
            <span>⚡ 3 Thảm đấu Tatami điện tử</span>
          </div>
        </div>

        <div className="btc-header-actions">
          <button
            type="button"
            className="btc-action-btn primary"
            onClick={() => handleExport("Biên bản tổng hợp kết quả (PDF)")}
          >
            📄 In biên bản giải
          </button>
          <button
            type="button"
            className="btc-action-btn secondary"
            onClick={() => handleExport("Bảng số liệu VĐV & Thống kê (Excel)")}
          >
            📊 Xuất Excel BTC
          </button>
        </div>
      </header>

      {exportNotice ? (
        <div className="btc-alert-banner" role="status">
          ✓ {exportNotice}
        </div>
      ) : null}

      {/* KPI Overview Grid */}
      <div className="btc-kpi-grid">
        <div className="btc-kpi-card">
          <div className="btc-kpi-icon">👥</div>
          <div className="btc-kpi-content">
            <span className="btc-kpi-label">Tổng số Vận Động Viên</span>
            <strong className="btc-kpi-val">342</strong>
            <span className="btc-kpi-sub">210 Nam (61.4%) · 132 Nữ (38.6%)</span>
          </div>
        </div>

        <div className="btc-kpi-card">
          <div className="btc-kpi-icon">🏛️</div>
          <div className="btc-kpi-content">
            <span className="btc-kpi-label">Đoàn / Câu Lạc Bộ</span>
            <strong className="btc-kpi-val">18</strong>
            <span className="btc-kpi-sub">100% đã hoàn tất điểm danh & thẻ</span>
          </div>
        </div>

        <div className="btc-kpi-card">
          <div className="btc-kpi-icon">🏅</div>
          <div className="btc-kpi-content">
            <span className="btc-kpi-label">Bộ Huy Chương Trao</span>
            <strong className="btc-kpi-val">42</strong>
            <span className="btc-kpi-sub">14 bài Kata · 28 hạng cân Kumite</span>
          </div>
        </div>

        <div className="btc-kpi-card highlight">
          <div className="btc-kpi-icon">⚡</div>
          <div className="btc-kpi-content">
            <span className="btc-kpi-label">Tiến Độ Thi Đấu Hôm Nay</span>
            <strong className="btc-kpi-val">62.8%</strong>
            <span className="btc-kpi-sub">Đã xong 54/86 trận đấu thảm</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="btc-tabs" role="tablist" aria-label="Các mục điều hành BTC">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "overview"}
          className={`btc-tab ${activeTab === "overview" ? "is-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Tổng quan giải đấu
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "tatami"}
          className={`btc-tab ${activeTab === "tatami" ? "is-active" : ""}`}
          onClick={() => setActiveTab("tatami")}
        >
          🥋 Giám sát Thảm đấu (Tatami Live)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "weighin"}
          className={`btc-tab ${activeTab === "weighin" ? "is-active" : ""}`}
          onClick={() => setActiveTab("weighin")}
        >
          ⚖️ Cân ký & Y tế VĐV
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "medals"}
          className={`btc-tab ${activeTab === "medals" ? "is-active" : ""}`}
          onClick={() => setActiveTab("medals")}
        >
          🥇 Bảng tổng sắp huy chương
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "referees"}
          className={`btc-tab ${activeTab === "referees" ? "is-active" : ""}`}
          onClick={() => setActiveTab("referees")}
        >
          👨‍⚖️ Tổ trọng tài & Ban thư ký
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="btc-tab-content">
          <div className="btc-split-view">
            {/* Live Tatami Summary Cards */}
            <div className="btc-section-card">
              <div className="btc-card-header">
                <h3>Trạng thái 3 Thảm đấu hiện tại</h3>
                <span className="btc-live-dot">Trực tiếp thời gian thực</span>
              </div>
              <div className="btc-tatami-cards">
                <div className="btc-tatami-mini is-ongoing">
                  <div className="btc-mini-top">
                    <span className="btc-tatami-tag red">THẢM 1</span>
                    <span className="btc-tatami-status">Đang thi đấu #Trận 25</span>
                  </div>
                  <strong className="btc-match-name">Kumite nam -67kg (Tứ kết)</strong>
                  <div className="btc-athletes-match">
                    <span className="aka">🔴 AKA: Nguyễn Văn A (Phú Thọ) - 4 điểm</span>
                    <span className="ao">🔵 AO: Trần Văn Bình (Quân Đội) - 2 điểm</span>
                  </div>
                  <div className="btc-progress-bar">
                    <div className="btc-progress-fill" style={{ width: "75%" }} />
                  </div>
                  <span className="btc-progress-txt">Hoàn thành 18/24 trận (75%)</span>
                </div>

                <div className="btc-tatami-mini is-ongoing">
                  <div className="btc-mini-top">
                    <span className="btc-tatami-tag blue">THẢM 2</span>
                    <span className="btc-tatami-status">Đang thi đấu #Trận 19</span>
                  </div>
                  <strong className="btc-match-name">Kumite nữ -55kg (Bán kết)</strong>
                  <div className="btc-athletes-match">
                    <span className="aka">🔴 AKA: Ngọc Hân (Lâm Thao) - 1 điểm</span>
                    <span className="ao">🔵 AO: Khánh Linh (Việt Trì) - 0 điểm</span>
                  </div>
                  <div className="btc-progress-bar">
                    <div className="btc-progress-fill" style={{ width: "68%" }} />
                  </div>
                  <span className="btc-progress-txt">Hoàn thành 15/22 trận (68%)</span>
                </div>

                <div className="btc-tatami-mini is-done">
                  <div className="btc-mini-top">
                    <span className="btc-tatami-tag green">THẢM 3</span>
                    <span className="btc-tatami-status">Đã xong nội dung sáng</span>
                  </div>
                  <strong className="btc-match-name">Kata quyền cá nhân & Đồng đội</strong>
                  <div className="btc-athletes-match">
                    <span>🥇 HCV: CLB TP Việt Trì (25.4 điểm)</span>
                    <span>🥈 HCB: CLB Phù Ninh (24.8 điểm)</span>
                  </div>
                  <div className="btc-progress-bar">
                    <div className="btc-progress-fill" style={{ width: "100%" }} />
                  </div>
                  <span className="btc-progress-txt">Hoàn thành 21/21 bài quyền (100%)</span>
                </div>
              </div>
            </div>

            {/* Quick Stats & Alerts */}
            <div className="btc-section-card">
              <div className="btc-card-header">
                <h3>Nhật ký điều hành & Cảnh báo BTC</h3>
              </div>
              <ul className="btc-log-list">
                <li>
                  <span className="btc-log-time">10:15</span>
                  <div className="btc-log-desc">
                    <strong>Trọng tài Thảm 1 yêu cầu Video Review (VAR)</strong>
                    <p>Tình huống đòn chân Jodan Ippon tại giây thứ 42 — Quyết định công nhận 3 điểm cho AKA.</p>
                  </div>
                </li>
                <li>
                  <span className="btc-log-time">09:50</span>
                  <div className="btc-log-desc">
                    <strong>Hoàn thành trao huy chương Kata lứa tuổi 15-17</strong>
                    <p>Tổ thư ký đã cập nhật điểm lên Cổng thông tin & bảng tổng sắp toàn đoàn.</p>
                  </div>
                </li>
                <li>
                  <span className="btc-log-time">08:45</span>
                  <div className="btc-log-desc">
                    <strong>Kiểm tra y tế và trang phục võ phục (Karate-gi)</strong>
                    <p>Nhà tài trợ Arawaza & Tân Việt đã hỗ trợ cấp bù 3 bộ đai Ao đạt chuẩn cho VĐV.</p>
                  </div>
                </li>
                <li>
                  <span className="btc-log-time">08:00</span>
                  <div className="btc-log-desc">
                    <strong>Khai mạc ngày thi đấu thứ 2</strong>
                    <p>Toàn bộ 18 trưởng đoàn đã ký xác nhận biên bản danh sách nhánh đấu.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TATAMI LIVE MONITOR */}
      {activeTab === "tatami" && (
        <div className="btc-tab-content">
          <div className="btc-tatami-selector">
            <span>Chọn thảm điều phối:</span>
            {[1, 2, 3].map((t) => (
              <button
                key={t}
                type="button"
                className={`btc-tatami-btn ${selectedTatami === t ? "is-selected" : ""}`}
                onClick={() => setSelectedTatami(t)}
              >
                Thảm số {t} {t === 1 ? "(Kumite Nam)" : t === 2 ? "(Kumite Nữ)" : "(Kata & Kumite Trẻ)"}
              </button>
            ))}
          </div>

          <div className="btc-tatami-details-box">
            <div className="btc-tatami-details-header">
              <div>
                <h3>Bảng điều khiển kỹ thuật — Thảm {selectedTatami}</h3>
                <p>Kết nối trực tiếp thiết bị bảng điểm điện tử K-SPORT Tatami v3.0</p>
              </div>
              <div className="btc-hardware-status">
                <span className="hardware-dot green">●</span> Bảng LED: Hoạt động · Chuông bấm: Tốt · Camera VAR: Đang ghi hình
              </div>
            </div>

            <div className="btc-tatami-scoreboard-preview">
              <div className="side-aka">
                <span className="side-tag">🔴 AKA (ĐAI ĐỎ)</span>
                <h4>Nguyễn Văn A</h4>
                <p className="side-club">CLB Karate Phú Thọ</p>
                <div className="big-score">4</div>
                <div className="fault-pills">
                  <span className="fault">C1</span>
                  <span className="fault">C2</span>
                </div>
              </div>

              <div className="center-timer">
                <span className="timer-badge">HIỆP 1 · THỜI GIAN CÒN LẠI</span>
                <div className="timer-clock">01:42</div>
                <span className="category-tag">Kumite Nam -67kg</span>
                <div className="scoreboard-actions">
                  <button type="button" className="score-btn">Tạm dừng (Yameto)</button>
                  <button type="button" className="score-btn highlight">Xem lại VAR 🎬</button>
                </div>
              </div>

              <div className="side-ao">
                <span className="side-tag">🔵 AO (ĐAI XANH)</span>
                <h4>Trần Văn Bình</h4>
                <p className="side-club">CLB Karate Quân Đội</p>
                <div className="big-score">2</div>
                <div className="fault-pills">
                  <span className="fault">C1</span>
                </div>
              </div>
            </div>

            <div className="btc-tatami-officials">
              <strong>Tổ trọng tài điều hành Thảm {selectedTatami}:</strong>
              <span>Trọng tài chính: Trịnh Hồng Quân (Quốc gia) · Trọng tài biên 1: Lê Văn Hòa · Trọng tài biên 2: Vũ Thị Mai · Trọng tài biên 3: Phạm Quốc Dũng · Giám sát bàn: Nguyễn Hải Yến</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WEIGH-IN & MEDICAL */}
      {activeTab === "weighin" && (
        <div className="btc-tab-content">
          <div className="btc-section-card">
            <div className="btc-card-header">
              <div>
                <h3>Biên bản cân ký & Kiểm tra y tế Vận động viên</h3>
                <p>Quy chuẩn kiểm tra thể trọng, hồ sơ bảo hiểm và võ phục chuẩn WKF</p>
              </div>
              <button
                type="button"
                className="btc-action-btn secondary"
                onClick={() => handleExport("Danh sách cân ký chính thức")}
              >
                In danh sách cân ký
              </button>
            </div>

            <div className="btc-weighin-summary">
              <div className="weigh-stat">
                <span>Đã kiểm tra thể trọng</span>
                <strong>342 / 342</strong>
                <em>100% hoàn tất</em>
              </div>
              <div className="weigh-stat">
                <span>Đạt chuẩn ngay lần 1</span>
                <strong>337</strong>
                <em>Tỷ lệ 98.5%</em>
              </div>
              <div className="weigh-stat">
                <span>Cân lại lần 2 (Đạt)</span>
                <strong>5</strong>
                <em>Đúng quy định giờ cân</em>
              </div>
              <div className="weigh-stat">
                <span>Vi phạm thể trọng</span>
                <strong>0</strong>
                <em>Không có trường hợp loại</em>
              </div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-content-table">
                <thead>
                  <tr>
                    <th>Mã VĐV</th>
                    <th>Họ và tên</th>
                    <th>Đoàn / Đơn vị</th>
                    <th>Hạng cân thi đấu</th>
                    <th>Cân nặng thực</th>
                    <th>Kiểm tra võ phục</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>VIE0001</code></td>
                    <td><strong>Nguyễn Văn A</strong></td>
                    <td>CLB Karate Phú Thọ</td>
                    <td>Kumite nam -67kg</td>
                    <td><strong>66.4 kg</strong></td>
                    <td>Võ phục Arawaza WKF ✓</td>
                    <td><span className="admin-status is-live">Hợp lệ</span></td>
                  </tr>
                  <tr>
                    <td><code>VIE0002</code></td>
                    <td><strong>Trần Văn Bình</strong></td>
                    <td>CLB Karate Quân Đội</td>
                    <td>Kumite nam -67kg</td>
                    <td><strong>66.8 kg</strong></td>
                    <td>Võ phục Shureido WKF ✓</td>
                    <td><span className="admin-status is-live">Hợp lệ</span></td>
                  </tr>
                  <tr>
                    <td><code>VIE0003</code></td>
                    <td><strong>Lê Hoàng Long</strong></td>
                    <td>CLB Karate Hà Nội</td>
                    <td>Kumite nam -67kg</td>
                    <td><strong>66.1 kg</strong></td>
                    <td>Võ phục Tân Việt WKF ✓</td>
                    <td><span className="admin-status is-live">Hợp lệ</span></td>
                  </tr>
                  <tr>
                    <td><code>VIE0004</code></td>
                    <td><strong>Ngọc Hân</strong></td>
                    <td>CLB Karate Lâm Thao</td>
                    <td>Kumite nữ -55kg</td>
                    <td><strong>54.2 kg</strong></td>
                    <td>Võ phục Tokaido WKF ✓</td>
                    <td><span className="admin-status is-live">Hợp lệ</span></td>
                  </tr>
                  <tr>
                    <td><code>VIE0005</code></td>
                    <td><strong>Khánh Linh</strong></td>
                    <td>CLB Karate TP. Việt Trì</td>
                    <td>Kumite nữ -55kg</td>
                    <td><strong>54.5 kg</strong></td>
                    <td>Võ phục Arawaza WKF ✓</td>
                    <td><span className="admin-status is-live">Hợp lệ</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MEDAL TABLE */}
      {activeTab === "medals" && (
        <div className="btc-tab-content">
          <div className="btc-section-card">
            <div className="btc-card-header">
              <div>
                <h3>Bảng tổng sắp huy chương toàn đoàn (Tạm tính)</h3>
                <p>Cập nhật sau 24 nội dung trao giải đầu tiên</p>
              </div>
              <button
                type="button"
                className="btc-action-btn primary"
                onClick={() => handleExport("Bảng tổng sắp huy chương chính thức")}
              >
                In bảng tổng sắp
              </button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-content-table">
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>Hạng</th>
                    <th>Đoàn / Câu Lạc Bộ</th>
                    <th style={{ textAlign: "center" }}>🥇 Vàng</th>
                    <th style={{ textAlign: "center" }}>🥈 Bạc</th>
                    <th style={{ textAlign: "center" }}>🥉 Đồng</th>
                    <th style={{ textAlign: "center" }}>Tổng HC</th>
                    <th style={{ textAlign: "right" }}>Điểm toàn đoàn</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong className="rank-badge gold">1</strong></td>
                    <td><strong>CLB Karate TP. Việt Trì</strong></td>
                    <td style={{ textAlign: "center", color: "#d97706", fontWeight: "bold" }}>6</td>
                    <td style={{ textAlign: "center", color: "#64748b", fontWeight: "bold" }}>4</td>
                    <td style={{ textAlign: "center", color: "#b45309", fontWeight: "bold" }}>5</td>
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>15</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>142</td>
                  </tr>
                  <tr>
                    <td><strong className="rank-badge silver">2</strong></td>
                    <td><strong>CLB Karate Lâm Thao</strong></td>
                    <td style={{ textAlign: "center", color: "#d97706", fontWeight: "bold" }}>4</td>
                    <td style={{ textAlign: "center", color: "#64748b", fontWeight: "bold" }}>3</td>
                    <td style={{ textAlign: "center", color: "#b45309", fontWeight: "bold" }}>6</td>
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>13</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>118</td>
                  </tr>
                  <tr>
                    <td><strong className="rank-badge bronze">3</strong></td>
                    <td><strong>CLB Karate Phù Ninh</strong></td>
                    <td style={{ textAlign: "center", color: "#d97706", fontWeight: "bold" }}>3</td>
                    <td style={{ textAlign: "center", color: "#64748b", fontWeight: "bold" }}>5</td>
                    <td style={{ textAlign: "center", color: "#b45309", fontWeight: "bold" }}>2</td>
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>10</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>96</td>
                  </tr>
                  <tr>
                    <td><strong>4</strong></td>
                    <td><strong>CLB Karate Quân Đội (Phú Thọ)</strong></td>
                    <td style={{ textAlign: "center" }}>3</td>
                    <td style={{ textAlign: "center" }}>2</td>
                    <td style={{ textAlign: "center" }}>4</td>
                    <td style={{ textAlign: "center" }}>9</td>
                    <td style={{ textAlign: "right" }}>88</td>
                  </tr>
                  <tr>
                    <td><strong>5</strong></td>
                    <td><strong>CLB Karate Thanh Ba</strong></td>
                    <td style={{ textAlign: "center" }}>2</td>
                    <td style={{ textAlign: "center" }}>3</td>
                    <td style={{ textAlign: "center" }}>3</td>
                    <td style={{ textAlign: "center" }}>8</td>
                    <td style={{ textAlign: "right" }}>74</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REFEREES & OFFICIALS */}
      {activeTab === "referees" && (
        <div className="btc-tab-content">
          <div className="btc-section-card">
            <div className="btc-card-header">
              <div>
                <h3>Danh sách Hội đồng Trọng tài & Ban Thư ký Giải</h3>
                <p>18 trọng tài cấp quốc gia và giám sát chuyên môn</p>
              </div>
            </div>

            <div className="btc-referees-grid">
              <div className="referee-card">
                <span className="referee-role-tag gold">Tổng Trọng Tài Trưởng</span>
                <h4>Võ sư Nguyễn Văn Hải</h4>
                <p>Trọng tài WKF Quốc tế · Phụ trách chuyên môn chung</p>
                <div className="referee-meta">Đơn vị: Liên đoàn Karate Việt Nam</div>
              </div>

              <div className="referee-card">
                <span className="referee-role-tag blue">Phó Ban Trọng Tài — Thảm 1</span>
                <h4>Trọng tài Trịnh Hồng Quân</h4>
                <p>Trọng tài Quốc gia cấp 1 · Phụ trách Kumite Nam</p>
                <div className="referee-meta">Đơn vị: Hà Nội</div>
              </div>

              <div className="referee-card">
                <span className="referee-role-tag blue">Phó Ban Trọng Tài — Thảm 2</span>
                <h4>Trọng tài Lê Thị Mai</h4>
                <p>Trọng tài Quốc gia cấp 1 · Phụ trách Kumite Nữ</p>
                <div className="referee-meta">Đơn vị: Phú Thọ</div>
              </div>

              <div className="referee-card">
                <span className="referee-role-tag green">Phụ Trách Kata — Thảm 3</span>
                <h4>Trọng tài Đỗ Minh Tuấn</h4>
                <p>Trọng tài Quốc gia cấp 1 · Chuyên trách chấm điểm Quyền</p>
                <div className="referee-meta">Đơn vị: Quân Đội</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

