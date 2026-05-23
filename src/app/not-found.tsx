import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-bold text-indigo-600 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button>Go home</Button>
        </Link>
        <Link href="/tasks">
          <Button variant="outline">Browse tasks</Button>
        </Link>
      </div>
    </div>
  )
}
