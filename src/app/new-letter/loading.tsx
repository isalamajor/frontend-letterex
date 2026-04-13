export default function Loading() {
  return (
    <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-4 flex-1 w-full h-screen overflow-auto">
      <div className="w-full rounded-lg bg-gray-100 dark:bg-neutral-800 p-6 animate-pulse">
        {/* Título */}
        <div className="h-8 w-48 rounded-md bg-gray-200 dark:bg-neutral-700 mb-8" />

        {/* Selector de idioma */}
        <div className="mb-6">
          <div className="h-5 w-32 rounded-md bg-gray-200 dark:bg-neutral-700 mb-3" />
          <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-neutral-700" />
        </div>

        {/* Selector de destinatario */}
        <div className="mb-6">
          <div className="h-5 w-40 rounded-md bg-gray-200 dark:bg-neutral-700 mb-3" />
          <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-neutral-700" />
        </div>

        {/* Asunto */}
        <div className="mb-6">
          <div className="h-5 w-20 rounded-md bg-gray-200 dark:bg-neutral-700 mb-3" />
          <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-neutral-700" />
        </div>

        {/* Editor de contenido */}
        <div className="mb-6">
          <div className="h-5 w-24 rounded-md bg-gray-200 dark:bg-neutral-700 mb-3" />
          <div className="h-64 w-full rounded-lg bg-gray-200 dark:bg-neutral-700" />
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
