import { getMatDisplayName, getMatchDisplayState, type Match } from "@/lib/public-data";

const formatDay = (date: string) =>
  new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${date}T00:00:00+07:00`));

const formatUpdatedAt = (value: Date) =>
  new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }).format(value);

/**
 * Match-day summary shown first when a pass QR code is scanned:
 * which mat, what time, which corner and against whom.
 */
export function AthletePass({
  athleteName,
  athleteCode,
  club,
  focusMatch,
  isLive,
  remainingCount,
  updatedAt,
}: {
  athleteName: string;
  athleteCode: string;
  club: string;
  focusMatch: Match | null;
  isLive: boolean;
  remainingCount: number;
  updatedAt: Date;
}) {
  const normalizedName = athleteName.trim().toLocaleLowerCase("vi");
  const corner = focusMatch ? (focusMatch.red.trim().toLocaleLowerCase("vi") === normalizedName ? "aka" : "ao") : null;
  const opponent = focusMatch ? (corner === "aka" ? focusMatch.blue : focusMatch.red) : "";

  return (
    <section className="athlete-pass" aria-labelledby="athlete-pass-title" data-ui>
      <header className="athlete-pass-head">
        <h2 id="athlete-pass-title">{isLive ? "Đang thi đấu" : focusMatch ? "Trận tiếp theo" : "Lịch thi đấu"}</h2>
        <p>{athleteCode} · {club}</p>
      </header>

      {focusMatch ? (
        <div className={`athlete-pass-body corner-${corner}`}>
          <div className="athlete-pass-mat">
            <span>Thảm</span>
            <strong>{getMatDisplayName(focusMatch.tatami).replace(/^Thảm\s*/, "") || "–"}</strong>
          </div>
          <div className="athlete-pass-time">
            <span>Giờ dự kiến</span>
            <strong><time dateTime={`${focusMatch.date}T${focusMatch.time}`}>{focusMatch.time}</time></strong>
            <small>{formatDay(focusMatch.date)}</small>
          </div>
          <div className="athlete-pass-corner">
            <span>Góc đai</span>
            <strong>{corner === "aka" ? "Aka · Đỏ" : "Ao · Xanh"}</strong>
          </div>
          <div className="athlete-pass-detail">
            <p><span>Nội dung</span>{focusMatch.category}</p>
            <p><span>Đối thủ</span>{opponent || "Chờ xác định"}</p>
            <p><span>Trạng thái</span>{getMatchDisplayState(focusMatch)}{isLive && typeof focusMatch.redScore === "number" ? ` · ${focusMatch.redScore} – ${focusMatch.blueScore ?? 0}` : ""}</p>
          </div>
        </div>
      ) : (
        <p className="athlete-pass-empty">Không còn trận sắp diễn ra của {athleteName}. Kết quả các trận đã đấu ở bên dưới.</p>
      )}

      <footer className="athlete-pass-foot">
        <span>{remainingCount > 0 ? `Còn ${new Intl.NumberFormat("vi-VN").format(remainingCount)} trận chưa thi đấu` : "Đã hoàn thành lịch thi đấu"}</span>
        <span>Cập nhật lúc {formatUpdatedAt(updatedAt)} · tự làm mới mỗi 30 giây</span>
      </footer>
    </section>
  );
}

