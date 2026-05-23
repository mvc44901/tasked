export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-36 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-8 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-28 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {[1, 2, 3].map(section => (
        <div key={section} className="rounded-xl ring-1 ring-foreground/10 bg-card p-6 space-y-4 animate-pulse">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                  <div className="h-3 w-28 bg-gray-200 rounded" />
                </div>
                <div className="h-5 w-20 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
