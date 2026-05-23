export type UserRole = 'buyer' | 'freelancer' | 'both'

export type TaskStatus = 'open' | 'in_progress' | 'delivered' | 'completed' | 'disputed' | 'cancelled'

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: UserRole
  bio: string | null
  stripe_account_id: string | null
  stripe_onboarded: boolean
  rating: number
  review_count: number
  created_at: string
}

export interface Task {
  id: string
  buyer_id: string
  title: string
  description: string
  category: string
  budget: number
  deadline: string | null
  status: TaskStatus
  freelancer_id: string | null
  stripe_payment_intent_id: string | null
  delivery_message: string | null
  delivery_file_url: string | null
  created_at: string
  buyer?: Profile
  freelancer?: Profile
}

export interface Application {
  id: string
  task_id: string
  freelancer_id: string
  message: string
  status: ApplicationStatus
  created_at: string
  freelancer?: Profile
  task?: Task
}

export interface Message {
  id: string
  task_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: Profile
}

export interface Review {
  id: string
  task_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment: string
  created_at: string
  reviewer?: Profile
}
