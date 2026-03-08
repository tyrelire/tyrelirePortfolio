import { useCallback, useState } from "react";
import { apiRequest } from "../_lib/api";

type VisitorSummary = {
  visitorsCount: number;
  pageViewsCount: number;
  eventsCount: number;
};

type VisitorItem = {
  id: number;
  sessionId: string;
  actorRole: "ANON" | "ADMIN";
  isAuthenticated: boolean;
  ownerPseudo: string | null;
  ip: string | null;
  country: string | null;
  city: string | null;
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  osVersion: string | null;
  device: string | null;
  language: string | null;
  timezone: string | null;
  isBot: boolean | null;
  firstSeenAt: string;
  lastSeenAt: string;
  _count: {
    pageViews: number;
    events: number;
  };
};

export function useVisitorsAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<VisitorSummary | null>(null);
  const [visitors, setVisitors] = useState<VisitorItem[]>([]);

  const loadVisitors = useCallback(
    async (options?: { keepLoadingOnFail?: boolean }): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const [summaryData, visitorsData] = await Promise.all([
          apiRequest<VisitorSummary>("/api/visitors/summary", {
            method: "GET",
          }),
          apiRequest<VisitorItem[]>("/api/visitors?take=50", { method: "GET" }),
        ]);

        setSummary(summaryData);
        setVisitors(visitorsData);
        setLoading(false);
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load visitors",
        );
        if (!options?.keepLoadingOnFail) {
          setLoading(false);
        }
        return false;
      }
    },
    [],
  );

  return { loading, error, summary, visitors, loadVisitors };
}
