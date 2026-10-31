import Link from "next/link";
import type { Metadata } from "next";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { EmptyState } from "@/components/empty-state";
import { InternalLayout, PageHero } from "@/components/portal-ui";
import { getAthletes } from "@/lib/public-data";

export const metadata: Metadata = { title: "Vận động viên", description: "Hồ sơ thi đấu công khai của vận động viên Karate." };

const pageSize = 24;

function pageHref(page: number, query: string, category: string) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (category !== "all") params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const suffix = params.toString();
  return suffix ? `/athletes?${suffix}` : "/athletes";
}

export default async function AthletesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query.trim() : "";
  const category = typeof params.category === "string" ? params.category : "all";
  const requestedPage = typeof params.page === "string" ? Number.parseInt(params.page, 10) : 1;
  const athletes = await getAthletes();
  const normalizedQuery = query.toLocaleLowerCase("vi");
  const filteredAthletes = athletes.filter((athlete) =>
    (!normalizedQuery || athlete.name.toLocaleLowerCase("vi").includes(normalizedQuery) || athlete.club.toLocaleLowerCase("vi").includes(normalizedQuery)) &&
    (category === "all" || athlete.category.toLocaleLowerCase("vi").startsWith(category.toLocaleLowerCase("vi")))
  );
  const pageCount = Math.max(1, Math.ceil(filteredAthletes.length / pageSize));
  const currentPage = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
  const visibleAthletes = filteredAthletes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <InternalLayout>
      <PageHero title="Vận động viên" description="Tra cứu hồ sơ công khai theo tên, câu lạc bộ và nội dung thi đấu." image="/images/athlete-portrait.png" />
      <section className="content-section athlete-directory">
        <div className="directory-intro"><div><h2>Danh sách vận động viên</h2><p>Chỉ hiển thị tên, câu lạc bộ, nội dung và kết quả đã được phép công bố.</p></div><p><strong>{filteredAthletes.length}</strong> hồ sơ</p></div>
        <form className="filter-bar" method="get"><label>Tìm vận động viên hoặc câu lạc bộ<input name="query" type="search" placeholder="Nhập họ tên hoặc câu lạc bộ…" autoComplete="off" defaultValue={query} /></label><label>Loại nội dung<select name="category" defaultValue={category}><option value="all">Tất cả nội dung</option><option value="Kata">Kata</option><option value="Kumite">Kumite</option></select></label><button className="filter-submit" type="submit">Tìm kiếm</button></form>
        {visibleAthletes.length > 0 ? <>
          <div className="athlete-list">{visibleAthletes.map((athlete) => <Link href={`/athletes/${athlete.id}`} key={athlete.id}><AthleteAvatar name={athlete.name} src={athlete.image} /><div><h2>{athlete.name}</h2><p>{athlete.club}</p><small>{athlete.category}</small></div><span>Xem hồ sơ <span aria-hidden="true">→</span></span></Link>)}</div>
          {pageCount > 1 ? <nav className="pagination" aria-label="Phân trang vận động viên">
            {currentPage > 1 ? <Link className="pagination-control" href={pageHref(currentPage - 1, query, category)}><span aria-hidden="true">←</span> Trang trước</Link> : <span className="pagination-control is-disabled" aria-disabled="true"><span aria-hidden="true">←</span> Trang trước</span>}
            <span className="pagination-status">Trang <strong>{currentPage}</strong> trên {pageCount}</span>
            {currentPage < pageCount ? <Link className="pagination-control pagination-next" href={pageHref(currentPage + 1, query, category)}>Trang sau <span aria-hidden="true">→</span></Link> : <span className="pagination-control pagination-next is-disabled" aria-disabled="true">Trang sau <span aria-hidden="true">→</span></span>}
          </nav> : null}
        </> : <EmptyState title={athletes.length ? "Không tìm thấy vận động viên" : "Danh sách vận động viên đang được cập nhật"} description={athletes.length ? "Thử tên, câu lạc bộ hoặc loại nội dung khác." : "Hồ sơ sẽ xuất hiện sau khi dữ liệu công khai được đồng bộ và kiểm tra."} />}
      </section>
    </InternalLayout>
  );
}
