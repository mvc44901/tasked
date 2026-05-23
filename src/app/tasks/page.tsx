export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Task } from '@/lib/types'
import { Search, PlusCircle } from 'lucide-react'

const CATEGORIES = ['All', 'Automation', 'Web Development', 'Design', 'Writing', 'Data Entry', 'Video Editing', 'Marketing', 'Spreadsheets', 'Research', 'AI / Prompting', 'Other']

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const { category, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('tasks')
    .select('*, buyer:profiles!tasks_buyer_id_fkey(*), applications(count)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (category && category !== 'All') {
    query = query.eq('category', category)
  }
  if (q) {
    query = query.ilike('title', `%${q}%`)
  }

  const { data: tasks } = await query

  const hasFilters = !!(category && category !== 'All') || !!q

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Tasks</h1>
          {tasks && (
            <p className="text-gray-500 text-sm mt-1">
              {tasks.length} open task{tasks.length !== 1 ? 's' : ''}
              {hasFilters ? ' matching your filters' : ''}
            </p>
          )}
        </div>
        <Link
          href="/post-task"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Post a Task
        </Link>
      </div>

      {/* Search */}
      <form className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search tasks..."
          className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"
        />
        {q && (
          <Link
            href={category && category !== 'All' ? `/tasks?category=${encodeURIComponent(category)}` : '/tasks'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <Link
            key={cat}
            href={cat === 'All' ? (q ? `/tasks?q=${encodeURIComponent(q)}` : '/tasks') : `/tasks?category=${encodeURIComponent(cat)}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
          >
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              (category === cat) || (!category && cat === 'All')
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}>
              {cat}
            </span>
          </Link>
        ))}
      </div>

      {/* Task grid */}
      {!tasks?.length ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No tasks found</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            {hasFilters
              ? 'Try adjusting your search or filters to find more tasks.'
              : 'No open tasks yet. Be the first to post one!'}
          </p>
          <div className="flex gap-3 justify-center">
            {hasFilters && (
              <Link href="/tasks" className="text-indigo-600 hover:underline text-sm font-medium">
                Clear filters
              </Link>
            )}
            <Link href="/post-task" className="text-indigo-600 hover:underline text-sm font-medium">
              Post a task
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task: Task & { buyer: any; applications: any[] }) => {
            const applicationCount = Array.isArray(task.applications)
              ? (task.applications[0] as any)?.count ?? task.applications.length
              : 0
            return (
              <Link key={task.id} href={`/tasks/${task.id}`}>
                <Card className="hover:shadow-md transition-all hover:ring-indigo-200 cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-snug font-semibold text-gray-900 line-clamp-2">
                        {task.title}
                      </CardTitle>
                      <Badge variant="secondary" className="shrink-0 text-xs">{task.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">{task.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-indigo-600 text-base">${task.budget}</span>
                      <span className="text-gray-400 text-xs">
                        {task.deadline ? `Due ${new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'No deadline'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        by <span className="font-medium text-gray-600">{task.buyer?.full_name || 'Anonymous'}</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        {applicationCount} applicant{applicationCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
