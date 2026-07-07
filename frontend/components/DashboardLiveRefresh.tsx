"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const REFRESH_MS = 5 * 60 * 1000;

/** Recharge les Server Components du dashboard toutes les 5 min (V2.1). */
export function DashboardLiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), REFRESH_MS);
    return () => clearInterval(id);
  }, [router]);

  return null;
}
