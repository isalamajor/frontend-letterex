export default function EditLetterSkeleton() {
  return (
    <div className="h-full p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-4 flex-1 w-full h-screen overflow-auto">
      <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 py-10 px-5 sm:px-20 animate-pulse">
        {/* Título */}
        <div className="h-8 w-48 rounded-md bg-gray-200 dark:bg-neutral-700 mb-8 mx-auto" />

        {/* Selector de idioma y estado */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg bg-gray-200 dark:bg-neutral-700"
            />
          ))}
        </div>

        {/* Editor de contenido */}
        <div className="mb-6">
          <div className="h-5 w-24 rounded-md bg-gray-200 dark:bg-neutral-700 mb-3" />
          <div className="h-140 w-full rounded-lg bg-gray-200 dark:bg-neutral-700" />
        </div>

        {/* Botones */}
        <div className="flex gap-3 justify-end">
          <div className="h-10 w-24 rounded-lg bg-gray-200 dark:bg-neutral-700" />
          <div className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-neutral-700" />
        </div>
      </div>
    </div>
  );
}
