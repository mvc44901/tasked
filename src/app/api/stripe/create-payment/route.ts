import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId } = await req.json()

  const { data: task } = await supabase
    .from('tasks')
    .select('*, freelancer:profiles!tasks_freelancer_id_fkey(*)')
    .eq('id', taskId)
    .single()

  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  if (task.buyer_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (!task.freelancer_id) return NextResponse.json({ error: 'No freelancer assigned' }, { status: 400 })

  const freelancerProfile = task.freelancer
  if (!freelancerProfile?.stripe_account_id || !freelancerProfile?.stripe_onboarded) {
    return NextResponse.json({ error: 'Freelancer has not connected their Stripe account yet' }, { status: 400 })
  }

  const platformFeePercent = 0.10
  const amountCents = Math.round(task.budget * 100)
  const platformFeeCents = Math.round(amountCents * platformFeePercent)

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'link'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: task.title },
        unit_amount: amountCents,
      },
      quantity: 1,
    }],
    mode: 'payment',
    payment_intent_data: {
      application_fee_amount: platformFeeCents,
      transfer_data: { destination: freelancerProfile.stripe_account_id },
      capture_method: 'manual',
      metadata: { taskId },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/tasks/${taskId}?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tasks/${taskId}`,
    metadata: { taskId },
  })

  await supabase.from('tasks').update({ stripe_payment_intent_id: session.payment_intent as string }).eq('id', taskId)

  return NextResponse.json({ url: session.url })
}
