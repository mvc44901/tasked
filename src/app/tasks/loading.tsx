export default function TasksLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="h-9 w-28 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-10 w-full bg-gray-200 rounded-lg mb-6 animate-pulse" />
      <div className="flex gap-2 mb-8 flex-wrap">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-7 w-20 bg-gray-200 rounded-full animate-pulse" />
        ))}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="rounded-xl ring-1 ring-foreground/10 bg-card p-5 space-y-3 animate-pulse">
            <div className="flex items-start justify-between gap-2">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-5 bg-gray-200 rounded w-16 shrink-0" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="h-4 bg-gray-200 rounded w-14" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
