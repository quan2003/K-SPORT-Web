import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InternalLayout, MatchRows } from "@/components/portal-ui";
import { getEvent, getEvents, getSchedule } from "@/lib/public-data";

export async function generateStaticParams() {
  return (await getEvents()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const event = await getEvent((await params).slug);
  return event
    ? { title: event.name, description: event.description ?? `Thông tin giải Karate ${event.name}.` }
    : { title: "Giải đấu" };
}

function getDisplayTitle(name: string) {
  return name
    .replace(/^Giải\s+/i, "")
    .replace(/\bcác\s+CLB\b/i, "CLB")
    .replace(/\bKarate\s+tỉnh\s+/i, "Karate ")
    .replace(/\s+mở\s+rộng\s+lần\s+thứ\s+\d+/i, " mở rộng")
    .replace(/\s*[–-]\s*Năm\s+(\d{4})\s*$/i, " $1")
    .replace(/\s+/g, " ")
    .trim();
}

function getAgeGroup(category: string) {
  const match = category.match(/(Dưới\s+\d+\s+tuổi|\d+\s*[–-]\s*\d+\s+tuổi|\d+\s+tuổi\s+trở\s+lên)/i);
  return match?.[1].replace(/\s*-\s*/g, "–") ?? "Nội dung khác";
}

export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [event, schedule] = await Promise.all([getEvent(slug), getSchedule()]);
  if (!event) notFound();

  const formatDate = (value: string) => new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

  const eventSchedule = schedule.filter((match) => match.eventSlug === slug || match.eventName === event.name);
  const categoryGroups = Array.from(
    event.categories.reduce((groups, category) => {
      const group = getAgeGroup(category);
      groups.set(group, [...(groups.get(group) ?? []), category]);
      return groups;
    }, new Map<string, string[]>()),
  );

  return (
    <InternalLayout>
      <section className="event-detail-hero">
        <div className="event-detail-copy">
          <h1 title={event.name}>{getDisplayTitle(event.name)}</h1>
          <p className="event-official-name">{event.name}</p>
          <div className="event-hero-facts">
            <p><span>Thời gian</span><time dateTime={event.date}>{formatDate(event.date)}</time> – <time dateTime={event.endDate}>{formatDate(event.endDate)}</time></p>
            <p><span>Địa điểm</span>{event.location}</p>
          </div>
        </div>
        <div className="event-detail-media">
          <Image src={event.image ?? "/images/karate-hero.png"} alt="" fill sizes="(max-width: 760px) 100vw, 46vw" priority />
        </div>
      </section>

      <nav className="subnav event-subnav" aria-label="Nội dung giải">
        <a href="#overview">Tổng quan</a>
        <a href="#schedule">Lịch thi đấu</a>
        <a href="#categories">Nội dung thi <span>{event.categories.length}</span></a>
      </nav>

      <section id="overview" className="event-overview">
        <div className="event-overview-copy" data-reveal>
          <h2>Thông tin giải</h2>
          <p className="event-description">{event.description ?? "Thông tin chi tiết sẽ được ban tổ chức cập nhật."}</p>
          <dl className="event-facts">
            <div><dt>Thời gian</dt><dd>{formatDate(event.date)} – {formatDate(event.endDate)}</dd></div>
            <div><dt>Địa điểm</dt><dd>{event.location}</dd></div>
            <div><dt>Thể thức</dt><dd>{event.discipline}</dd></div>
            <div><dt>Nội dung thi</dt><dd>{event.categories.length > 0 ? `${new Intl.NumberFormat("vi-VN").format(event.categories.length)} nội dung` : "Đang cập nhật"}</dd></div>
          </dl>
        </div>
        <figure className="event-venue event-image-reveal" data-reveal>
          <Image src="/images/karate-venue.png" alt="" width={1536} height={1024} sizes="(max-width: 900px) 100vw, 52vw" loading="eager" />
          <figcaption>Khu vực thi đấu Karate</figcaption>
        </figure>
      </section>

      <section id="schedule" className="content-section event-schedule-section">
        <div className="event-section-heading" data-reveal>
          <h2>Lịch thi đấu</h2>
          <p>{eventSchedule.length > 0 ? `${new Intl.NumberFormat("vi-VN").format(eventSchedule.length)} trận đã được công bố cho giải này.` : "Lịch của giải sẽ hiển thị ngay khi ban tổ chức công bố."}</p>
        </div>
        <div data-reveal><MatchRows matches={eventSchedule} /></div>
      </section>

      <section id="categories" className="event-categories">
        <div className="event-categories-inner">
          <div className="event-section-heading" data-reveal>
            <h2>Nội dung thi</h2>
            <p>{event.categories.length > 0 ? `${new Intl.NumberFormat("vi-VN").format(event.categories.length)} nội dung, được sắp xếp theo nhóm tuổi để tra cứu nhanh.` : "Nội dung thi đang được ban tổ chức cập nhật."}</p>
          </div>
          <figure className="event-category-photo event-image-reveal" data-reveal>
            <Image src="/images/karate-training.png" alt="" width={1536} height={1024} sizes="100vw" loading="lazy" />
          </figure>
          {categoryGroups.length > 0 ? (
            <div className="category-groups">
              {categoryGroups.map(([group, categories], index) => (
                <details key={group} open={index === 0} data-reveal>
                  <summary><strong>{group}</strong><span>{categories.length} nội dung</span></summary>
                  <ul>
                    {categories.map((category) => <li key={category}>{category}</li>)}
                  </ul>
                </details>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </InternalLayout>
  );
}
