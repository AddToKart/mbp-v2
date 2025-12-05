import { notFound } from "next/navigation";
import { Metadata } from "next";
import { fetchPostDetail, fetchPostSummaries } from "@/lib/posts";
import AnnouncementDetail from "@/components/AnnouncementDetail";
import { ArticleSchema, BreadcrumbSchema } from "@/components/StructuredData";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://santamaria.gov.ph";

export async function generateStaticParams() {
  const posts = await fetchPostSummaries(30);

  return posts.map((post) => ({
    id: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchPostDetail(id);

  if (!post) {
    return {
      title: "Announcement Not Found",
    };
  }

  const ogImage = post.image.startsWith("http")
    ? post.image
    : `${siteUrl}${post.image}`;

  return {
    title: post.title,
    description: post.excerpt,
    keywords: [post.category, "Santa Maria", "announcement", "municipal"],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `${siteUrl}/announcement/${id}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.date,
      authors: [post.author.name],
      section: post.category,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
    alternates: {
      canonical: `${siteUrl}/announcement/${id}`,
    },
  };
}

export default async function AnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await fetchPostDetail(id);

  if (!post) {
    notFound();
  }

  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "Announcements", url: `${siteUrl}/announcements` },
    { name: post.title, url: `${siteUrl}/announcement/${id}` },
  ];

  const ogImage = post.image.startsWith("http")
    ? post.image
    : `${siteUrl}${post.image}`;

  return (
    <>
      <ArticleSchema
        title={post.title}
        description={post.excerpt}
        url={`${siteUrl}/announcement/${id}`}
        image={ogImage}
        datePublished={post.date}
        author={post.author}
        category={post.category}
      />
      <BreadcrumbSchema items={breadcrumbs} />
      <AnnouncementDetail post={post} />
    </>
  );
}
