import { useMutation } from "@tanstack/react-query"
import { useAuth } from "@/contexts/auth-context"
import type { UpdateProfileRequest } from "@/service/api/auth"
import { authApi } from "../api/auth"
import type { LoginRequest, RegisterRequest } from "../api/auth"

export function useLoginMutation() {
  const { login } = useAuth()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
  })
}

export function useRegisterMutation() {
  const { register } = useAuth()

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
  })
}

export function useUpdateProfileMutation() {
  const { updateProfile } = useAuth()

  return useMutation({
    mutationKey: ["update-profile"],
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
  })
}

export function useChangePasswordMutation() {
  const { changePassword } = useAuth()

  return useMutation({
    mutationKey: ["change-password"],
    mutationFn: (data: { old_password: string; new_password: string; confirm_password: string }) =>
      changePassword(data),
  })
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationKey: ["forgot-password"],
    mutationFn: (email: string) => authApi.forgotPassword(email),
  })
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationKey: ["reset-password"],
    mutationFn: (data: { token: string; new_password: string }) => authApi.resetPassword(data),
  })
}

export function useLogoutMutation() {
  const { logout } = useAuth()

  return useMutation({
    mutationFn: () => logout(),
  })
}

export function useUploadFileMutation() {
  return useMutation({
    mutationKey: ["upload-file"],
    mutationFn: (args: { file: File }) => authApi.uploadFile(args.file),
  })
}
