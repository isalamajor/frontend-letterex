"use client";
import React, { useContext, useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  UserCog,
  Handshake,
  LogOut,
  LeafyGreen,
  Moon,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useDialog } from "@/context/dialogContext";
import { logout } from "@/services/api";
import { UserContext } from "@/context/userContext";

export function SidebarDemo({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const router = useRouter();
  const pathname = usePathname();
  const { openDialog } = useDialog();
  const { clear } = useContext(UserContext);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const nextTheme =
        storedTheme === "dark" || storedTheme === "light"
          ? storedTheme
          : prefersDark
            ? "dark"
            : "light";

      setTheme(nextTheme);
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
    } catch (_error) {
      // Ignore localStorage/window errors in restricted environments.
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    try {
      localStorage.setItem("theme", nextTheme);
    } catch (_error) {
      // Ignore localStorage errors.
    }
  };

  const handleLogoutClick = async (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();

    const res = await logout();
    if (res.ok) {
      openDialog({
        type: "bye",
        title: "Bye!",
        description: "See you soon :)",
        autoDismiss: true,
        autoDismissDelay: 1000,
        showCloseButton: false,
        size: "sm",
      });
      clear();
    } else {
      openDialog({
        type: "error",
        title: "Logout Error",
        description: "A server error occurred when logging out",
        autoDismiss: true,
        autoDismissDelay: 2000,
        showCloseButton: false,
      });
    }
    router.replace("/");
  };

  const links = [
    {
      label: "Dashboard",
      href: "/homepage",
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      prefetch: true,
    },
    {
      label: "Profile",
      href: "/profile/me",
      icon: (
        <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      prefetch: true,
    },
    {
      label: "Friends",
      href: "/friends",
      icon: (
        <Handshake className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      prefetch: true,
    },
    {
      label: "Logout",
      href: "/",
      icon: (
        <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      onClick: handleLogoutClick,
    },
  ];
  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-screen flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-auto lg:overflow-hidden ",
        "h-min-screen lg:h-screen",
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={toggleTheme}
              className="group/sidebar mb-3 flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-neutral-700 dark:text-neutral-200"
              aria-label="Toggle dark mode"
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 flex-shrink-0" />
              ) : (
                <Moon className="h-5 w-5 flex-shrink-0" />
              )}
              {open && (
                <span className="group-hover/sidebar:font-semibold">
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </span>
              )}
            </button>
            <SidebarLink
              link={{
                label: "Letterex",
                href: "/homepage",
                icon: (
                  <Image
                    src="/logo-frog.png"
                    className="h-7 w-7 flex-shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      {/*<Dashboard/>*/}
      <div className="flex-1">{children}</div>
    </div>
  );
}

export const Logo = () => {
  const { userData } = useContext(UserContext);
  const userName = userData.nickname || "Letterex";

  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        {userName}
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
