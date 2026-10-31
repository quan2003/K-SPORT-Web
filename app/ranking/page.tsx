import Link from "next/link";
import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { InternalLayout, PageHero } from "@/components/portal-ui";
import { getRanking } from "@/lib/public-data";

export const metadata: Metadata = { title: "Bảng xếp hạng", description: "Bảng xếp hạng vận động viên Karate theo nội dung và mùa giải." };

function rankMovement(change = 0) {
  if (change > 0) return { label: `Tăng ${change} bậc`, symbol: `↑ ${change}`, className: "rank-movement-up" };
  if (change < 0) return { label: `Giảm ${Math.abs(change)} bậc`, symbol: `↓ ${Math.abs(change)}`, className: "rank-movement-down" };
  return { label: "Hạng không thay đổi", symbol: "→", className: "rank-movement-stable" };
}

function medalCount(entry: { medals?: { gold?: number; silver?: number; bronze?: number } }, medal: "gold" | "silver" | "bronze") {
  return entry.medals?.[medal] ?? 0;
}

export default async function RankingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : "all";
  const season = typeof params.season === "string" ? params.season : "all";
  const top = typeof params.top === "string" ? Number.parseInt(params.top, 10) : 10;
  const ranking = await getRanking();
  const seasons = [...new Set(ranking.map((item) => item.season).filter((item): item is string => Boolean(item)))];
  const categories = [...new Set(ranking.map((item) => item.category).filter(Boolean))].sort((left, right) => left.localeCompare(right, "vi"));
  const topLimit = [10, 32, 64, 100, 200, 300, 400, 500].includes(top) ? top : 10;
  const seasonFilteredRanking = ranking
    .filter((item) => (category === "all" || item.category.includes(category)) && (season === "all" || item.season === season));
  const latestRankingByAthlete = season === "all"
    ? [...new Map([...seasonFilteredRanking]
      .sort((left, right) => (right.season ?? "").localeCompare(left.season ?? "") || right.points - left.points)
      .map((item) => [item.athleteId, item]))
      .values()].map((latestItem) => {
        const entries = seasonFilteredRanking.filter((item) => item.athleteId === latestItem.athleteId);
        return {
          ...latestItem,
          points: entries.reduce((total, item) => total + item.points, 0),
          medals: entries.reduce(
            (totals, item) => ({
              gold: totals.gold + medalCount(item, "gold"),
              silver: totals.silver + medalCount(item, "silver"),
              bronze: totals.bronze + medalCount(item, "bronze"),
            }),
            { gold: 0, silver: 0, bronze: 0 },
          ),
        };
      })
    : seasonFilteredRanking;
  const filteredRanking = latestRankingByAthlete
    .sort((left, right) => right.points - left.points || medalCount(right, "gold") - medalCount(left, "gold") || medalCount(right, "silver") - medalCount(left, "silver") || medalCount(right, "bronze") - medalCount(left, "bronze") || left.rank - right.rank || left.name.localeCompare(right.name, "vi"));
  const visibleRanking = filteredRanking.slice(0, topLimit);
  return (
    <InternalLayout>
      <PageHero title="Bảng xếp hạng" description="Tra cứu thứ hạng vận động viên theo nội dung thi đấu và mùa giải." />
      <section className="content-section">
        <form className="filter-bar ranking-filters" method="get"><label>Nội dung thi đấu<select name="category" defaultValue={category}><option value="all">Tất cả nội dung</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label>Năm thi đấu<select name="season" defaultValue={season}><option value="all">Tất cả năm</option>{seasons.map((item) => <option key={item}>{item}</option>)}</select></label><label>Phạm vi xếp hạng<select name="top" defaultValue={String(topLimit)}>{[10, 32, 64, 100, 200, 300, 400, 500].map((item) => <option key={item} value={item}>Top {item}</option>)}</select></label><button className="filter-submit" type="submit">Áp dụng</button></form>
        <div className="ranking-table"><div className="ranking-head"><span>Hạng</span><span>Vận động viên</span><span>CLB</span><span>Điểm</span></div>{visibleRanking.length > 0 ? visibleRanking.map((item, index) => { const movement = rankMovement(item.rankChange); return <Link href={`/athletes/${item.athleteId}`} key={item.athleteId} aria-label={`Xem hồ sơ ${item.name}`}><b className={`rank-position rank-position-${Math.min(index + 1, 4)}`}><span>{index + 1}</span><i className={`rank-movement ${movement.className}`} aria-label={movement.label}>{movement.symbol}</i></b><strong>{item.name}</strong><span>{item.club}</span><em>{new Intl.NumberFormat("vi-VN").format(item.points)} <i aria-hidden="true">→</i></em></Link>; }) : <EmptyState title={ranking.length ? "Không có thứ hạng phù hợp" : "Bảng xếp hạng đang được cập nhật"} description={ranking.length ? "Thử thay đổi nội dung hoặc năm thi đấu." : "Thứ hạng sẽ hiển thị sau khi dữ liệu chính thức được công bố."} compact />}</div>
      </section>
    </InternalLayout>
  );
}
