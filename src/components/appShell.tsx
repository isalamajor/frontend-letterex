"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarDemo } from "@/components/sidebardemo";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/") {
    return <>{children}</>;
  }

  return <SidebarDemo>{children}</SidebarDemo>;
}
