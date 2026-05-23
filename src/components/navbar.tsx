'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Profile } from '@/lib/types'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data }) => { setProfile(data); setLoading(false) })
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') { setProfile(null); setLoading(false) }
      if (event === 'SIGNED_IN' && session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data))
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    setProfile(null)
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) => pathname === href

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
          <span className="text-lg font-bold text-gray-900">Tasked</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/tasks">
            <Button
              variant="ghost"
              className={isActive('/tasks') ? 'text-indigo-600 bg-indigo-50' : ''}
            >
              Browse Tasks
            </Button>
          </Link>

          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse ml-2" />
          ) : profile ? (
            <>
              <Link href="/post-task">
                <Button className="ml-1">Post a Task</Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="ml-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
                  <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-indigo-200 transition-all">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-medium">
                      {profile.full_name?.[0] ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-2 border-b mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{profile.full_name}</p>
                    <p className="text-xs text-gray-400 truncate">{profile.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    Profile & Payouts
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} variant="destructive">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button className="ml-1">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
