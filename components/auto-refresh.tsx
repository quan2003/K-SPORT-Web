"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Re-renders the current Server Component while the tab is visible.
 * Used on match-day screens so a scanned athlete pass shows new scores
 * without a manual reload. Pauses when the tab is hidden.
 */
export function AutoRefresh({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    let timer: number | undefined;
    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => router.refresh(), intervalMs);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
        start();
      } else {
        window.clearInterval(timer);
      }
    };
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intervalMs, router]);

  return null;
}

