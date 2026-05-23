export default function TaskLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl ring-1 ring-foreground/10 bg-card p-6 space-y-4 animate-pulse">
            <div className="flex items-start justify-between gap-3">
              <div className="h-6 bg-gray-200 rounded w-2/3" />
              <div className="h-5 bg-gray-200 rounded w-16" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
          <div className="rounded-xl ring-1 ring-foreground/10 bg-card p-6 space-y-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-32" />
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-3">
                  <div className="h-9 w-9 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl ring-1 ring-foreground/10 bg-card p-6 space-y-4 animate-pulse">
            <div className="h-7 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-28" />
            <div className="h-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
