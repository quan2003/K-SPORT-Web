import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { InternalLayout } from "@/components/portal-ui";
import { getAthlete, getAthletes, getEvents, getRanking } from "@/lib/public-data";
import { isMockAthlete } from "@/lib/mock-data";

export async function generateStaticParams() { return (await getAthletes()).map(({ id }) => ({ id })); }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const athlete = await getAthlete((await params).id);
  return athlete ? { title: athlete.name, description: `Hồ sơ thi đấu công khai của ${athlete.name}.` } : { title: "Vận động viên" };
}

const formatDate = (value?: string) => value ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "—";

const medalLabel = (entry: { medals?: { gold?: number; silver?: number; bronze?: number } }) => {
  if (entry.medals?.gold) return "Huy chương vàng";
  if (entry.medals?.silver) return "Huy chương bạc";
  if (entry.medals?.bronze) return "Huy chương đồng";
  return "#";
};

export default async function AthleteDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const pageParams = await searchParams;
  const eventQuery = typeof pageParams.event === "string" ? pageParams.event.trim().toLocaleLowerCase("vi") : "";
  const [athlete, athletes, ranking, events] = await Promise.all([getAthlete(id), getAthletes(), getRanking(), getEvents()]);
  if (!athlete) notFound();
  const orderedAthletes = [...athletes].sort((left, right) => left.name.localeCompare(right.name, "vi"));
  const athleteIndex = orderedAthletes.findIndex((item) => item.id === athlete.id);
  const previousAthlete = athleteIndex > 0 ? orderedAthletes[athleteIndex - 1] : null;
  const nextAthlete = athleteIndex >= 0 && athleteIndex < orderedAthletes.length - 1 ? orderedAthletes[athleteIndex + 1] : null;
  const rankingEntries = ranking
    .filter((item) => item.athleteId === athlete.id)
    .sort((left, right) => right.points - left.points || left.category.localeCompare(right.category, "vi"));
  const rankingPoints = rankingEntries.reduce((total, entry) => total + entry.points, 0);
  const eventDates = new Map(events.map((event) => [event.slug, event.date]));
  const historyEntries = rankingEntries.filter((entry) => !eventQuery || `${entry.eventName} ${entry.category}`.toLocaleLowerCase("vi").includes(eventQuery));
  const medalTotals = rankingEntries.reduce(
    (totals, entry) => ({
      gold: totals.gold + (entry.medals?.gold ?? 0),
      silver: totals.silver + (entry.medals?.silver ?? 0),
      bronze: totals.bronze + (entry.medals?.bronze ?? 0),
    }),
    { gold: 0, silver: 0, bronze: 0 },
  );
  const medalTotal = medalTotals.gold + medalTotals.silver + medalTotals.bronze;
  return (
    <InternalLayout>
      <section className="athlete-profile">
        {isMockAthlete(athlete.id) ? <p className="sample-data-note athlete-sample-note">Dữ liệu minh họa — hồ sơ và thành tích này không phải dữ liệu thi đấu chính thức.</p> : null}
        <nav className="athlete-profile-navigation" aria-label="Điều hướng hồ sơ vận động viên">
          {previousAthlete ? <Link href={`/athletes/${previousAthlete.id}`}><span aria-hidden="true">←</span> VĐV trước</Link> : <span aria-disabled="true"><span aria-hidden="true">←</span> VĐV trước</span>}
          <Link href="/athletes">Tất cả VĐV</Link>
          {nextAthlete ? <Link href={`/athletes/${nextAthlete.id}`}>VĐV sau <span aria-hidden="true">→</span></Link> : <span aria-disabled="true">VĐV sau <span aria-hidden="true">→</span></span>}
        </nav>
        <div className="athlete-profile-grid">
          <aside className="athlete-profile-media">
            <AthleteAvatar name={athlete.name} src={athlete.image} priority className="athlete-avatar-profile" />
            <h1>{athlete.name}</h1>
            <dl><div><dt>Mã VĐV</dt><dd>{athlete.athleteCode ?? athlete.id}</dd></div><div><dt>Quốc gia</dt><dd>{athlete.country || "—"}</dd></div><div><dt>Tổng số trận</dt><dd>{athlete.totalMatches ?? 0}</dd></div><div><dt>Tỷ lệ thắng</dt><dd>{typeof athlete.winRate === "number" ? `${athlete.winRate}%` : "—"}</dd></div></dl>
          </aside>
          <div className="athlete-profile-copy">
            <p className="athlete-profile-eyebrow">Hồ sơ vận động viên</p>
            <h2>{athlete.category}</h2>
            <p className="athlete-profile-club">{athlete.club}</p>
            <div className="athlete-profile-result"><span>{athlete.publicResult || "Chưa có kết quả công khai"}</span><strong>{rankingEntries.length ? `#${rankingEntries[0].rank}` : "—"}</strong><p>{rankingEntries.length ? `${new Intl.NumberFormat("vi-VN").format(rankingPoints)} điểm xếp hạng` : "Điểm xếp hạng đang cập nhật"}</p></div>
            {rankingEntries.length > 0 ? <section className="athlete-ranking-summary" aria-labelledby="athlete-ranking-title"><div><p id="athlete-ranking-title">Thành tích công khai</p><Link href="/ranking">Xem bảng xếp hạng <span aria-hidden="true">→</span></Link></div>{medalTotal > 0 ? <dl className="athlete-medal-totals" aria-label={`Tổng ${medalTotal} huy chương`}><div className="medal-gold"><dt>Vàng</dt><dd>{medalTotals.gold}</dd></div><div className="medal-silver"><dt>Bạc</dt><dd>{medalTotals.silver}</dd></div><div className="medal-bronze"><dt>Đồng</dt><dd>{medalTotals.bronze}</dd></div><div className="medal-total"><dt>Tổng</dt><dd>{medalTotal}</dd></div></dl> : null}<ol>{rankingEntries.slice(0, 3).map((entry) => <li key={`${entry.eventSlug}-${entry.category}`}><b>#{entry.rank}</b><span><strong>{entry.eventName}</strong><small>{entry.category}{entry.season ? ` · ${entry.season}` : ""}</small></span><em>{new Intl.NumberFormat("vi-VN").format(entry.points)} điểm</em></li>)}</ol></section> : null}
          </div>
        </div>
        <section className="athlete-event-history" aria-labelledby="athlete-history-title">
          <div><div><p className="athlete-profile-eyebrow">Lịch sử thi đấu</p><h2 id="athlete-history-title">Thành tích theo giải</h2></div><form method="get" role="search"><label className="sr-only" htmlFor="athlete-event-search">Tìm giải đấu hoặc hạng mục</label><input id="athlete-event-search" name="event" type="search" placeholder="Tìm giải đấu hoặc hạng mục…" defaultValue={eventQuery} /><button type="submit" aria-label="Tìm lịch sử thi đấu">→</button></form></div>
          {historyEntries.length > 0 ? <div className="athlete-history-table"><div className="athlete-history-head"><span>Ngày</span><span>Giải đấu</span><span>Hạng mục</span><span>Thành tích</span><span>Điểm</span></div>{historyEntries.map((entry) => <div className="athlete-history-row" key={`${entry.eventSlug}-${entry.category}`}><time>{formatDate(entry.eventDate || eventDates.get(entry.eventSlug))}</time><strong>{entry.eventName}</strong><span>{entry.category}</span><span>{medalLabel(entry)} {medalLabel(entry) === "#" ? entry.rank : ""}</span><em>{new Intl.NumberFormat("vi-VN").format(entry.points)}</em></div>)}</div> : <p className="athlete-history-empty">Chưa có thành tích công khai phù hợp.</p>}
        </section>
      </section>
    </InternalLayout>
  );
}
