import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { InternalLayout } from "@/components/portal-ui";
import { getAthlete, getAthletes, getRanking } from "@/lib/public-data";

export async function generateStaticParams() { return (await getAthletes()).map(({ id }) => ({ id })); }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const athlete = await getAthlete((await params).id);
  return athlete ? { title: athlete.name, description: `Hồ sơ thi đấu công khai của ${athlete.name}.` } : { title: "Vận động viên" };
}

export default async function AthleteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [athlete, athletes, ranking] = await Promise.all([getAthlete(id), getAthletes(), getRanking()]);
  if (!athlete) notFound();
  const orderedAthletes = [...athletes].sort((left, right) => left.name.localeCompare(right.name, "vi"));
  const athleteIndex = orderedAthletes.findIndex((item) => item.id === athlete.id);
  const previousAthlete = athleteIndex > 0 ? orderedAthletes[athleteIndex - 1] : null;
  const nextAthlete = athleteIndex >= 0 && athleteIndex < orderedAthletes.length - 1 ? orderedAthletes[athleteIndex + 1] : null;
  const rankingEntries = ranking
    .filter((item) => item.athleteId === athlete.id)
    .sort((left, right) => right.points - left.points || left.category.localeCompare(right.category, "vi"));
  return (
    <InternalLayout>
      <section className="athlete-profile">
        <nav className="athlete-profile-navigation" aria-label="Điều hướng hồ sơ vận động viên">
          {previousAthlete ? <Link href={`/athletes/${previousAthlete.id}`}><span aria-hidden="true">←</span> VĐV trước</Link> : <span aria-disabled="true"><span aria-hidden="true">←</span> VĐV trước</span>}
          <Link href="/athletes">Tất cả VĐV</Link>
          {nextAthlete ? <Link href={`/athletes/${nextAthlete.id}`}>VĐV sau <span aria-hidden="true">→</span></Link> : <span aria-disabled="true">VĐV sau <span aria-hidden="true">→</span></span>}
        </nav>
        <div className="athlete-profile-grid">
          <div className="athlete-profile-media"><AthleteAvatar name={athlete.name} src={athlete.image} priority className="athlete-avatar-profile" /></div>
          <div className="athlete-profile-copy">
            <p className="athlete-profile-eyebrow">Hồ sơ vận động viên</p>
            <h1>{athlete.name}</h1>
            <p className="athlete-profile-club">{athlete.club}</p>
            <dl><div><dt>Mã VĐV</dt><dd>{athlete.athleteCode ?? athlete.id}</dd></div><div><dt>Quốc gia</dt><dd>{athlete.country || "—"}</dd></div><div><dt>Hạng mục</dt><dd>{athlete.category}</dd></div><div><dt>Tổng số trận</dt><dd>{athlete.totalMatches ?? 0}</dd></div><div><dt>Tỷ lệ thắng</dt><dd>{typeof athlete.winRate === "number" ? `${athlete.winRate}% (${athlete.wins ?? 0} trận thắng)` : "—"}</dd></div>{athlete.publicResult ? <div><dt>Kết quả công khai</dt><dd>{athlete.publicResult}</dd></div> : null}</dl>
            {rankingEntries.length > 0 ? <section className="athlete-ranking-summary" aria-labelledby="athlete-ranking-title"><div><p id="athlete-ranking-title">Xếp hạng công khai</p><Link href="/ranking">Xem bảng xếp hạng <span aria-hidden="true">→</span></Link></div><ol>{rankingEntries.slice(0, 3).map((entry) => <li key={`${entry.category}-${entry.season ?? "all"}`}><b>#{entry.rank}</b><span><strong>{entry.category}</strong>{entry.season ? <small>Mùa giải {entry.season}</small> : null}</span><em>{new Intl.NumberFormat("vi-VN").format(entry.points)} điểm</em></li>)}</ol></section> : null}
          </div>
        </div>
      </section>
    </InternalLayout>
  );
}
