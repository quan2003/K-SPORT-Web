import Link from "next/link";
import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { InternalLayout, PageHero } from "@/components/portal-ui";
import { getEvents } from "@/lib/public-data";

export const metadata: Metadata = { title: "Giải đấu", description: "Thông tin các giải Karate trên cổng K-SPORT." };

const formatDate = (value: string) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));

export default async function EventsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "all";
  const discipline = typeof params.discipline === "string" ? params.discipline : "all";
  const events = await getEvents();
  const filteredEvents = events.filter((event) => (status === "all" || event.status === status) && (discipline === "all" || event.discipline.includes(discipline)));
  return (
    <InternalLayout>
      <PageHero title="Giải đấu" description="Theo dõi thông tin tổ chức, nội dung thi và trạng thái của các giải Karate." />
      <section className="directory-section">
        <form className="filter-bar" method="get"><label>Trạng thái<select name="status" defaultValue={status}><option value="all">Tất cả</option><option>Đang diễn ra</option><option>Sắp diễn ra</option><option>Đã kết thúc</option></select></label><label>Nội dung<select name="discipline" defaultValue={discipline}><option value="all">Tất cả nội dung</option><option>Kata</option><option>Kumite</option></select></label><button className="filter-submit" type="submit">Áp dụng</button></form>
        {filteredEvents.length > 0 ? <div className="directory-list event-list">{filteredEvents.map((event) => <Link href={`/events/${event.slug}`} key={event.slug}><time>{formatDate(event.date)}</time><div><h2>{event.name}</h2><p>{event.location} · {event.discipline}</p></div><span>{event.status}</span></Link>)}</div> : <EmptyState title={events.length ? "Không có giải đấu phù hợp" : "Chưa có giải đấu được công bố"} description={events.length ? "Thử thay đổi bộ lọc để xem các giải đấu khác." : "Danh sách giải sẽ xuất hiện khi dữ liệu chính thức được đồng bộ từ hệ thống K-SPORT."} />}
      </section>
    </InternalLayout>
  );
}
