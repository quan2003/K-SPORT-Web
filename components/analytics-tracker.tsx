"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const DEVICE_ID_KEY = "ksport_device_id_v1";

function getOrCreateDeviceId(): string {
  try {
    let did = localStorage.getItem(DEVICE_ID_KEY);
    if (!did) {
      did = crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(DEVICE_ID_KEY, did);
    }
    return did;
  } catch {
    return "";
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const deviceId = getOrCreateDeviceId();
    const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
    const platformHint = nav.userAgentData?.platform || "";

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, sessionId: deviceId, platformHint }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
