import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { fetchPostSummaries } from "@/lib/posts";
import FeaturedAnnouncementsClient from "./FeaturedAnnouncements.client";

export default async function FeaturedAnnouncements() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["posts", "featured", 3],
    queryFn: () => fetchPostSummaries(3),
  });

  const posts = queryClient.getQueryData(["posts", "featured", 3]) as any[];

  if (!posts || posts.length === 0) {
    return (
      <section
        className="py-16 px-4 sm:px-6 lg:px-8"
        aria-live="polite"
        aria-busy="false"
      >
        <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-gradient-to-r from-background via-background/80 to-background/60 p-8 text-center shadow-lg">
          <p className="text-lg font-semibold text-foreground">
            Featured announcements are temporarily unavailable
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn't reach the announcements service. Please try again in a
            moment or refresh once the backend is online.
          </p>
        </div>
      </section>
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FeaturedAnnouncementsClient />
    </HydrationBoundary>
  );
}
