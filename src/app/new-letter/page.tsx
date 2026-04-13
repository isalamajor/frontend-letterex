"use client";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner-1";

const NewLetterPageContent = dynamic(() => import("./NewLetterPageContent"), {
  loading: () => (
    <div className="bg-white rounded-lg p-4 h-full flex items-center justify-center text-gray-500">
      <Spinner />
    </div>
  ),
});

export default function Home() {
  return <NewLetterPageContent />;
}
