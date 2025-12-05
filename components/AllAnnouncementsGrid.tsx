import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { fetchPostSummaries } from "@/lib/posts";
import AllAnnouncementsGridClient from "./AllAnnouncementsGrid.client";

export default async function AllAnnouncementsGrid() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["posts", "all", 60],
    queryFn: () => fetchPostSummaries(60),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AllAnnouncementsGridClient />
    </HydrationBoundary>
  );
}
