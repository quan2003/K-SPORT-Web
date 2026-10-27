import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { InternalLayout, PageHero } from "@/components/portal-ui";
import { getNews } from "@/lib/public-data";

export const metadata: Metadata = { title: "Tin tức", description: "Tin tức Karate được công bố trên cổng K-SPORT." };

const formatDate = (value: string) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));

export default async function NewsPage() {
  const news = await getNews();
  return (
    <InternalLayout>
      <PageHero title="Tin tức Karate" description="Thông tin, kiến thức và góc nhìn về hoạt động Karate." image="/images/karate-training.png" />
      <section className="content-section">
        {news.length > 0 ? <div className="article-index">{news.map((item, index) => <Link href={`/news/${item.slug}`} key={item.slug} className={index === 0 ? "large" : ""}><Image src={item.image} alt="" width={900} height={600} /><div><span>{item.category}</span><h2>{item.title}</h2><p>{item.summary}</p><time>{formatDate(item.publishedAt)}</time></div></Link>)}</div> : <div className="news-empty-layout"><Image src="/images/karate-training.png" alt="Trang phục và thảm tập Karate" width={1536} height={1024} /><EmptyState title="Tin tức đang được cập nhật" description="Các bài viết đã biên tập sẽ xuất hiện tại đây khi chuyên mục được kết nối dữ liệu." /></div>}
      </section>
    </InternalLayout>
  );
}
