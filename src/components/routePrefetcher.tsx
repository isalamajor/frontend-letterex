"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const routesToPrefetch = [
  "/homepage",
  "/new-letter",
  "/friends",
  "/community",
  "/profile/yours",
];

export function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    routesToPrefetch.forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

  return null;
}
