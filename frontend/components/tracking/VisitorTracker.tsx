"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type NavigatorWithConnection = Navigator & {
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
};

const toBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") {
    return value;
  }

  return undefined;
};

export default function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = `${pathname}?${searchParams.toString()}`;

    if (lastTrackedKeyRef.current === key) {
      return;
    }

    lastTrackedKeyRef.current = key;

    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection;

    const payload = {
      actorRole: pathname.startsWith("/admin") ? "ADMIN" : "ANON",
      path: key,
      title: document.title,
      referrer: document.referrer || null,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      touchPoints: nav.maxTouchPoints,
      language: nav.language,
      languages: nav.languages,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      doNotTrack: nav.doNotTrack === "1",
      cookiesEnabled: nav.cookieEnabled,
      javaEnabled:
        typeof nav.javaEnabled === "function"
          ? toBoolean(nav.javaEnabled())
          : undefined,
      darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches,
      connectionType: connection?.effectiveType,
      connectionSpeed: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
    };

    void fetch(`${API_BASE_URL}/api/visitors/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Silent fail: analytics should never break the UI.
    });
  }, [pathname, searchParams]);

  return null;
}
