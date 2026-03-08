import { useEffect, useRef } from "react";

export function useAutoRetryLoad(
  loadFn: (options?: { keepLoadingOnFail?: boolean }) => Promise<boolean>,
  retryMs: number,
  enabled = true,
): void {
  const loadFnRef = useRef(loadFn);

  useEffect(() => {
    loadFnRef.current = loadFn;
  }, [loadFn]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const attemptLoad = async () => {
      if (cancelled) {
        return;
      }

      const isLoaded = await loadFnRef.current({ keepLoadingOnFail: true });
      if (!isLoaded && !cancelled) {
        retryTimer = setTimeout(() => {
          void attemptLoad();
        }, retryMs);
      }
    };

    void attemptLoad();

    return () => {
      cancelled = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [enabled, retryMs]);
}
