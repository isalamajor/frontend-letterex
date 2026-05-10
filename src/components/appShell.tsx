"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebarex } from "@/components/sidebarex";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/") {
    return <>{children}</>;
  }

  return <Sidebarex>{children}</Sidebarex>;
}
