'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Profile } from '@/lib/types'
import { Suspense } from 'react'
import { Loader2, CheckCircle, ExternalLink, Star } from 'lucide-react'

function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 rounded" />
      <div className="rounded-xl ring-1 ring-foreground/10 bg-card p-6 space-y-4">
        <div className="h-5 w-24 bg-gray-200 rounded" />
        <div className="space-y-3">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-8 bg-gray-200 rounded-lg" />
          <div className="h-4 w-12 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded-lg" />
        </div>
      </div>
      <div className="rounded-xl ring-1 ring-foreground/10 bg-card p-6 space-y-4">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-8 w-40 bg-gray-200 rounded-lg" />
      </div>
    </div>
  )
}

function ProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [initialLoad, setInitialLoad] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!supabase) { router.push('/login'); return }
    const client = supabase
    client.auth.getUser().then((res) => {
      const user = res.data?.user
      if (!user) { router.push('/login'); return }
      client.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        setProfile(data)
        setInitialLoad(false)
      })
    })

    if (searchParams.get('stripe') === 'connected') {
      toast.success('Stripe account connected! You can now receive payments.')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!profile || !supabase) return
    const client = supabase
    setSaving(true)
    const { error } = await client
      .from('profiles')
      .update({ full_name: profile.full_name, bio: profile.bio })
      .eq('id', profile.id)
    if (error) toast.error(error.message)
    else toast.success('Profile saved!')
    setSaving(false)
  }

  if (initialLoad) return <ProfileSkeleton />

  if (!profile) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account information and Stripe payouts.</p>
      </div>

      {/* Avatar + stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl font-semibold bg-indigo-100 text-indigo-700">
                {profile.full_name?.[0] ?? '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{profile.full_name}</p>
              <p className="text-sm text-gray-400">{profile.email}</p>
              {profile.rating > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600 font-medium">{Number(profile.rating).toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({profile.review_count} review{profile.review_count !== 1 ? 's' : ''})</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullname">Full name</Label>
              <Input
                id="fullname"
                value={profile.full_name}
                onChange={e => setProfile(p => p ? { ...p, full_name: e.target.value } : p)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio ?? ''}
                onChange={e => setProfile(p => p ? { ...p, bio: e.target.value } : p)}
                placeholder="Tell buyers and freelancers what you do and what you're great at..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-400">This shows up on your applications and task listings.</p>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stripe Payouts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            Connect your Stripe account to receive payments when you complete tasks.
            We take a <strong>10% platform fee</strong>, charged only on successful completion.
          </p>
          {profile.stripe_onboarded ? (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Stripe connected</p>
                <p className="text-xs text-green-600">You can receive payments for completed tasks.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <p className="text-sm text-amber-800 font-medium">Stripe not connected</p>
                <p className="text-xs text-amber-700 mt-0.5">You won't be able to receive payments until you connect Stripe.</p>
              </div>
              <a href="/api/stripe/connect">
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Connect Stripe Account
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileForm />
    </Suspense>
  )
}
