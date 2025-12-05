import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://santamaria.gov.ph";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/announcements`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Fetch dynamic announcement pages
  let announcementPages: MetadataRoute.Sitemap = [];

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
    const response = await fetch(`${apiUrl}/api/posts?limit=100`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (response.ok) {
      const data = await response.json();
      const posts = data.posts || data || [];

      announcementPages = posts.map(
        (post: { slug: string; updatedAt?: string; createdAt?: string }) => ({
          url: `${siteUrl}/announcement/${post.slug}`,
          lastModified: new Date(
            post.updatedAt || post.createdAt || Date.now()
          ),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })
      );
    }
  } catch (error) {
    console.error("Failed to fetch posts for sitemap:", error);
  }

  return [...staticPages, ...announcementPages];
}
