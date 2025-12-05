"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UsePaginationOptions<T> {
  /**
   * Function to fetch a page of data
   */
  fetchPage: (page: number, pageSize: number) => Promise<T[]>;
  /**
   * Number of items per page
   */
  pageSize?: number;
  /**
   * Initial page number (1-based)
   */
  initialPage?: number;
}

interface UsePaginationResult<T> {
  items: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  page: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook for paginated data fetching with load-more support
 */
export function usePagination<T>({
  fetchPage,
  pageSize = 10,
  initialPage = 1,
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadPage = useCallback(
    async (pageNum: number, append: boolean = false) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const data = await fetchPage(pageNum, pageSize);

        if (!isMounted.current) return;

        if (append) {
          setItems((prev) => [...prev, ...data]);
        } else {
          setItems(data);
        }

        setHasMore(data.length >= pageSize);
        setPage(pageNum);
      } catch (err) {
        if (!isMounted.current) return;
        setError(
          err instanceof Error ? err : new Error("Failed to fetch data")
        );
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [fetchPage, pageSize]
  );

  // Initial load
  useEffect(() => {
    loadPage(initialPage);
  }, [loadPage, initialPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    await loadPage(page + 1, true);
  }, [isLoadingMore, hasMore, page, loadPage]);

  const refresh = useCallback(async () => {
    setPage(initialPage);
    await loadPage(initialPage);
  }, [loadPage, initialPage]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    setIsLoading(true);
    loadPage(initialPage);
  }, [loadPage, initialPage]);

  return {
    items,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    page,
    loadMore,
    refresh,
    reset,
  };
}

/**
 * Hook for infinite scroll with intersection observer
 */
export function useInfiniteScroll(
  loadMore: () => void,
  options: {
    enabled?: boolean;
    threshold?: number;
    rootMargin?: string;
  } = {}
) {
  const { enabled = true, threshold = 0.1, rootMargin = "100px" } = options;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef(loadMore);

  // Keep loadMore ref up to date
  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!enabled || !node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            loadMoreRef.current();
          }
        },
        { threshold, rootMargin }
      );

      observerRef.current.observe(node);
    },
    [enabled, threshold, rootMargin]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return setRef;
}

export default usePagination;
