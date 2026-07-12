type AppPageSkeletonProps = {
  titleWidthClass?: string;
  contentHeightClass?: string;
};

export default function AppPageSkeleton({
  titleWidthClass = "w-56",
  contentHeightClass = "h-[55vh]",
}: AppPageSkeletonProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 flex-1 sm:h-[90%]">
      <SkeletonBlock />
      <SkeletonBlock />
    </div>
  );
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

export const SkeletonBlock = () => (
  <div className="flex-1 w-full rounded-lg bg-gray-100 dark:bg-neutral-800 px-8 animate-pulse">
    {/* Título */}
    <div className="h-7 w-40 bg-gray-200 dark:bg-neutral-600 rounded my-4" />
    {/* Barra de búsqueda + botones */}
    <div className="flex gap-2 mb-4">
      <div className="h-10 w-64 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
      <div className="h-10 w-24 bg-gray-200 dark:bg-neutral-700 rounded  animate-pulse" />
      <div className="h-10 w-24 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
    </div>
    {/* Cards */}
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="h-30 w-full bg-gray-200 dark:bg-neutral-700 rounded mb-3 animate-pulse"
      />
    ))}
  </div>
);
