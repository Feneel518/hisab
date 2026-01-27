import { Skeleton } from "@/components/ui/skeleton";

export default function loading() {
  return (
    <div className="p-4 sm:p-6">
      {/* Header + Toolbar */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-full sm:w-[260px]" />
            <Skeleton className="h-10 w-[140px]" />
            <Skeleton className="h-10 w-[140px]" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-full sm:w-[90px]" />
            <Skeleton className="h-10 w-full sm:w-[140px]" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">
        {/* Desktop table skeleton */}
        <div className="hidden md:block">
          <div className="rounded-xl border">
            <div className="flex items-center justify-between border-b p-3">
              <Skeleton className="h-4 w-40" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>

            <div className="p-3">
              <div className="grid grid-cols-7 gap-3 pb-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>

              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, r) => (
                  <div key={r} className="grid grid-cols-7 gap-3">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-8 w-10 justify-self-end" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile cards skeleton */}
        <div className="md:hidden space-y-3">
          <div className="flex items-center justify-between text-sm">
            <Skeleton className="h-4 w-44" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>

          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-52" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>

                <div className="mt-3 flex gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
