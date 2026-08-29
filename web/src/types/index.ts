export interface UserProfile {
  id: number
  first_name: string
  last_name: string | null
  username: string
  email: string
  role: string
  avatar?: string
  auth_provider: string
  created_at: string
  updated_at: string
}

export interface ApiErrorPayload {
  code?: string
  message?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: ApiErrorPayload | null
  status: number
}
