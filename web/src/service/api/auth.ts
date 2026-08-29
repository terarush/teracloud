import Cookies from "js-cookie"
import { apiClient, BASE_URL } from "../../lib/api-client"
import type { ApiErrorPayload } from "../../types"

// Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  first_name: string
  last_name?: string
  email: string
  password: string
  confirm_password: string
  username?: string
  role?: "admin" | "user"
}

export interface ChangePasswordRequest {
  old_password: string
  new_password: string
  confirm_password: string
}

export interface UpdateProfileRequest {
  first_name: string
  last_name?: string
  email: string
  username?: string
  avatar?: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: UserResponse
}

export interface UserResponse {
  id: number
  first_name: string
  last_name: string | null
  username?: string
  email: string
  avatar?: string
  role: string
  auth_provider?: string
  created_at: string
  updated_at: string
}

export interface ApiError {
  error: ApiErrorPayload
}

// Auth API functions
export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/register", data)
    const authData = response.data

    if (authData.access_token) {
      Cookies.set("accessToken", authData.access_token, { expires: 7 })
    }
    if (authData.refresh_token) {
      Cookies.set("refreshToken", authData.refresh_token, { expires: 30 })
    }

    return authData
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", data)
    const authData = response.data

    if (authData.access_token) {
      Cookies.set("accessToken", authData.access_token, { expires: 7 })
    }
    if (authData.refresh_token) {
      Cookies.set("refreshToken", authData.refresh_token, { expires: 30 })
    }

    return authData
  },

  getProfile: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>("/auth/profile")
    return response.data
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>("/auth/profile", data)
    return response.data
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post("/auth/change-password", data)
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/refresh", {
      refresh_token: refreshToken,
    })
    const authData = response.data

    if (authData.access_token) {
      Cookies.set("accessToken", authData.access_token, { expires: 7 })
    }

    return authData
  },

  verifyResetToken: async (token: string): Promise<void> => {
    await apiClient.get("/auth/verify-reset-token", { params: { token } })
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post("/auth/forgot-password", { email })
  },

  resetPassword: async (data: { token: string; new_password: string }): Promise<void> => {
    await apiClient.post("/auth/reset-password", data)
  },

  setUsername: async (username: string): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>("/auth/username", { username })
    return response.data
  },

  checkEmail: async (email: string): Promise<{ available: boolean }> => {
    const response = await apiClient.get<{ available: boolean }>("/auth/check-email", { params: { email } })
    return response.data
  },

  checkUsername: async (username: string): Promise<{ available: boolean }> => {
    const response = await apiClient.get<{ available: boolean }>("/auth/check-username", { params: { username } })
    return response.data
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout")
    } finally {
      Cookies.remove("accessToken")
      Cookies.remove("refreshToken")
      Cookies.remove("user_role")
    }
  },

  uploadFile: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file, file.name)
    const response = await apiClient.post<{ url: string }>("/auth/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    const resData = response.data as any
    const fileUrl = resData?.url || resData
    if (typeof fileUrl === "string" && fileUrl.startsWith("/")) {
      return `${BASE_URL}${fileUrl}`
    }
    return fileUrl
  },
}
