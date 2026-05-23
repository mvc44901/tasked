'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Shield } from 'lucide-react'

const CATEGORIES = ['Automation', 'Web Development', 'Design', 'Writing', 'Data Entry', 'Video Editing', 'Marketing', 'Spreadsheets', 'Research', 'AI / Prompting', 'Other']

export default function PostTaskPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    deadline: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  function validate() {
    const newErrors: Record<string, string> = {}
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (!form.description.trim()) newErrors.description = 'Description is required'
    if (form.description.trim().length < 20) newErrors.description = 'Please describe your task in at least 20 characters'
    if (!form.category) newErrors.category = 'Please select a category'
    if (!form.budget || parseFloat(form.budget) < 5) newErrors.budget = 'Budget must be at least $5'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    if (!supabase) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('You must be logged in to post a task')
      router.push('/login')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.from('tasks').insert({
      buyer_id: user.id,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      budget: parseFloat(form.budget),
      deadline: form.deadline || null,
    }).select().single()

    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Task posted! Freelancers will start applying soon.')
      router.push(`/tasks/${data.id}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a Task</h1>
        <p className="text-gray-500">Describe what you need and get pitches from skilled freelancers.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">Task title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="e.g. Build a Python script to scrape product data from Amazon"
                value={form.title}
                onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(err => ({ ...err, title: '' })) }}
                aria-invalid={!!errors.title}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                placeholder="Describe exactly what you need done. Include any specific requirements, file formats, tools, or references. The more detail, the better pitches you'll get."
                value={form.description}
                onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setErrors(err => ({ ...err, description: '' })) }}
                rows={6}
                className="resize-none"
                aria-invalid={!!errors.description}
              />
              {errors.description ? (
                <p className="text-xs text-red-500">{errors.description}</p>
              ) : (
                <p className="text-xs text-gray-400">{form.description.length} characters — aim for 100+</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Category <span className="text-red-500">*</span></Label>
              <Select
                onValueChange={(val: string | null) => { setForm(f => ({ ...f, category: val ?? '' })); setErrors(err => ({ ...err, category: '' })) }}
              >
                <SelectTrigger className="w-full" aria-invalid={!!errors.category}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="budget">Budget (USD) <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <Input
                    id="budget"
                    type="number"
                    min="5"
                    step="1"
                    placeholder="50"
                    value={form.budget}
                    onChange={e => { setForm(f => ({ ...f, budget: e.target.value })); setErrors(err => ({ ...err, budget: '' })) }}
                    className="pl-6"
                    aria-invalid={!!errors.budget}
                  />
                </div>
                {errors.budget && <p className="text-xs text-red-500">{errors.budget}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deadline">Deadline <span className="text-gray-400 font-normal text-xs">(optional)</span></Label>
                <Input
                  id="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 flex gap-3 items-start">
              <Shield className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-500 leading-relaxed">
                Payment is held in escrow and only released when you approve the work.
                We take a 10% platform fee — only charged on successful completion.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Posting task...</>
              ) : (
                'Post Task'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
