import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { fetchPostSummaries } from "@/lib/posts";
import BlogGridClient from "./BlogGrid.client";

export default async function BlogGrid() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["posts", "summary", 6],
    queryFn: () => fetchPostSummaries(6),
  });

  const posts = queryClient.getQueryData(["posts", "summary", 6]) as any[];

  if (!posts || posts.length === 0) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8" aria-live="polite">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border/60 bg-card/70 p-10 text-center shadow-lg backdrop-blur">
          <h2 className="text-2xl font-semibold text-foreground">
            Latest posts are temporarily unavailable
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            The content service didn&apos;t respond in time. Your page is still
            operational, but dynamic updates will appear once the backend is
            reachable again.
          </p>
        </div>
      </section>
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BlogGridClient />
    </HydrationBoundary>
  );
}
