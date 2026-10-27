import Image from "next/image";
import Link from "next/link";
import { ArenaCarousel } from "@/components/arena-carousel";
import { EmptyState } from "@/components/empty-state";
import { HomeMotion } from "@/components/home-motion";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MoreLink } from "@/components/portal-ui";
import { getEvents, getNews, getRanking, getSchedule, isCurrentOrUpcomingMatch, sortEvents, sortMatches } from "@/lib/public-data";

const formatDate = (value: string) => new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));

export default async function Home() {
  const [events, matches, news, ranking] = await Promise.all([getEvents(), getSchedule(), getNews(), getRanking()]);
  const orderedEvents = sortEvents(events);
  const upcomingMatches = sortMatches(matches.filter((match) => isCurrentOrUpcomingMatch(match))).slice(0, 3);
  const featuredEvent = orderedEvents[0];
  const leadStory = news[0];

  return (
    <>
      <HomeMotion />
      <SiteHeader />
      <main id="main-content">
        <section className="home-hero">
          <Image src="/images/karate-hero.png" alt="Hai võ sĩ Karate thi đấu trên thảm" fill sizes="100vw" priority />
          <div className="hero-content">
            <p className="hero-eyebrow" data-reveal>{/* taste-skill-ignore: reference art direction uses a compact hero eyebrow */}Cổng thông tin và phần mềm quản lý giải đấu Karate</p>
            <h1 data-reveal>Karate Việt Nam,<br /><span>trong một nhịp đấu.</span></h1>
            <p data-reveal>Kết nối giải đấu – vận hành chuyên nghiệp – lan tỏa tinh thần Karate vì một cộng đồng mạnh mẽ hơn.</p>
            <div className="hero-actions" data-reveal><Link className="button red" href="/events">Xem giải đấu <span aria-hidden="true">→</span></Link><Link className="text-action" href="/software">Tìm hiểu phần mềm</Link></div>
          </div>
          <div className="hero-match-rail" data-ui aria-label="Lịch thi đấu sắp tới">
            <div className="rail-intro" data-reveal><strong>Lịch thi đấu sắp diễn ra</strong><p>Chỉ hiển thị các trận có ngày thi đấu từ hôm nay trở đi.</p><Link href="/schedule">Xem toàn bộ <span aria-hidden="true">→</span></Link></div>
            <div className="rail-matches">
              {upcomingMatches.length > 0 ? upcomingMatches.map((match) => (
                <article key={match.id}>
                  <div className="rail-time"><time dateTime={`${match.date}T${match.time}`}>{match.time}</time><span>{formatDate(match.date)}</span></div>
                  <div className="rail-match-copy"><strong>{match.category}</strong><span>{match.eventName ?? "Giải đấu K-SPORT"}</span><small>{match.tatami ? `Tatami ${match.tatami}` : "Tatami chưa được phân"}</small></div>
                  <p><span className="aka-dot" />{match.red}<br /><span className="ao-dot" />{match.blue}</p>
                </article>
              )) : (
                <div className="rail-empty">
                  <strong>Chưa có giờ thi đấu mới được công bố</strong>
                  <p>Giải sắp tới đã có thông tin, nhưng lịch trận và tatami vẫn đang chờ ban tổ chức cập nhật.</p>
                  <Link href={featuredEvent ? `/events/${featuredEvent.slug}` : "/events"}>Xem giải sắp tới <span aria-hidden="true">→</span></Link>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="section events-feature">
          <div className="section-heading" data-reveal><div><h2>Giải đấu</h2><p>Thông tin tập trung về thời gian, địa điểm, nội dung thi và trạng thái tổ chức.</p></div><MoreLink href="/events">Xem tất cả</MoreLink></div>
          {featuredEvent ? (
            <div className="event-layout" data-reveal>
              <Link href={`/events/${featuredEvent.slug}`} className="featured-event">
                <Image src={featuredEvent.image ?? "/images/karate-venue.png"} alt="" width={1536} height={1024} />
                <div><h3>{featuredEvent.name}</h3><p><time>{formatDate(featuredEvent.date)}</time> · {featuredEvent.location}</p></div>
              </Link>
              <div className="event-rows">{orderedEvents.slice(1, 4).map((event) => <Link key={event.slug} href={`/events/${event.slug}`}><time>{formatDate(event.date)}</time><div><h3>{event.name}</h3><p>{event.location}</p></div><span>{event.status}</span></Link>)}</div>
            </div>
          ) : (
            <div className="event-empty-layout" data-reveal>
              <Image src="/images/karate-venue.png" alt="Không gian thi đấu Karate" width={1536} height={1024} />
              <EmptyState title="Giải đấu đang được cập nhật" description="Danh sách giải sẽ xuất hiện khi dữ liệu chính thức được đồng bộ từ ban tổ chức." href="/events" action="Mở trang giải đấu" />
            </div>
          )}
        </section>

        <section className="arena-section">
          <div className="section-heading inverse" data-reveal><div><h2>Trên thảm đấu</h2><p>Theo dõi thứ tự trận, tatami và trạng thái thi đấu từ một giao diện tập trung.</p></div><MoreLink href="/schedule">Mở lịch thi đấu</MoreLink></div>
          <ArenaCarousel matches={matches} />
        </section>

        <section className="section news-section">
          <div className="section-heading" data-reveal><div><h2>Tin tức Karate</h2><p>Thông tin chuyên môn, hoạt động và góc nhìn về Karate.</p></div><MoreLink href="/news">Xem tất cả tin</MoreLink></div>
          {leadStory ? (
            <div className="news-layout" data-reveal>
              <Link href={`/news/${leadStory.slug}`} className="lead-story"><Image src={leadStory.image} alt="" width={1536} height={1024} /><div><h3>{leadStory.title}</h3><p><span>{leadStory.category}</span> · <time>{formatDate(leadStory.publishedAt)}</time></p></div></Link>
              <div className="story-list">{news.slice(1, 3).map((item) => <Link href={`/news/${item.slug}`} key={item.slug}><Image src={item.image} alt="" width={600} height={400} /><div><h3>{item.title}</h3><p><span>{item.category}</span> · <time>{formatDate(item.publishedAt)}</time></p></div></Link>)}</div>
            </div>
          ) : (
            <div className="news-empty-layout" data-reveal>
              <Image src="/images/karate-training.png" alt="Trang phục và thảm tập Karate" width={1536} height={1024} />
              <EmptyState title="Tin tức đang được cập nhật" description="Các bài viết đã biên tập sẽ xuất hiện tại đây khi chuyên mục được kết nối dữ liệu." href="/news" action="Mở chuyên mục" />
            </div>
          )}
        </section>

        <section className="section athlete-ranking">
          <div className="athlete-focus" data-reveal>
            <Image src="/images/athlete-portrait.png" alt="Vận động viên Karate" width={1152} height={1536} />
            <div><h2>Vận động viên</h2><p>Hồ sơ công khai sẽ hiển thị hạng mục, câu lạc bộ và kết quả thi đấu đã được xác nhận.</p><Link href="/athletes">Xem danh sách <span aria-hidden="true">→</span></Link></div>
          </div>
          <div className="ranking-block" data-reveal>
            <div className="section-heading compact"><div><h2>Bảng xếp hạng</h2><p>Xếp hạng theo nội dung thi đấu.</p></div><MoreLink href="/ranking">Toàn bộ</MoreLink></div>
            {ranking.length > 0 ? <ol>{ranking.slice(0, 5).map((item) => <li key={item.athleteId}><b>{item.rank}</b><span><strong>{item.name}</strong><small>{item.club}</small></span><em>{new Intl.NumberFormat("vi-VN").format(item.points)}</em></li>)}</ol> : <EmptyState title="Bảng xếp hạng đang được cập nhật" description="Điểm và thứ hạng sẽ xuất hiện sau khi dữ liệu chính thức được công bố." compact />}
          </div>
        </section>

        <section className="software-section">
          <div data-reveal><h2>Điều hành giải đấu,<br />từ một hệ thống.</h2><p>K-SPORT kết nối thiết lập nội dung, điều phối trận đấu và công bố kết quả trong một luồng vận hành.</p><Link className="button red" href="/software">Khám phá phần mềm <span aria-hidden="true">→</span></Link></div>
          <div className="control-ui" data-ui data-reveal>
            <header><b>K-SPORT</b><span>Điều hành trận đấu</span><i>Chờ dữ liệu trận</i></header>
            <div className="control-score"><section><small>Aka</small><strong>Chưa chọn vận động viên</strong><b>–</b></section><time>00:00</time><section><small>Ao</small><strong>Chưa chọn vận động viên</strong><b>–</b></section></div>
            <footer><span>Đăng ký</span><span>Bốc thăm</span><span>Điều hành</span><span>Kết quả</span></footer>
          </div>
        </section>

        <section className="cta-band" data-reveal>
          <Image src="/images/karate-venue.png" alt="Nhà thi đấu Karate" width={1536} height={1024} />
          <div><h2>Sẵn sàng vận hành giải đấu.</h2><p>Trao đổi về quy mô, nội dung thi và phạm vi vận hành phù hợp.</p><Link className="button light" href="/contact">Liên hệ K-SPORT <span aria-hidden="true">→</span></Link><a href="mailto:lienhe@k-sport.net">lienhe@k-sport.net</a></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
