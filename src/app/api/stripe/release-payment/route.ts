import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId } = await req.json()

  const { data: task } = await supabase.from('tasks').select('*').eq('id', taskId).single()
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  if (task.buyer_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (!task.stripe_payment_intent_id) return NextResponse.json({ error: 'No payment found' }, { status: 400 })

  await stripe.paymentIntents.capture(task.stripe_payment_intent_id)

  await supabase.from('tasks').update({ status: 'completed' }).eq('id', taskId)

  return NextResponse.json({ ok: true })
}
