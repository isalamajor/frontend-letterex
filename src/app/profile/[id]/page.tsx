"use client";
import { use } from "react";
import dynamic from "next/dynamic";
import { ProfileSkeleton } from "./loading";

const ProfilePageContent = dynamic(() => import("../ProfilePagecontent"), {
  loading: () => <ProfileSkeleton />,
});

export default function Home({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProfilePageContent id={id} />;
}
