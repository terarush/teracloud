import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { translateApiError } from "@/lib/translate-error"

export function useProfile() {
  const { user, updateProfile, changePassword } = useAuth()
  const { t } = useTranslation()

  // Profile form state
  const [firstName, setFirstName] = useState(user?.first_name ?? "")
  const [lastName, setLastName] = useState(user?.last_name ?? "")
  const [username, setUsername] = useState(user?.username ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [avatar, setAvatar] = useState(user?.avatar ?? "")

  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Password form state
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName || undefined,
        username: username || undefined,
        email,
        avatar: avatar || undefined,
      })
      toast.success(t("profile.saved", "Profile updated successfully"))
    } catch (err) {
      const msg = translateApiError(err, t) || t("profile.saveFailed", "Failed to update profile")
      toast.error(msg)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error(t("profile.passwordsDontMatch", "Passwords do not match"))
      return
    }
    setIsChangingPassword(true)
    try {
      await changePassword({ old_password: oldPassword, new_password: newPassword, confirm_password: confirmPassword })
      toast.success(t("profile.passwordChanged", "Password changed successfully"))
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      const msg = translateApiError(err, t) || t("profile.changePasswordFailed", "Failed to change password")
      toast.error(msg)
    } finally {
      setIsChangingPassword(false)
    }
  }

  return {
    user,
    form: {
      firstName, setFirstName,
      lastName, setLastName,
      username, setUsername,
      email, setEmail,
      avatar, setAvatar,
    },
    isSavingProfile,
    handleSaveProfile,
    isChangingPassword,
    oldPassword, setOldPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    handleChangePassword,
  }
}
