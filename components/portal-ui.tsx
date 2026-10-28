import Image from "next/image";
import Link from "next/link";
import { getMatchDisplayState, type Match } from "@/lib/public-data";
import { EmptyState } from "@/components/empty-state";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HomeMotion } from "@/components/home-motion";

export function PageHero({ title, description, image = "/images/karate-venue.png", className = "" }: { title: string; description: string; image?: string; className?: string }) {
  return (
    <section className={`page-hero ${className}`.trim()}>
      <Image src={image} alt="" fill sizes="(max-width: 760px) 66vw, 52vw" priority />
      <div><h1>{className.includes("schedule-page-hero") ? <>LỊCH <em>THI ĐẤU</em></> : title}</h1><p>{description}</p></div>
    </section>
  );
}

export function MatchRows({ matches, results = false }: { matches: Match[]; results?: boolean }) {
  if (matches.length === 0) {
    return (
      <div className="match-list empty-table" data-ui>
        <div className="match-head" aria-hidden="true"><span>Thời gian</span><span>Tatami</span><span>Nội dung thi đấu</span><span>Aka (đỏ)</span><span>VS</span><span>Ao (xanh)</span><span>Trạng thái</span></div>
        <EmptyState
          title={results ? "Kết quả đang được cập nhật" : "Lịch thi đấu đang được cập nhật"}
          description={results ? "Kết quả chính thức sẽ xuất hiện sau khi được ban tổ chức công bố." : "Thông tin lịch thi đấu sẽ được hiển thị tại đây ngay khi có dữ liệu chính thức từ ban tổ chức."}
          compact
        />
      </div>
    );
  }

  return (
    <div className="match-list" data-ui>
      <div className="match-head" aria-hidden="true"><span>Thời gian</span><span>Tatami</span><span>Nội dung thi đấu</span><span>Aka (đỏ)</span><span>VS</span><span>Ao (xanh)</span><span>Trạng thái</span></div>
      {matches.map((match) => (
        <article className="match-row" key={match.id}>
          <time dateTime={`${match.date}T${match.time}`}><strong>{match.time}</strong><span>{new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${match.date}T00:00:00+07:00`))}</span></time>
          <strong>{match.tatami || "Chưa phân"}</strong>
          <div><strong>{match.category}</strong><span>{match.eventName ?? "Giải đấu K-SPORT"}</span></div>
          <div className="fighter aka-fighter"><span>{match.red}</span><b>{match.redScore ?? "–"}</b></div>
          <div className="versus" aria-label="đấu với">VS</div>
          <div className="fighter ao-fighter"><span>{match.blue}</span><b>{match.blueScore ?? "–"}</b></div>
          <span className="match-state">{results ? match.state : getMatchDisplayState(match)}</span>
        </article>
      ))}
    </div>
  );
}

export function InternalLayout({ children }: { children: React.ReactNode }) {
  return <><HomeMotion /><SiteHeader /><main id="main-content">{children}</main><SiteFooter /></>;
}

export function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link className="more-link" href={href}>{children}<span aria-hidden="true">→</span></Link>;
}
