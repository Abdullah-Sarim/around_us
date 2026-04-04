export default function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-base-content/10 rounded-lg ${className}`} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card bg-base-300">
      <div className="px-4 pt-4">
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
      <div className="card-body p-4 space-y-3">
        <Skeleton className="h-5 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
        <Skeleton className="h-6 w-1/3 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-12 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ProductPageSkeleton() {
  return (
    <div className="max-w-6xl sm:px-2 px-1 mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-20 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded" />
          <Skeleton className="h-9 w-20 rounded" />
          <Skeleton className="h-9 w-24 rounded" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card bg-base-300">
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
        <div className="card bg-base-300">
          <div className="card-body space-y-4">
            <Skeleton className="h-8 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/3 rounded" />
            <Skeleton className="h-10 w-1/2 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <div className="divider" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductListSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40 rounded" />
          <Skeleton className="h-4 w-60 rounded" />
        </div>
        <Skeleton className="h-10 w-32 rounded" />
      </div>
      <div className="stats bg-base-300 w-full flex">
        <div className="stat flex-1">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-8 w-10 rounded mt-2" />
        </div>
        <div className="stat flex-1">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-8 w-10 rounded mt-2" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-24 rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card card-side bg-base-300">
            <figure className="w-30 sm:w-50">
              <Skeleton className="h-full w-full" />
            </figure>
            <div className="card-body p-2 sm:p-4 space-y-2">
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-5 w-1/3 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-16 rounded" />
                <Skeleton className="h-8 w-16 rounded" />
                <Skeleton className="h-8 w-16 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatPageSkeleton() {
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="w-1/3 bg-base-300 rounded-lg p-4 space-y-4">
        <Skeleton className="h-8 w-3/4 rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 bg-base-300 rounded-lg p-4 flex flex-col">
        <div className="flex-1 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <Skeleton className={`h-12 ${i % 2 === 0 ? 'w-48' : 'w-36'} rounded-2xl`} />
            </div>
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-lg mt-4" />
      </div>
    </div>
  );
}
