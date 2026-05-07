"use client";
import { use } from "react";
import dynamic from "next/dynamic";
import AppPageSkeleton from "@/components/appPageSkeleton";

const ProfilePageContent = dynamic(() => import("../ProfilePagecontent"), {
  loading: () => (
    <AppPageSkeleton titleWidthClass="w-64" contentHeightClass="h-[52vh]" />
  ),
});

export default function Home({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProfilePageContent id={id} />;
}
