import Link from "next/link";
import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { InternalLayout, PageHero } from "@/components/portal-ui";
import { getRanking } from "@/lib/public-data";

export const metadata: Metadata = { title: "Bảng xếp hạng", description: "Bảng xếp hạng vận động viên Karate theo nội dung và mùa giải." };

export default async function RankingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : "all";
  const season = typeof params.season === "string" ? params.season : "all";
  const ranking = await getRanking();
  const seasons = [...new Set(ranking.map((item) => item.season).filter((item): item is string => Boolean(item)))];
  const filteredRanking = ranking.filter((item) => (category === "all" || item.category.includes(category)) && (season === "all" || item.season === season));
  return (
    <InternalLayout>
      <PageHero title="Bảng xếp hạng" description="Tra cứu thứ hạng vận động viên theo nội dung thi đấu và mùa giải." />
      <section className="content-section">
        <form className="filter-bar" method="get"><label>Nội dung thi đấu<select name="category" defaultValue={category}><option value="all">Tất cả nội dung</option><option>Kata</option><option>Kumite</option></select></label><label>Mùa giải<select name="season" defaultValue={season}><option value="all">Tất cả</option>{seasons.map((item) => <option key={item}>{item}</option>)}</select></label><button className="filter-submit" type="submit">Áp dụng</button></form>
        <div className="ranking-table"><div className="ranking-head"><span>Hạng</span><span>Vận động viên</span><span>CLB</span><span>Điểm</span></div>{filteredRanking.length > 0 ? filteredRanking.map((item) => <Link href={`/athletes/${item.athleteId}`} key={item.athleteId}><b>{item.rank}</b><strong>{item.name}</strong><span>{item.club}</span><em>{new Intl.NumberFormat("vi-VN").format(item.points)}</em></Link>) : <EmptyState title={ranking.length ? "Không có thứ hạng phù hợp" : "Bảng xếp hạng đang được cập nhật"} description={ranking.length ? "Thử thay đổi nội dung hoặc mùa giải." : "Thứ hạng sẽ hiển thị sau khi dữ liệu chính thức được công bố."} compact />}</div>
      </section>
    </InternalLayout>
  );
}
