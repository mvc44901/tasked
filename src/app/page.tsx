import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Zap, Users } from 'lucide-react'

const CATEGORIES = [
  'Automation', 'Web Development', 'Design', 'Writing',
  'Data Entry', 'Video Editing', 'Marketing', 'Spreadsheets',
  'Research', 'AI / Prompting',
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6 border border-indigo-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            The opposite of Fiverr &amp; Upwork
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
            Post what you need.
            <br />
            <span className="text-indigo-600">Freelancers apply to you.</span>
          </h1>
          <p className="text-lg font-medium text-gray-700 mb-3 max-w-xl mx-auto">
            On Fiverr you hunt for someone. On Tasked, they compete for your job.
          </p>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Describe your task, set your budget, and let skilled freelancers pitch you.
            Review their proposals, pick your favourite, and pay safely through escrow.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/post-task">
              <Button size="lg" className="text-base px-8 h-12 gap-2">
                Post a Task — It&apos;s Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/tasks">
              <Button size="lg" variant="outline" className="text-base px-8 h-12">
                I&apos;m a Freelancer
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-sm text-gray-400">No credit card needed to post. No subscription, ever.</p>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How Tasked works</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Three simple steps from posting to done.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              icon: <Zap className="w-5 h-5 text-indigo-600" />,
              title: 'Post your task',
              desc: "Describe what you need, set your budget, and pick a deadline. Completely free to post.",
            },
            {
              step: '2',
              icon: <Users className="w-5 h-5 text-indigo-600" />,
              title: 'Freelancers pitch you',
              desc: "Skilled freelancers apply with a message about how they'll do the work. You review and pick the best.",
            },
            {
              step: '3',
              icon: <Shield className="w-5 h-5 text-indigo-600" />,
              title: 'Pay & get it done',
              desc: "Pay into escrow. Your money is held safely until you approve the work, then released to the freelancer.",
            },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="relative p-7 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
                  {icon}
                </div>
                <span className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">Step {step}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust bar */}
      <div className="border-y bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
            {[
              { label: 'Secure escrow', sub: 'Powered by Stripe' },
              { label: '10% platform fee', sub: 'Only when work is done' },
              { label: 'Dispute protection', sub: 'We review every dispute' },
            ].map(({ label, sub }) => (
              <div key={label} className="text-center py-5 px-6">
                <p className="font-semibold text-gray-800">{label}</p>
                <p className="text-sm text-gray-500 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Popular categories</h2>
          <p className="text-gray-500">Find tasks that match your skills.</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {CATEGORIES.map(cat => (
            <Link key={cat} href={`/tasks?category=${encodeURIComponent(cat)}`}>
              <span className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer shadow-sm">
                {cat}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-indigo-600 border-t">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-indigo-200 mb-8 max-w-lg mx-auto">
            Post your first task in under 2 minutes. No credit card needed until you hire.
          </p>
          <Link href="/post-task">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 text-base px-8 h-12 font-semibold">
              Post a Task — It&apos;s Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
