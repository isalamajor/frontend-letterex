"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LayoutDashboard, UserCog, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import "../stylesheets/sidebardemo.css";
import { BsPlus } from "react-icons/bs";

export function SidebarDemo({ children }: { children: React.ReactNode }) {
  const links = [
    {
      label: "Dashboard",
      href: "#",
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Profile",
      href: "#",
      icon: (
        <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <div
    className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-screen flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}
      
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Letterex",
                href: "#",
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
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Acet Labs
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

// Dummy dashboard component with content
const Dashboard = () => {
  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex gap-2">
          <img src="letter-logo.png" className="h-25 mx-auto mt-4"/>
        </div>
        <div className="flex gap-2 flex-1">
            <div
              className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 px-6"
            >
             <h2
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#57A02D] via-[#39c167] to-[#004D40] p-4 transition-transform duration-300 animate-gradient"
              >
                Letters written
              </h2>

              <div className="flex justify-end">
                <Link href={"/new-letter"}>
                  <button className="text-gray-700 border border-lightblack rounded-sm bg-gray-150 dark:bg-neutral-800 shadow-md py-2 px-4 mb-4 hover:bg-gray-50">
                    💌 New
                  </button>
                </Link>
              </div>

              {/* Card with letter details */}
              <div className="px-8 py-4 rounded-lg bg-gray-50 dark:bg-neutral-800 shadow-md">
                  
                  <div className="flex items-center justify-between mb-4">
                    {/* Fecha */}
                    <p className="text-s text-gray-500 dark:text-gray-400 mb-2">12/07/2025</p>

                    {/* Texto principal */}
                    <p className="highlighted-text font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Name of the Diary 
                    </p>
                  </div>

                  <div className="flex justify-between ">
                    {/* Título de la carta */}
                    <h4 className="text-xl items-center text-gray-700 font-bold dark:text-gray-400">
                      Letter title
                    </h4>

                    {/* Imágenes pequeñas */}
                    <div className="flex items-center gap-2">
                      <img
                        src="/flags/spanish.png"
                        alt="-"
                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
                      />
                      <img
                        src="defaultpp.webp"
                        alt="-"
                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </div>
              </div>
            </div>
            <div
              className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800"
            >
              <h2 className="text-right text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#242424] via-[#333333] to-[#4d4d4d] p-4 transition-transform duration-300 animate-gradient-dark"
              >
              Letters received  
              </h2>
            </div>
        </div>
      </div>
    </div>
  );
};

