'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Task, Application, Message, Review, Profile } from '@/lib/types'
import { Star, Calendar, DollarSign, Send, Loader2, CheckCircle, Clock, Users, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

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
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-gray-100 text-gray-500',
}

interface Props {
  task: Task & { buyer: any; freelancer: any }
  applications: (Application & { freelancer: any })[]
  messages: (Message & { sender: any })[]
  reviews: (Review & { reviewer: any })[]
  currentUserId: string | null
  userApplication: (Application & { freelancer: any }) | null
  currentUserProfile: Profile | null
}

export default function TaskDetail({ task, applications, messages, reviews, currentUserId, userApplication, currentUserProfile }: Props) {
  const [appMessage, setAppMessage] = useState('')
  const [msgContent, setMsgContent] = useState('')
  const [deliveryMessage, setDeliveryMessage] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingMsg, setSendingMsg] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router = useRouter()

  const isBuyer = currentUserId === task.buyer_id
  const isFreelancer = currentUserId === task.freelancer_id
  const isParticipant = isBuyer || isFreelancer
  const hasReviewed = reviews.some(r => r.reviewer_id === currentUserId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function applyToTask() {
    if (!currentUserId) {
      router.push('/login?message=Sign+in+to+apply+for+tasks')
      return
    }
    if (!supabase || !appMessage.trim()) return
    setLoading(true)
    const { error } = await supabase.from('applications').insert({
      task_id: task.id,
      freelancer_id: currentUserId,
      message: appMessage,
    })
    if (error) toast.error(error.message)
    else {
      toast.success('Application sent!')
      setAppMessage('')
      router.refresh()
    }
    setLoading(false)
  }

  async function acceptApplication(applicationId: string, freelancerId: string) {
    if (!supabase) return
    setLoading(true)
    const { error: appErr } = await supabase
      .from('applications')
      .update({ status: 'accepted' })
      .eq('id', applicationId)

    if (appErr) { toast.error(appErr.message); setLoading(false); return }

    await supabase.from('applications').update({ status: 'rejected' }).eq('task_id', task.id).neq('id', applicationId)

    const { error: taskErr } = await supabase
      .from('tasks')
      .update({ freelancer_id: freelancerId, status: 'in_progress' })
      .eq('id', task.id)

    if (taskErr) toast.error(taskErr.message)
    else { toast.success('Freelancer accepted! Proceed to payment.'); router.refresh() }
    setLoading(false)
  }

  async function sendMessage() {
    if (!supabase || !msgContent.trim()) return
    setSendingMsg(true)
    const { error } = await supabase.from('messages').insert({
      task_id: task.id,
      sender_id: currentUserId,
      content: msgContent,
    })
    if (error) toast.error(error.message)
    else { setMsgContent(''); router.refresh() }
    setSendingMsg(false)
  }

  async function deliverWork() {
    if (!supabase || !deliveryMessage.trim()) return
    setLoading(true)
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'delivered', delivery_message: deliveryMessage })
      .eq('id', task.id)
    if (error) toast.error(error.message)
    else { toast.success('Work delivered!'); router.refresh() }
    setLoading(false)
  }

  async function approveDelivery() {
    setLoading(true)
    const res = await fetch('/api/stripe/release-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task.id }),
    })
    const data = await res.json()
    if (!res.ok) toast.error(data.error)
    else { toast.success('Payment released! Task complete.'); router.refresh() }
    setLoading(false)
  }

  async function disputeTask() {
    if (!supabase) return
    setLoading(true)
    const { error } = await supabase.from('tasks').update({ status: 'disputed' }).eq('id', task.id)
    if (error) toast.error(error.message)
    else { toast.success("Dispute opened. We'll review and get back to you."); router.refresh() }
    setLoading(false)
  }

  async function initiatePayment() {
    setLoading(true)
    const res = await fetch('/api/stripe/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task.id }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); setLoading(false) }
    else window.location.href = data.url
  }

  async function submitReview(revieweeId: string) {
    if (!supabase || !reviewComment.trim()) return
    setLoading(true)
    const { error } = await supabase.from('reviews').insert({
      task_id: task.id,
      reviewer_id: currentUserId,
      reviewee_id: revieweeId,
      rating: reviewRating,
      comment: reviewComment,
    })
    if (error) toast.error(error.message)
    else { toast.success('Review submitted!'); router.refresh() }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Task header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-xl font-bold leading-snug">{task.title}</CardTitle>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border shrink-0 ${STATUS_COLORS[task.status]}`}>
                  {STATUS_LABELS[task.status] ?? task.status}
                </span>
              </div>
              <Badge variant="secondary" className="w-fit">{task.category}</Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{task.description}</p>

              {/* Delivery notice */}
              {task.delivery_message && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 mb-1">Work submitted for review</p>
                    <p className="text-sm text-amber-700 leading-relaxed">{task.delivery_message}</p>
                  </div>
                </div>
              )}

              {/* Buyer actions */}
              {isBuyer && task.status === 'in_progress' && !task.stripe_payment_intent_id && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-800 mb-3">
                    Your freelancer is ready to start. Pay into escrow to begin.
                  </p>
                  <Button onClick={initiatePayment} disabled={loading} className="w-full">
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : (
                      <>Pay ${task.budget} into Escrow</>
                    )}
                  </Button>
                </div>
              )}
              {isBuyer && task.status === 'delivered' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-green-800">
                    The freelancer has submitted their work. Review and approve to release payment.
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={approveDelivery} disabled={loading} className="flex-1">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Approve & Release Payment
                    </Button>
                    <Button onClick={disputeTask} disabled={loading} variant="destructive" className="flex-1">
                      Open Dispute
                    </Button>
                  </div>
                </div>
              )}

              {/* Freelancer deliver */}
              {isFreelancer && task.status === 'in_progress' && (
                <div className="border rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700">Ready to submit your work?</p>
                  <Textarea
                    placeholder="Describe what you've completed, include any links, credentials, or notes for the buyer..."
                    value={deliveryMessage}
                    onChange={e => setDeliveryMessage(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <Button
                    onClick={deliverWork}
                    disabled={loading || !deliveryMessage.trim()}
                    className="w-full"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Delivery'}
                  </Button>
                </div>
              )}

              {/* Review */}
              {task.status === 'completed' && isParticipant && !hasReviewed && (
                <div className="border rounded-lg p-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-800">Leave a review</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setReviewRating(n)}
                        className={`transition-colors ${n <= reviewRating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-300'}`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Share your experience working with this person..."
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <Button
                    onClick={() => submitReview(isBuyer ? task.freelancer_id! : task.buyer_id)}
                    disabled={loading || !reviewComment.trim()}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Submit Review
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Applications — visible to buyer when open */}
          {isBuyer && task.status === 'open' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  Applications
                  <span className="ml-auto text-xs font-normal text-gray-400">{applications.length} total</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!applications.length ? (
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">No applications yet</p>
                    <p className="text-xs text-gray-400 mt-1">Freelancers will apply soon</p>
                  </div>
                ) : (
                  applications.map(app => (
                    <div key={app.id} className="flex gap-3 border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={app.freelancer?.avatar_url} />
                        <AvatarFallback className="text-sm font-medium">{app.freelancer?.full_name?.[0] ?? '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{app.freelancer?.full_name}</p>
                          {app.freelancer?.rating > 0 && (
                            <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {Number(app.freelancer.rating).toFixed(1)}
                              <span className="text-gray-300">({app.freelancer.review_count})</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">{app.message}</p>
                        {app.status === 'pending' ? (
                          <Button
                            size="sm"
                            onClick={() => acceptApplication(app.id, app.freelancer_id)}
                            disabled={loading}
                          >
                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            Accept Freelancer
                          </Button>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${APP_STATUS_STYLES[app.status]}`}>
                            {app.status === 'accepted' ? 'Accepted' : 'Not selected'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* Apply — visible to non-buyer when open */}
          {!isBuyer && task.status === 'open' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {userApplication ? 'Your Application' : 'Apply to this Task'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!currentUserId ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500 mb-4">Sign in to apply for this task.</p>
                    <Link href={`/login?message=Sign+in+to+apply+for+tasks`}>
                      <Button>Sign in to Apply</Button>
                    </Link>
                  </div>
                ) : userApplication ? (
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 leading-relaxed">{userApplication.message}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${APP_STATUS_STYLES[userApplication.status]}`}>
                      {userApplication.status === 'accepted' ? 'Accepted — waiting for payment' :
                       userApplication.status === 'rejected' ? 'Not selected' : 'Pending review'}
                    </span>
                  </div>
                ) : !currentUserProfile?.stripe_onboarded ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-800 mb-1">Stripe account required</p>
                      <p className="text-sm text-amber-700 leading-relaxed mb-3">
                        You need to connect your Stripe account to receive payments before you can apply.
                      </p>
                      <Link href="/profile">
                        <Button size="sm" variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
                          Connect Stripe on your profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Tell the buyer why you're the right person for this task. Mention your relevant experience, approach, and availability..."
                      value={appMessage}
                      onChange={e => setAppMessage(e.target.value)}
                      rows={5}
                      className="resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">{appMessage.length} chars</p>
                      <Button
                        onClick={applyToTask}
                        disabled={loading || !appMessage.trim()}
                      >
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Application'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Messaging — only between buyer and assigned freelancer */}
          {isParticipant && task.freelancer_id && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto mb-4 pr-1">
                  {!messages.length ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isOwn = msg.sender_id === currentUserId
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                        >
                          <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                            <AvatarImage src={msg.sender?.avatar_url} />
                            <AvatarFallback className="text-xs">{msg.sender?.full_name?.[0] ?? '?'}</AvatarFallback>
                          </Avatar>
                          <div className={`max-w-[70%] space-y-1 ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isOwn
                                ? 'bg-indigo-600 text-white rounded-tr-sm'
                                : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                            }`}>
                              {msg.content}
                            </div>
                            <p className="text-xs text-gray-400 px-1">
                              {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                {task.status !== 'completed' && task.status !== 'cancelled' && (
                  <div className="flex gap-2 items-end border-t pt-4">
                    <Textarea
                      placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
                      value={msgContent}
                      onChange={e => setMsgContent(e.target.value)}
                      rows={2}
                      className="resize-none flex-1"
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={sendingMsg || !msgContent.trim()}
                      size="icon"
                      className="h-10 w-10 shrink-0"
                    >
                      {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-baseline gap-1">
                <DollarSign className="w-5 h-5 text-indigo-500 shrink-0" />
                <span className="text-2xl font-bold text-gray-900">${task.budget}</span>
                <span className="text-sm text-gray-400 ml-1">fixed</span>
              </div>
              {task.deadline && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Due {new Date(task.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )}
              {task.status === 'open' && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>{applications.length} applicant{applications.length !== 1 ? 's' : ''}</span>
                </div>
              )}
              <Separator />
              <div>
                <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">Posted by</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={task.buyer?.avatar_url} />
                    <AvatarFallback>{task.buyer?.full_name?.[0] ?? '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{task.buyer?.full_name}</p>
                    {task.buyer?.rating > 0 && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {Number(task.buyer.rating).toFixed(1)} rating
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {task.freelancer && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">Assigned freelancer</p>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={task.freelancer?.avatar_url} />
                        <AvatarFallback>{task.freelancer?.full_name?.[0] ?? '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{task.freelancer?.full_name}</p>
                        {task.freelancer?.rating > 0 && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {Number(task.freelancer.rating).toFixed(1)} rating
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          {reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{r.comment}</p>
                    <p className="text-xs text-gray-400">by {r.reviewer?.full_name}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
