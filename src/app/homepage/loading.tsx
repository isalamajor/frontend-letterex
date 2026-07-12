export default function Loading() {
  return (
    <div className="flex flex-col sm:flex-row gap-2 flex-1 sm:h-[90%]">
      <SkeletonBlock />
      <SkeletonBlock />
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
