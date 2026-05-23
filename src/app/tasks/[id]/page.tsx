export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import TaskDetail from './task-detail'

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: task } = await supabase
    .from('tasks')
    .select('*, buyer:profiles!tasks_buyer_id_fkey(*), freelancer:profiles!tasks_freelancer_id_fkey(*)')
    .eq('id', id)
    .single()

  if (!task) notFound()

  const { data: applications } = await supabase
    .from('applications')
    .select('*, freelancer:profiles!applications_freelancer_id_fkey(*)')
    .eq('task_id', id)
    .order('created_at', { ascending: false })

  const { data: messages } = await supabase
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(*)')
    .eq('task_id', id)
    .order('created_at', { ascending: true })

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)')
    .eq('task_id', id)

  const userApplication = applications?.find(a => a.freelancer_id === user?.id)

  return (
    <TaskDetail
      task={task}
      applications={applications ?? []}
      messages={messages ?? []}
      reviews={reviews ?? []}
      currentUserId={user?.id ?? null}
      userApplication={userApplication ?? null}
    />
  )
}
