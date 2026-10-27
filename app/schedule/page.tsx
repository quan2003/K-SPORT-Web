import Link from "next/link";
import type { Metadata } from "next";
import { InternalLayout, MatchRows, PageHero } from "@/components/portal-ui";
import { competitionType, getEvents, getSchedule, sortMatches } from "@/lib/public-data";

export const metadata: Metadata = { title: "Lịch thi đấu", description: "Lịch thi đấu Karate theo giải, thời gian, nội dung và tatami." };

function valueOf(value: string | string[] | undefined, fallback = "all") {
  return typeof value === "string" && value ? value : fallback;
}

export default async function SchedulePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const event = valueOf(params.event);
  const category = valueOf(params.category);
  const type = valueOf(params.type);
  const tatami = valueOf(params.tatami);
  const date = valueOf(params.date, "");
  const [events, rawMatches] = await Promise.all([getEvents(), getSchedule()]);
  const matches = sortMatches(rawMatches);
  const selectedEvent = events.find((item) => item.slug === event);
  const sourceCategories = selectedEvent?.categories ?? events.flatMap((item) => item.categories);
  const categories = [...new Set(sourceCategories)].sort((left, right) => left.localeCompare(right, "vi"));
  const types = [...new Set(sourceCategories.map(competitionType))].filter((item) => item !== "Khác");
  const tatamis = [...new Set(matches.map((match) => match.tatami).filter(Boolean))].sort((left, right) => left.localeCompare(right, "vi", { numeric: true }));
  const filteredMatches = matches.filter((match) =>
    (event === "all" || match.eventSlug === event) &&
    (!date || match.date === date) &&
    (category === "all" || match.category === category) &&
    (type === "all" || competitionType(match.category) === type) &&
    (tatami === "all" || match.tatami === tatami)
  );
  const hasFilters = event !== "all" || category !== "all" || type !== "all" || tatami !== "all" || Boolean(date);

  return (
    <InternalLayout>
      <PageHero title="Lịch thi đấu" description="Tra cứu lịch theo giải, nội dung, tatami và ngày thi đấu đã được ban tổ chức công bố." image="/images/karate-training.png" className="schedule-page-hero" />
      <section className="content-section schedule-section">
        <div className="schedule-intro">
          <div><h2>Tra cứu lịch thi đấu</h2><p>Bộ lọc được tạo trực tiếp từ giải đấu và nội dung đã đồng bộ.</p></div>
          <p><strong>{filteredMatches.length}</strong> trận phù hợp</p>
        </div>
        <form className="filter-bar schedule-filters" method="get">
          <label>Giải đấu<select name="event" defaultValue={event}><option value="all">Tất cả giải đấu</option>{events.map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></label>
          <label>Nội dung<select name="category" defaultValue={category}><option value="all">Tất cả nội dung</option>{categories.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
          <label>Loại thi đấu<select name="type" defaultValue={type}><option value="all">Tất cả loại thi đấu</option>{types.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
          <label>Tatami<select name="tatami" defaultValue={tatami}><option value="all">Tất cả tatami</option>{tatamis.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
          <label>Ngày thi đấu<input name="date" type="date" defaultValue={date} /></label>
          <button className="filter-submit" type="submit"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m16 16 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" /></svg><span>Tìm kiếm</span></button>
        </form>
        <div className="schedule-result-heading">
          <div><h2>Lịch đã công bố</h2><p>{selectedEvent?.name ?? "Tất cả giải đấu công khai"}</p></div>
          {hasFilters ? <Link href="/schedule">Xóa bộ lọc</Link> : null}
        </div>
        <MatchRows matches={filteredMatches} />
      </section>
    </InternalLayout>
  );
}
