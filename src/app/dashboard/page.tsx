export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ClipboardList, Briefcase, Send, PlusCircle, Search } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 text-green-700 border-green-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  delivered: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
  disputed: 'bg-red-100 text-red-700 border-red-200',
  cancelled: 'bg-gray-100 text-gray-400 border-gray-200',
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  delivered: 'Delivered',
  completed: 'Completed',
  disputed: 'Disputed',
  cancelled: 'Cancelled',
}

const APP_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-gray-100 text-gray-500 border-gray-200',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const [{ data: myTasks }, { data: myApplications }, { data: assignedTasks }] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('applications')
      .select('*, task:tasks(*)')
      .eq('freelancer_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tasks')
      .select('*')
      .eq('freelancer_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, <span className="font-medium text-gray-700">{profile?.full_name || 'there'}</span></p>
        </div>
        <div className="flex gap-3">
          <Link href="/profile">
            <Button variant="outline" size="sm">Edit Profile</Button>
          </Link>
          <Link href="/post-task">
            <Button size="sm">
              <PlusCircle className="w-4 h-4" />
              Post a Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tasks posted', value: myTasks?.length ?? 0, icon: <ClipboardList className="w-5 h-5 text-indigo-500" /> },
          { label: 'Active contracts', value: assignedTasks?.length ?? 0, icon: <Briefcase className="w-5 h-5 text-green-500" /> },
          { label: 'Applications sent', value: myApplications?.length ?? 0, icon: <Send className="w-5 h-5 text-blue-500" /> },
        ].map(({ label, value, icon }) => (
          <Card key={label} className="text-center">
            <CardContent className="pt-5 pb-4 space-y-2">
              <div className="flex justify-center">{icon}</div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tasks I posted */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-gray-500" />
              Tasks I posted
              {myTasks?.length ? <span className="text-sm font-normal text-gray-400">({myTasks.length})</span> : null}
            </CardTitle>
            <Link href="/post-task">
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                + New task
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!myTasks?.length ? (
            <div className="text-center py-10">
              <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500 mb-1">No tasks posted yet</p>
              <p className="text-xs text-gray-400 mb-4">Post your first task and get freelancers pitching you.</p>
              <Link href="/post-task">
                <Button size="sm">Post your first task</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {myTasks.map(task => (
                <Link key={task.id} href={`/tasks/${task.id}`} className="block">
                  <div className="flex items-center justify-between p-3.5 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-gray-200 transition-all">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{task.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">${task.budget} · {task.category}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border shrink-0 ml-3 ${STATUS_COLORS[task.status]}`}>
                      {STATUS_LABELS[task.status] ?? task.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tasks assigned to me */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-500" />
            Tasks I&apos;m working on
            {assignedTasks?.length ? <span className="text-sm font-normal text-gray-400">({assignedTasks.length})</span> : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!assignedTasks?.length ? (
            <div className="text-center py-10">
              <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500 mb-1">No active contracts</p>
              <p className="text-xs text-gray-400 mb-4">Apply to tasks to start earning.</p>
              <Link href="/tasks">
                <Button size="sm" variant="outline">
                  <Search className="w-4 h-4" />
                  Browse tasks
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {assignedTasks.map(task => (
                <Link key={task.id} href={`/tasks/${task.id}`} className="block">
                  <div className="flex items-center justify-between p-3.5 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-gray-200 transition-all">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{task.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">${task.budget} · {task.category}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border shrink-0 ml-3 ${STATUS_COLORS[task.status]}`}>
                      {STATUS_LABELS[task.status] ?? task.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-4 h-4 text-gray-500" />
            My Applications
            {myApplications?.length ? <span className="text-sm font-normal text-gray-400">({myApplications.length})</span> : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!myApplications?.length ? (
            <div className="text-center py-10">
              <Send className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500 mb-1">No applications yet</p>
              <p className="text-xs text-gray-400 mb-4">Find tasks that match your skills and apply.</p>
              <Link href="/tasks">
                <Button size="sm" variant="outline">
                  <Search className="w-4 h-4" />
                  Browse tasks
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {(myApplications as any[]).map((app) => (
                <Link key={app.id} href={`/tasks/${app.task_id}`} className="block">
                  <div className="flex items-center justify-between p-3.5 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-gray-200 transition-all">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{app.task?.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-sm">{app.message}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border shrink-0 ml-3 ${APP_STATUS_STYLES[app.status]}`}>
                      {app.status === 'accepted' ? 'Accepted' : app.status === 'rejected' ? 'Not selected' : 'Pending'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
