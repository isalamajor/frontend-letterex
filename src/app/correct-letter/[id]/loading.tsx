export default function Loading() {
  return (
    <div className="rounded-tl-2xl bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 w-full h-screen flex justify-center items-center">
      <div className="w-[95%] h-[90%] rounded-lg bg-gray-100 dark:bg-neutral-800 p-6 sm:p-10 animate-pulse flex flex-col gap-6">
        {/* Información del remitente */}
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-neutral-700 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-neutral-700" />
            <div className="h-3 w-40 rounded bg-gray-200 dark:bg-neutral-700" />
          </div>
        </div>

        {/* Contenido de la carta */}
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-neutral-700" />
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-neutral-700" />
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-neutral-700" />
        </div>

        {/* Sección de correcciones */}
        <div className="mt-auto">
          <div className="h-6 w-40 rounded-md bg-gray-200 dark:bg-neutral-700 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-gray-200 dark:bg-neutral-700 h-16"
              />
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3">
          <div className="h-10 w-28 rounded-md bg-gray-200 dark:bg-neutral-700" />
          <div className="h-10 w-32 rounded-md bg-gray-200 dark:bg-neutral-700" />
        </div>
      </div>
    </div>
  );
}
