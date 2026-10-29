import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InternalLayout } from "@/components/portal-ui";
import { ContentImage } from "@/components/content-image";
import { getNews, getNewsItem } from "@/lib/public-data";

export async function generateStaticParams() { return (await getNews()).map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const item = await getNewsItem((await params).slug);
  return item ? { title: item.title, description: item.summary } : { title: "Tin tức" };
}

export default async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getNewsItem(slug);
  if (!item) notFound();
  return (
    <InternalLayout>
      <article className="article-detail"><header><h1>{item.title}</h1><p>{item.summary}</p><time dateTime={item.publishedAt}>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(new Date(item.publishedAt))}</time></header><ContentImage src={item.image} alt="" width={1536} height={1024} fetchPriority="high" /><div className="prose">{item.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></article>
    </InternalLayout>
  );
}
