import type { Metadata } from "next";
import { InternalLayout, MatchRows, PageHero } from "@/components/portal-ui";
import { getEvents, getResults } from "@/lib/public-data";

export const metadata: Metadata = { title: "Kết quả", description: "Kết quả Karate đã được ban tổ chức công bố." };

export default async function ResultsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const event = typeof params.event === "string" ? params.event : "all";
  const category = typeof params.category === "string" ? params.category : "all";
  const [matches, events] = await Promise.all([getResults(), getEvents()]);
  const filteredMatches = matches.filter((match) => (event === "all" || match.eventSlug === event) && (category === "all" || match.category.includes(category)));
  return (
    <InternalLayout>
      <PageHero title="Kết quả thi đấu" description="Tra cứu kết quả đã được ban tổ chức xác nhận và công bố." image="/images/karate-hero.png" />
      <section className="content-section schedule-section">
        <form className="filter-bar" method="get"><label>Giải đấu<select name="event" defaultValue={event}><option value="all">Tất cả giải đấu</option>{events.map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></label><label>Nội dung<select name="category" defaultValue={category}><option value="all">Tất cả nội dung</option><option>Kata</option><option>Kumite</option></select></label><button className="filter-submit" type="submit">Áp dụng</button></form>
        <MatchRows matches={filteredMatches} results />
      </section>
    </InternalLayout>
  );
}
