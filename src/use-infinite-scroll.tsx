import { useCallback, useEffect, useRef, useState } from "react";

// interface Identifiable {
//   id?: string;
//   _id?: string;
//   name?: string;
//   slug?: string;
//   [key: string]: unknown;
// }

interface InfiniteScrollProps<T> {
  initialData: T[];
  initialPage: number;
  hasNextPage: boolean;
  maxAttempts: number;
  threshold: number;
  fallbackData: T[];
  fetchMore: ({ page }: { page: number }) => Promise<{ data: T[] }>;
  onMaxAttemptsReached?: () => void;
  idKey?: string;
}

function uniqueByObjectKey<T>(arr: T[], idKey: string) {
  if (
    !idKey ||
    !arr.length ||
    typeof idKey !== "string" ||
    !Object.prototype.hasOwnProperty.call(arr[0], idKey)
  )
    return arr;

  const seen = new Set();
  return arr.filter((item) => {
    const key = item[idKey as keyof T];
    if (!key || seen.has(key)) return false;
    seen.add(idKey);
    return true;
  });
}

export const useInfiniteScroll = <T,>({
  idKey,
  initialData = [],
  initialPage = 1,
  fetchMore,
  fallbackData,
  hasNextPage,
  threshold = 0.5,
  maxAttempts = 3,
  onMaxAttemptsReached,
}: InfiniteScrollProps<T>) => {
  const [data, setData] = useState<T[]>(initialData);
  const [page, setPage] = useState<number>(initialPage);
  const [error, setError] = useState<Error | unknown | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const attempts = useRef<number>(0);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadMoreData = useCallback(async () => {
    if (loading || attempts.current >= maxAttempts || !hasNextPage) return;

    setLoading(true);
    attempts.current += 1;

    try {
      const res = await fetchMore({ page });
      const { data: newData } = res;

      let uniqueData: T[];

      if (idKey) {
        uniqueData = uniqueByObjectKey([...data, ...newData], idKey);
      } else {
        uniqueData = [...data, ...newData];
      }

      setData(uniqueData);
      setPage((prevPage) => prevPage + 1);
    } catch (error: unknown) {
      if (attempts.current >= maxAttempts && onMaxAttemptsReached) {
        onMaxAttemptsReached();
      }

      setError(error);
      setData((prevData) => [...prevData, ...fallbackData]);
    } finally {
      setLoading(false);
    }
  }, [
    fetchMore,
    page,
    hasNextPage,
    loading,
    maxAttempts,
    onMaxAttemptsReached,
    fallbackData,
    data,
    idKey,
  ]);

  useEffect(() => {
    console.log(hasNextPage, loading, loadMoreRef.current);
    if (!hasNextPage || loading || !loadMoreRef.current) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreData();
        }
      },
      { threshold: threshold }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.current.observe(currentRef);
    }

    return () => {
      if (observer.current && currentRef) {
        observer.current.unobserve(currentRef);
      }
    };
  }, [loadMoreData, threshold, hasNextPage, loading]);

  return {
    page,
    data,
    error,
    loading,
    loadMoreRef,
    hasNextPage,
  };
};
