export default function Loading() {
  return <ProfileSkeleton />;
}

export function ProfileSkeleton() {
  return (
    <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-4 flex-1 w-full h-screen overflow-auto">
      <div className="w-full rounded-lg bg-gray-100 dark:bg-neutral-800 p-6 animate-pulse pt-20">
        {/* Avatar y nombre del perfil */}
        <div className="text-center mb-8 flex flex-row gap-1 w-full ">
          <div className="h-30 w-30 rounded-full bg-gray-200 dark:bg-neutral-700 mx-auto mb-4" />
          <div>
            <div className="h-8 w-70 rounded-md bg-gray-200 dark:bg-neutral-700 mx-auto mb-2" />
            <div className="h-8 w-70 rounded-md bg-gray-200 dark:bg-neutral-700 mx-auto" />
          </div>
          <div className="h-40 w-150 rounded-md bg-gray-200 dark:bg-neutral-700 mx-auto" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="text-center p-4 rounded-lg bg-gray-200 dark:bg-neutral-700"
            >
              <div className="h-6 w-12 rounded bg-gray-300 dark:bg-neutral-600 mx-auto mb-2" />
              <div className="h-4 w-16 rounded bg-gray-300 dark:bg-neutral-600 mx-auto" />
            </div>
          ))}
        </div>

        {/* Descripción */}
        <div className="mb-8">
          <div className="h-4 w-32 rounded-md bg-gray-200 dark:bg-neutral-700 mb-2" />
          <div className="h-16 w-full rounded-lg bg-gray-200 dark:bg-neutral-700" />
        </div>

        {/* Cartas */}
        <div className="mb-6">
          <div className="h-6 w-full rounded-md bg-gray-200 dark:bg-neutral-700 mb-4" />
          <div className="w-full grid gap-4 grid-cols-2">
            <div className="w-full h-70 rounded bg-gray-200 dark:bg-neutral-600 flex-shrink-0" />
            <div className="w-full h-70 rounded bg-gray-200 dark:bg-neutral-600 flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
