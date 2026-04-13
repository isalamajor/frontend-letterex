export default function Loading() {
  return (
    <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-4 flex-1 w-full h-screen overflow-auto">
      <div className="w-full rounded-lg bg-gray-100 dark:bg-neutral-800 p-6 animate-pulse">
        {/* Título */}
        <div className="h-8 w-40 rounded-md bg-gray-200 dark:bg-neutral-700 mb-8" />

        {/* Secciones de pestañas */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="h-10 rounded-lg bg-gray-200 dark:bg-neutral-700" />
          <div className="h-10 rounded-lg bg-gray-200 dark:bg-neutral-700" />
        </div>

        {/* Búsqueda */}
        <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-neutral-700 mb-6" />

        {/* Cards de amigos */}
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-lg bg-gray-200 dark:bg-neutral-700"
            >
              <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-neutral-600" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 rounded bg-gray-300 dark:bg-neutral-600" />
                <div className="h-3 w-32 rounded bg-gray-300 dark:bg-neutral-600" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
