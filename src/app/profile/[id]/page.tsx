"use client";
import { use } from "react";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner-1";

const ProfilePageContent = dynamic(() => import("../ProfilePagecontent"), {
  loading: () => <Spinner />,
});

export default function Home({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProfilePageContent id={id} />;
}
