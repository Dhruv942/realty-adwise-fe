"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Remembers the browser's timezone in a cookie so server-rendered lead pages can ask the API for the user's own "today". */
export function TimezoneSync() {
  const router = useRouter();
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz || document.cookie.split("; ").includes(`tz=${encodeURIComponent(tz)}`)) return;
    document.cookie = `tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);
  return null;
}
