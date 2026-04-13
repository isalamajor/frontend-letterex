type AppPageSkeletonProps = {
  titleWidthClass?: string;
  contentHeightClass?: string;
};

export default function AppPageSkeleton({
  titleWidthClass = "w-56",
  contentHeightClass = "h-[55vh]",
}: AppPageSkeletonProps) {
  return (
    <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-4 flex-1 w-full h-screen">
      <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 p-6 animate-pulse">
        <div
          className={`h-12 ${titleWidthClass} rounded-md bg-gray-200 dark:bg-neutral-700 mb-6`}
        />
        <div className="grid gap-3 md:grid-cols-3 mb-6">
          <div className="h-16 rounded-md bg-gray-200 dark:bg-neutral-700" />
          <div className="h-16 rounded-md bg-gray-200 dark:bg-neutral-700" />
          <div className="h-16 rounded-md bg-gray-200 dark:bg-neutral-700" />
        </div>
        <div
          className={`${contentHeightClass} rounded-md bg-gray-200 dark:bg-neutral-700 mb-6`}
        />
        <div className="flex justify-between gap-4">
          <div className="h-10 w-24 rounded-md bg-gray-200 dark:bg-neutral-700" />
          <div className="h-10 w-32 rounded-md bg-gray-200 dark:bg-neutral-700" />
        </div>
      </div>
    </div>
  );
}
