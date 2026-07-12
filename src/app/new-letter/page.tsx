"use client";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner";
import NewLetterSkeleton from "./loading";

const NewLetterPageContent = dynamic(() => import("./NewLetterPageContent"), {
  loading: () => <NewLetterSkeleton />,
});

export default function Home() {
  return <NewLetterPageContent />;
}
