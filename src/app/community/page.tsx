"use client";
import React from "react";
import { SidebarDemo } from "@/components/sidebardemo";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner-1";

const CommunityPageContent = dynamic(() => import("./CommunityPageContent"), {
  loading: () => <Spinner />,
});

export default function Home() {
  return (
    <div className="page-container">
      <SidebarDemo>
        <CommunityPageContent />
      </SidebarDemo>
    </div>
  );
}
