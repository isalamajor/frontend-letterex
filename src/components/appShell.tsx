"use client";

import React, { useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebarex } from "@/components/sidebarex";
import AppPageSkeleton from "@/components/appPageSkeleton";
import { UserContext } from "@/context/userContext";
import { getUserData } from "@/services/api";
import { isUserComplete } from "@/lib/utils";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userData, setUserData } = useContext(UserContext);
  const [isCheckingAuth, setIsCheckingAuth] = useState(pathname !== "/");

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      if (pathname === "/") {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
        return;
      }

      if (isUserComplete(userData)) {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
        return;
      }

      const result = await getUserData();
      if (!isMounted) return;

      if (result.ok && result.data) {
        setUserData(result.data);
        setIsCheckingAuth(false);
        return;
      }

      router.replace("/");
    };

    setIsCheckingAuth(pathname !== "/");
    validateSession();

    return () => {
      isMounted = false;
    };
  }, [pathname, router, setUserData, userData]);

  if (pathname === "/") {
    return <>{children}</>;
  }

  if (isCheckingAuth) {
    return <AppPageSkeleton />;
  }

  return <Sidebarex>{children}</Sidebarex>;
}
