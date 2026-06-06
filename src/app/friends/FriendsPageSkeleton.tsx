export default function FriendsPageSkeleton() {
  return (
    <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 flex flex-col gap-2 flex-1 w-full min-h-screen overflow-hidden">
      <div className="shrink-0 h-[5%]">
        <div className="h-12 w-40 rounded-md bg-gray-200 dark:bg-neutral-700 animate-pulse" />
      </div>

      <div className="flex gap-2 flex-1 min-h-0 text-xl">
        <div className="w-full rounded-lg mt-2 text-black dark:text-gray-100 flex flex-col min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-full min-h-0 animate-pulse">
            <div className="col-span-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-4 flex flex-col gap-4 h-full min-h-0">
              <div className="bg-white dark:bg-neutral-850 rounded-lg p-2 flex flex-col gap-4 h-[35%] min-h-[12rem] shrink-0">
                <div className="h-8 w-52 self-end rounded-md bg-gray-200 dark:bg-neutral-700" />
                <div className="grid grid-cols-2 gap-4 w-full flex-1 min-h-0 auto-rows-fr">
                  <div className="rounded-lg bg-gray-200 dark:bg-neutral-700 h-24" />
                  <div className="rounded-lg bg-gray-200 dark:bg-neutral-700 h-24" />
                  <div className="rounded-lg bg-gray-200 dark:bg-neutral-700 h-24" />
                  <div className="rounded-lg bg-gray-200 dark:bg-neutral-700 h-24" />
                </div>
              </div>

              <div className="flex-1 min-h-0 bg-white dark:bg-neutral-850 rounded-lg px-8 py-5 flex flex-col gap-4">
                <div className="h-8 w-36 rounded-md bg-gray-200 dark:bg-neutral-700" />
                <div className="flex flex-col justify-between gap-3 flex-1 min-h-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 content-start flex-1 min-h-0">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="col-span-1 rounded-lg bg-gray-200 dark:bg-neutral-700 h-20"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-4 flex flex-col gap-4 h-full min-h-0">
              <div className="bg-white dark:bg-neutral-850 rounded-lg p-2 flex flex-col gap-4 h-full min-h-0">
                <div className="h-8 w-48 rounded-md bg-gray-200 dark:bg-neutral-700" />
                <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 shrink-0 rounded-lg bg-gray-200 dark:bg-neutral-700"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
