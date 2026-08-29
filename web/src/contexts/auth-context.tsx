import React, { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import Cookies from "js-cookie"
import { authApi } from "@/service/api/auth"
import type { UserResponse, LoginRequest, RegisterRequest, UpdateProfileRequest } from "@/service/api/auth"

interface AuthContextType {
  user: UserResponse | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile: (data: UpdateProfileRequest) => Promise<void>
  changePassword: (data: { old_password: string; new_password: string; confirm_password: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  const isAuthenticated = !!user && !!Cookies.get("accessToken")

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      const accessToken = Cookies.get("accessToken")
      const refreshToken = Cookies.get("refreshToken")

      if (accessToken) {
        try {
          const userProfile = await authApi.getProfile()
          if (mounted) {
            setUser(userProfile)
            Cookies.set("user_role", userProfile.role, { expires: 7 })
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error)
        }
      } else if (refreshToken) {
        try {
          await authApi.refreshToken(refreshToken)
          const userProfile = await authApi.getProfile()
          if (mounted) {
            setUser(userProfile)
            Cookies.set("user_role", userProfile.role, { expires: 7 })
          }
        } catch (error) {
          console.error("Failed to refresh token during init:", error)
        }
      }

      if (mounted) {
        setIsInitializing(false)
      }
    }

    initAuth()

    return () => {
      mounted = false
    }
  }, [])

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true)
    try {
      const response = await authApi.login(credentials)
      setUser(response.user)
      Cookies.set("user_role", response.user.role, { expires: 7 })
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterRequest) => {
    setIsLoading(true)
    try {
      const response = await authApi.register(data)
      setUser(response.user)
      Cookies.set("user_role", response.user.role, { expires: 7 })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authApi.logout()
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      setUser(null)
      Cookies.remove("accessToken")
      Cookies.remove("refreshToken")
      Cookies.remove("user_role")
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const userProfile = await authApi.getProfile()
      setUser(userProfile)
      Cookies.set("user_role", userProfile.role, { expires: 7 })
    } catch (error) {
      console.error("Failed to refresh user:", error)
    }
  }

  const updateProfile = async (data: UpdateProfileRequest) => {
    setIsLoading(true)
    try {
      const updatedUser = await authApi.updateProfile(data)
      setUser(updatedUser)
    } finally {
      setIsLoading(false)
    }
  }

  const changePassword = async (data: { old_password: string; new_password: string; confirm_password: string }) => {
    setIsLoading(true)
    try {
      await authApi.changePassword(data)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || isInitializing,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
